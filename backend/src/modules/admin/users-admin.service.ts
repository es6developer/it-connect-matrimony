import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, FindOptionsWhere } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../database/entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums';
import { ERROR_CODES } from '../../common/constants';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersAdminService {
  private readonly logger = new Logger(UsersAdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listUsers(query: AdminUsersQueryDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      role,
      status,
      dateFrom,
      dateTo,
      search,
    } = query;

    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.adminUser', 'adminUser');

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (dateFrom && dateTo) {
      qb.andWhere('user.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
    } else if (dateFrom) {
      qb.andWhere('user.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    } else if (dateTo) {
      qb.andWhere('user.createdAt <= :dateTo', { dateTo: new Date(dateTo) });
    }

    if (search) {
      qb.andWhere(
        new Brackets((sub) => {
          sub.where('user.firstName LIKE :search', { search: `%${search}%` });
          sub.orWhere('user.lastName LIKE :search', { search: `%${search}%` });
          sub.orWhere('user.email LIKE :search', { search: `%${search}%` });
          sub.orWhere('user.phone LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'status', 'role', 'lastLoginAt'];
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

  async getUserDetail(uuid: string) {
    const user = await this.userRepository.findOne({
      where: { uuid },
      relations: [
        'profile',
        'professionalDetail',
        'educationDetails',
        'familyDetail',
        'lifestyleDetail',
        'photos',
        'subscriptions',
        'payments',
        'verificationRecords',
        'receivedReports',
        'tickets',
        'adminUser',
        'activityLogs',
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

    return {
      success: true,
      message: 'User details retrieved successfully',
      data: user,
    };
  }

  async updateUserStatus(uuid: string, dto: UpdateUserStatusDto) {
    const user = await this.findByUuidOrFail(uuid);

    if (user.status === UserStatus.DELETED) {
      throw new BadRequestException({
        success: false,
        message: 'Cannot update status of a deleted user',
        error: ERROR_CODES.INVALID_INPUT,
        statusCode: 400,
      });
    }

    user.status = dto.status;
    await this.userRepository.save(user);

    return {
      success: true,
      message: `User status updated to ${dto.status}`,
    };
  }

  async updateUserRole(uuid: string, dto: UpdateUserRoleDto) {
    const user = await this.findByUuidOrFail(uuid);

    user.role = dto.role;
    await this.userRepository.save(user);

    return {
      success: true,
      message: `User role updated to ${dto.role}`,
    };
  }

  async forceDeleteUser(uuid: string) {
    const user = await this.findByUuidOrFail(uuid);

    await this.userRepository.remove(user);

    return {
      success: true,
      message: 'User permanently deleted',
    };
  }

  async impersonateUser(uuid: string) {
    const user = await this.findByUuidOrFail(uuid);

    const token = uuidv4();

    return {
      success: true,
      message: 'Impersonation token generated',
      data: {
        token,
        user: {
          uuid: user.uuid,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    };
  }

  private async findByUuidOrFail(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uuid } });
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
}
