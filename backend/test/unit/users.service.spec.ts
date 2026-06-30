import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UsersService } from '../../src/modules/users/users.service';
import { User } from '../../src/database/entities/user.entity';
import { Profile } from '../../src/database/entities/profile.entity';
import { UserActivity } from '../../src/database/entities/user-activity.entity';
import { Gender, UserRole, UserStatus } from '../../src/common/enums';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let profileRepository: any;
  let userActivityRepository: any;

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
    profile: { id: 1, userId: 1, headline: 'SWE', gender: Gender.MALE, age: 29 },
    professionalDetail: null,
    educationDetails: [],
    familyDetail: null,
    lifestyleDetail: null,
    languages: [],
    horoscopeDetail: null,
    photos: [],
    partnerPreference: null,
  };

  const mockProfile = {
    id: 1,
    userId: 1,
    headline: null,
    aboutMe: null,
    dateOfBirth: '1995-06-15',
    age: 29,
    gender: Gender.MALE,
    maritalStatus: null,
    religion: null,
    motherTongue: null,
    country: null,
    state: null,
    city: null,
    hideProfile: false,
    hidePhotos: false,
    hideContact: false,
    privateMode: false,
  };

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
      createQueryBuilder: jest.fn(),
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
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Profile), useValue: profileRepository },
        { provide: getRepositoryToken(UserActivity), useValue: userActivityRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
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

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should return user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByIdOrFail('test-uuid');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findByIdOrFail('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user with a profile', async () => {
      const dto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        passwordHash: 'hashed-password',
        gender: Gender.FEMALE,
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({ ...mockUser, ...dto, uuid: 'new-uuid' });
      userRepository.save.mockResolvedValue({ ...mockUser, ...dto });
      profileRepository.create.mockReturnValue(mockProfile);
      profileRepository.save.mockResolvedValue(mockProfile);
      userRepository.findOne.mockResolvedValue({ ...mockUser, ...dto, uuid: 'new-uuid' });

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email }),
      );
      expect(profileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id }),
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto = { firstName: 'John', lastName: 'Doe', email: 'john@example.com', passwordHash: 'hash', gender: Gender.MALE };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
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

    it('should throw ConflictException when email is already taken by another user', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      userRepository.findOne.mockResolvedValueOnce({ ...mockUser, uuid: 'other-uuid', email: 'taken@example.com' });

      await expect(
        service.update('test-uuid', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { firstName: 'Jane' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete and restore', () => {
    it('should soft delete a user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.softRemove.mockResolvedValue(undefined);

      await service.softDelete('test-uuid');

      expect(userRepository.softRemove).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'test-uuid' }),
      );
    });

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

      await expect(service.restore('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchUsers', () => {
    it('should return paginated filtered results', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      };

      userRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchUsers({ gender: Gender.MALE, page: 1, limit: 20, religion: 'hindu', country: 'India' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'profile.religion = :religion', { religion: 'hindu' },
      );
    });
  });

  describe('updatePassword', () => {
    it('should update the password hash', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      await service.updatePassword('test-uuid', 'new-hashed-password');

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'new-hashed-password' }),
      );
    });
  });

  describe('getProfile', () => {
    it('should return user with extended relations', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('test-uuid');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: 'test-uuid' },
        relations: expect.arrayContaining(['subscriptions', 'deviceTokens']),
      });
    });
  });

  describe('updateSettings', () => {
    it('should update privacy settings', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      profileRepository.findOne.mockResolvedValue(mockProfile);
      profileRepository.save.mockResolvedValue({ ...mockProfile, hideProfile: true, privateMode: true });

      const result = await service.updateSettings('test-uuid', { hideProfile: true, privateMode: true });

      expect(result).toBeDefined();
      expect(profileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ hideProfile: true, privateMode: true }),
      );
    });
  });
});
