import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { UserActivity } from '../../database/entities/user-activity.entity';
import { Gender, UserRole, UserStatus } from '../../common/enums';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;
  let profileRepository: jest.Mocked<Partial<Repository<Profile>>>;
  let userActivityRepository: jest.Mocked<Partial<Repository<UserActivity>>>;

  const mockUser = {
    id: 1,
    uuid: 'test-uuid',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hashed-password',
    gender: Gender.MALE,
    dateOfBirth: '1995-06-15',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    phone: null,
    emailVerifiedAt: new Date(),
    phoneVerifiedAt: null,
    isTwoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorRecoveryCodes: null,
    profileCompletionPercentage: 50,
    lastLoginAt: null,
    lastActiveAt: null,
    ipAddress: null,
    deviceInfo: null,
    referralCode: null,
    referredBy: null,
    oauthProvider: null,
    oauthId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as User;

  const mockProfile = {
    id: 1,
    userId: 1,
    headline: null,
    aboutMe: null,
    bio: null,
    dateOfBirth: '1995-06-15',
    age: 29,
    gender: Gender.MALE,
    maritalStatus: null,
    religion: null,
    caste: null,
    subCaste: null,
    community: null,
    motherTongue: null,
    height: null,
    weight: null,
    bodyType: null,
    bloodGroup: null,
    disability: 'none',
    diet: null,
    smoking: null,
    drinking: null,
    country: null,
    state: null,
    city: null,
    pincode: null,
    address: null,
    latitude: null,
    longitude: null,
    hideProfile: false,
    hidePhotos: false,
    hideContact: false,
    privateMode: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Profile;

  beforeEach(async () => {
    userRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      softRemove: jest.fn(),
      recover: jest.fn(),
      createQueryBuilder: jest.fn() as any,
    };

    profileRepository = {
      create: jest.fn(),
      save: jest.fn(),
      upsert: jest.fn(),
      findOne: jest.fn(),
    };

    userActivityRepository = {
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: profileRepository,
        },
        {
          provide: getRepositoryToken(UserActivity),
          useValue: userActivityRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('test-uuid');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: 'test-uuid' },
        relations: expect.any(Array),
      });
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-uuid');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        select: expect.any(Array),
      });
    });
  });

  describe('create', () => {
    it('should create a new user with profile', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        gender: Gender.MALE,
        dateOfBirth: '1995-06-15',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      profileRepository.create.mockReturnValue(mockProfile);
      profileRepository.save.mockResolvedValue(mockProfile);
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(result).toEqual(mockUser);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
        }),
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        passwordHash: 'hashed-password',
        gender: Gender.MALE,
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, firstName: 'Jane' });

      const result = await service.update('test-uuid', { firstName: 'Jane' });

      expect(result).toBeDefined();
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Jane' }),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { firstName: 'Jane' })).rejects.toThrow();
    });
  });

  describe('updatePassword', () => {
    it('should update password hash', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const newHash = 'new-hashed-password';
      await service.updatePassword('test-uuid', newHash);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: newHash }),
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.softRemove.mockResolvedValue(undefined);

      await service.softDelete('test-uuid');

      expect(userRepository.softRemove).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'test-uuid' }),
      );
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.recover.mockResolvedValue(mockUser as any);
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.restore('test-uuid');

      expect(result).toBeDefined();
      expect(userRepository.recover).toHaveBeenCalled();
    });

    it('should throw NotFoundException when restoring non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.restore('nonexistent')).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should return user with all relations', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('test-uuid');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: 'test-uuid' },
        relations: expect.arrayContaining(['profile', 'photos']),
      });
    });
  });

  describe('searchUsers', () => {
    it('should return paginated results', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      };

      userRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.searchUsers({ gender: Gender.MALE, page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('getUserActivity', () => {
    it('should return paginated activity log', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userActivityRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getUserActivity('test-uuid', { page: 1, limit: 20 } as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('updateSettings', () => {
    it('should update profile privacy settings', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      profileRepository.findOne.mockResolvedValue(mockProfile);
      profileRepository.save.mockResolvedValue({
        ...mockProfile,
        hideProfile: true,
        privateMode: true,
      });

      const result = await service.updateSettings('test-uuid', {
        hideProfile: true,
        privateMode: true,
      });

      expect(result).toBeDefined();
      expect(profileRepository.save).toHaveBeenCalled();
    });
  });
});
