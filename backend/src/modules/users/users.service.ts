import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { UserActivity } from '../../database/entities/user-activity.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserFilterDto } from './dto/user-filter.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole, UserStatus, ActivityType } from '../../common/enums';
import { ERROR_CODES } from '../../common/constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

  private readonly profileRelations = [
    'profile',
    'professionalDetail',
    'educationDetails',
    'familyDetail',
    'lifestyleDetail',
    'languages',
    'horoscopeDetail',
    'photos',
    'partnerPreference',
  ];

  async findById(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { uuid },
      relations: this.profileRelations,
    });
  }

  async findByIdOrFail(uuid: string): Promise<User> {
    const user = await this.findById(uuid);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'uuid',
        'email',
        'passwordHash',
        'firstName',
        'lastName',
        'role',
        'status',
        'emailVerifiedAt',
        'phoneVerifiedAt',
        'isTwoFactorEnabled',
        'twoFactorSecret',
        'lastLoginAt',
      ],
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException({
        success: false,
        message: 'Email is already registered',
        error: ERROR_CODES.USER_ALREADY_EXISTS,
        statusCode: 409,
      });
    }

    const user = this.userRepository.create({
      uuid: uuidv4(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone || null,
      passwordHash: dto.passwordHash,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth || null,
      role: dto.role || UserRole.USER,
      status: dto.status || UserStatus.ACTIVE,
      emailVerifiedAt: dto.isEmailVerified ? new Date() : null,
    });

    const saved = await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      userId: saved.id,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth || null,
    });
    await this.profileRepository.save(profile);

    return this.findById(saved.uuid) as Promise<User>;
  }

  async update(uuid: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findByIdOrFail(uuid);

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.email !== undefined) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.uuid !== uuid) {
        throw new ConflictException({
          success: false,
          message: 'Email is already in use',
          error: ERROR_CODES.USER_ALREADY_EXISTS,
          statusCode: 409,
        });
      }
      user.email = dto.email;
    }
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) user.dateOfBirth = dto.dateOfBirth;

    await this.userRepository.save(user);

    if (dto.profile) {
      await this.profileRepository.upsert(
        { userId: user.id, ...dto.profile } as any,
        ['userId'],
      );
    }

    return this.findById(uuid) as Promise<User>;
  }

  async updatePassword(uuid: string, hashedPassword: string): Promise<void> {
    const user = await this.findByIdOrFail(uuid);
    user.passwordHash = hashedPassword;
    await this.userRepository.save(user);
  }

  async softDelete(uuid: string): Promise<void> {
    const user = await this.findByIdOrFail(uuid);
    user.status = UserStatus.DELETED;
    await this.userRepository.softRemove(user);
  }

  async restore(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { uuid },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    user.status = UserStatus.ACTIVE;
    await this.userRepository.recover(user);

    return this.findById(uuid) as Promise<User>;
  }

  async getProfile(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { uuid },
      relations: [
        ...this.profileRelations,
        'videos',
        'sentInterests',
        'receivedInterests',
        'subscriptions',
        'deviceTokens',
      ],
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    return user;
  }

  async searchUsers(filters: UserFilterDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      gender,
      ageMin,
      ageMax,
      religion,
      motherTongue,
      country,
      state,
      city,
      maritalStatus,
      diet,
      smoking,
      drinking,
      minIncome,
      maxIncome,
      hasPhoto,
      isVerified,
      query,
    } = filters;

    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.professionalDetail', 'professionalDetail')
      .leftJoinAndSelect('user.educationDetails', 'educationDetails')
      .leftJoinAndSelect('user.familyDetail', 'familyDetail')
      .leftJoinAndSelect('user.lifestyleDetail', 'lifestyleDetail')
      .leftJoinAndSelect('user.photos', 'photos')
      .where('user.status = :status', { status: UserStatus.ACTIVE });

    if (gender) {
      qb.andWhere('user.gender = :gender', { gender });
    }

    if (ageMin) {
      qb.andWhere('profile.age >= :ageMin', { ageMin });
    }

    if (ageMax) {
      qb.andWhere('profile.age <= :ageMax', { ageMax });
    }

    if (religion) {
      qb.andWhere('profile.religion = :religion', { religion });
    }

    if (motherTongue) {
      qb.andWhere('profile.motherTongue = :motherTongue', { motherTongue });
    }

    if (country) {
      qb.andWhere('profile.country = :country', { country });
    }

    if (state) {
      qb.andWhere('profile.state = :state', { state });
    }

    if (city) {
      qb.andWhere('profile.city = :city', { city });
    }

    if (maritalStatus) {
      qb.andWhere('profile.maritalStatus = :maritalStatus', { maritalStatus });
    }

    if (diet) {
      qb.andWhere('lifestyleDetail.diet = :diet', { diet });
    }

    if (smoking) {
      qb.andWhere('lifestyleDetail.smoking = :smoking', { smoking });
    }

    if (drinking) {
      qb.andWhere('lifestyleDetail.drinking = :drinking', { drinking });
    }

    if (minIncome !== undefined) {
      qb.andWhere('professionalDetail.annualIncome >= :minIncome', {
        minIncome,
      });
    }

    if (maxIncome !== undefined) {
      qb.andWhere('professionalDetail.annualIncome <= :maxIncome', {
        maxIncome,
      });
    }

    if (hasPhoto) {
      qb.andWhere('photos.id IS NOT NULL');
    }

    if (isVerified) {
      qb.andWhere('user.emailVerifiedAt IS NOT NULL');
    }

    if (query) {
      qb.andWhere(
        new Brackets((sub) => {
          sub.where('user.firstName LIKE :query', { query: `%${query}%` });
          sub.orWhere('user.lastName LIKE :query', { query: `%${query}%` });
          sub.orWhere('user.email LIKE :query', { query: `%${query}%` });
        }),
      );
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName'];
    const orderField = allowedSortFields.includes(sortBy) ? `user.${sortBy}` : 'user.createdAt';

    qb.orderBy(orderField, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Users retrieved successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUserActivity(uuid: string, pagination: PaginationDto) {
    const user = await this.findByIdOrFail(uuid);

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;

    const allowedSortFields = ['createdAt', 'activityType'];
    const orderField = allowedSortFields.includes(sortBy)
      ? `ua.${sortBy}`
      : 'ua.createdAt';

    const skip = (page - 1) * limit;

    const [data, total] = await this.userActivityRepository.findAndCount({
      where: { userId: user.id },
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Activity log retrieved successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateSettings(uuid: string, settings: Record<string, any>): Promise<Profile> {
    const user = await this.findByIdOrFail(uuid);

    const profile = await this.profileRepository.findOne({
      where: { userId: user.id },
    });

    if (!profile) {
      throw new NotFoundException({
        success: false,
        message: 'Profile not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    const privacyFields = ['hideProfile', 'hidePhotos', 'hideContact', 'privateMode'];
    for (const field of privacyFields) {
      if (settings[field] !== undefined) {
        (profile as any)[field] = settings[field];
      }
    }

    if (settings.notifications !== undefined) {
      await this.userRepository.update(user.id, {
        deviceInfo: {
          ...(typeof user.deviceInfo === 'object' && user.deviceInfo !== null
            ? user.deviceInfo
            : {}),
          notifications: settings.notifications,
        },
      });
    }

    if (settings.theme !== undefined) {
      await this.userRepository.update(user.id, { theme: settings.theme });
    }

    return this.profileRepository.save(profile);
  }

  async changePassword(uuid: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findByIdOrFail(uuid);
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException({
        success: false,
        message: 'Current password is incorrect',
        error: ERROR_CODES.VALIDATION_ERROR,
        statusCode: 400,
      });
    }
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);
  }

  async getStats(uuid: string) {
    const user = await this.findByIdOrFail(uuid);
    const [
      totalProfileViews,
      totalInterests,
      totalMatches,
      totalMessages,
    ] = await Promise.all([
      this.userActivityRepository.count({ where: { userId: user.id, activityType: ActivityType.PROFILE_UPDATE } }),
      this.userActivityRepository.count({ where: { userId: user.id, activityType: ActivityType.INTEREST_SENT } }),
      this.userActivityRepository.count({ where: { userId: user.id, activityType: ActivityType.INTEREST_ACCEPTED } }),
      this.userActivityRepository.count({ where: { userId: user.id, activityType: ActivityType.MESSAGE_SENT } }),
    ]);
    return { totalProfileViews, totalInterests, totalMatches, totalMessages };
  }
}
