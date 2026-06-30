import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import * as bcrypt from 'bcrypt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { REDIS_CLIENT } from './auth.module';
import { User } from '../../database/entities/user.entity';
import { Session } from '../../database/entities/session.entity';
import { UserRole, UserStatus, Gender } from '../../common/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('test-token'),
    verifyAsync: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        'jwt.secret': 'test-secret',
        'jwt.expiry': '15m',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiry': '7d',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockRedis = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  };

  const mockEmailQueue = { add: jest.fn() };
  const mockSmsQueue = { add: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis,
        },
        {
          provide: getQueueToken('email'),
          useValue: mockEmailQueue,
        },
        {
          provide: getQueueToken('sms'),
          useValue: mockSmsQueue,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'StrongP@ss1',
        gender: Gender.MALE,
        dateOfBirth: '1995-06-15',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        uuid: 'test-uuid',
        ...dto,
        passwordHash: 'hashed-password',
        role: UserRole.USER,
        status: UserStatus.PENDING,
      });
      mockUserRepository.save.mockResolvedValue({
        id: 1,
        uuid: 'test-uuid',
        ...dto,
        role: UserRole.USER,
        status: UserStatus.PENDING,
        emailVerifiedAt: null,
        phoneVerifiedAt: null,
        isTwoFactorEnabled: false,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashed-password');
      (bcrypt.genSalt as jest.Mock) = jest.fn().mockResolvedValue('salt');

      const result = await service.register(dto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.tokens.accessToken).toBe('test-token');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const dto = { email: 'john@example.com', password: 'StrongP@ss1' };

      const mockUser = {
        id: 1,
        uuid: 'test-uuid',
        email: 'john@example.com',
        passwordHash: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: null,
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        lastLoginAt: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.login(dto);

      expect(result.success).toBe(true);
      expect(result.data.tokens.accessToken).toBe('test-token');
    });

    it('should fail with invalid credentials', async () => {
      const dto = { email: 'john@example.com', password: 'wrong' };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow();
    });
  });
});
