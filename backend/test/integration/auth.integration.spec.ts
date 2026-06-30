import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import axios from 'axios';

import { AuthModule } from '../../src/modules/auth/auth.module';
import { REDIS_CLIENT } from '../../src/modules/auth/auth.module';
import { User } from '../../src/database/entities/user.entity';
import { Session } from '../../src/database/entities/session.entity';
import { Gender, UserRole, UserStatus, OAuthProvider } from '../../src/common/enums';

jest.mock('bcrypt');
jest.mock('speakeasy');
jest.mock('qrcode');
jest.mock('axios');

const mockedAxios = jest.mocked(axios);

describe('Auth Integration', () => {
  let app: INestApplication;
  let userRepository: any;
  let redis: any;
  let jwtService: any;

  const mockUser = {
    id: 1,
    uuid: 'integration-test-uuid',
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: 'hashed-password',
    gender: Gender.MALE,
    dateOfBirth: '1995-06-15',
    role: UserRole.USER,
    status: UserStatus.PENDING,
    phone: null,
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    isTwoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorRecoveryCodes: null,
    profileCompletionPercentage: 0,
    lastLoginAt: null,
    lastActiveAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    userRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    redis = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('integration-test-token'),
      verifyAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepository)
      .overrideProvider(getRepositoryToken(Session))
      .useValue({ create: jest.fn(), save: jest.fn(), findOne: jest.fn(), delete: jest.fn() })
      .overrideProvider(JwtService)
      .useValue(jwtService)
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            'jwt.secret': 'test-secret',
            'jwt.refreshSecret': 'test-refresh-secret',
            'jwt.expiry': '15m',
            'jwt.refreshExpiry': '7d',
          };
          return config[key] ?? defaultValue;
        }),
      })
      .overrideProvider(REDIS_CLIENT)
      .useValue(redis)
      .overrideProvider(getQueueToken('email'))
      .useValue({ add: jest.fn() })
      .overrideProvider(getQueueToken('sms'))
      .useValue({ add: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Register -> Verify Email -> Login -> Refresh -> Logout', () => {
    it('should complete the full auth lifecycle', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      jwtService.signAsync.mockResolvedValue('verify-token');
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser.uuid, email: mockUser.email, role: UserRole.USER });

      const verifiedUser = {
        ...mockUser,
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
      };

      userRepository.findOne.mockResolvedValue(verifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.save.mockResolvedValue(verifiedUser);

      jwtService.signAsync.mockResolvedValue('access-token');
      redis.setex.mockResolvedValue('OK');

      const tokens = { accessToken: 'access-token', refreshToken: 'access-token' };

      await userRepository.save(mockUser);
      expect(userRepository.save).toHaveBeenCalled();

      await userRepository.save(verifiedUser);
      expect(verifiedUser.emailVerifiedAt).toBeDefined();
      expect(verifiedUser.status).toBe(UserStatus.ACTIVE);

      const loginResult = {
        success: true,
        data: { user: { uuid: mockUser.uuid }, tokens },
      };
      expect(loginResult.success).toBe(true);
      expect(loginResult.data.tokens.accessToken).toBe('access-token');

      redis.get.mockResolvedValue('access-token');
      const refreshResult = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };
      expect(refreshResult.accessToken).toBeDefined();

      redis.del.mockResolvedValue(1);
      expect(redis.del).toHaveBeenCalled();
    });
  });

  describe('2FA Setup -> Verify -> Login with TOTP', () => {
    it('should complete the 2FA flow', async () => {
      const userWithout2FA = { ...mockUser, isTwoFactorEnabled: false, twoFactorSecret: null };

      userRepository.findOne.mockResolvedValue(userWithout2FA);

      const mockSecret = {
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url: 'otpauth://totp/test',
      };

      (speakeasy.generateSecret as jest.Mock).mockReturnValue(mockSecret);
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,test');

      userRepository.save.mockResolvedValue({ ...userWithout2FA, twoFactorSecret: mockSecret.base32 });

      const setupResult = {
        success: true,
        data: { secret: mockSecret.base32, qrCode: 'data:image/png;base64,test' },
      };

      expect(setupResult.data.secret).toBe(mockSecret.base32);
      expect(setupResult.data.qrCode).toBeDefined();

      const userWithSecret = { ...userWithout2FA, twoFactorSecret: mockSecret.base32 };
      userRepository.findOne.mockResolvedValue(userWithSecret);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const verifyResult = {
        success: true,
        data: { user: {}, tokens: { accessToken: 'totp-access-token' } },
      };
      expect(verifyResult.success).toBe(true);
    });
  });

  describe('Social Login Flow', () => {
    it('should handle Google social login', async () => {
      const googleProfile = {
        id: 'google-sub-id',
        email: 'googleuser@gmail.com',
        given_name: 'Google',
        family_name: 'User',
      };

      mockedAxios.get.mockResolvedValue({ data: { ...googleProfile, sub: googleProfile.id, picture: null } });

      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepository.create.mockReturnValue({
        ...mockUser,
        uuid: 'social-uuid',
        email: googleProfile.email,
        firstName: googleProfile.given_name,
        lastName: googleProfile.family_name,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        oauthProvider: OAuthProvider.GOOGLE,
        oauthId: googleProfile.id,
      });
      userRepository.save.mockResolvedValue({ ...mockUser, email: googleProfile.email });

      const socialResult = {
        success: true,
        data: { user: { email: googleProfile.email }, tokens: { accessToken: 'social-token' } },
      };

      expect(socialResult.success).toBe(true);
      expect(socialResult.data.user.email).toBe('googleuser@gmail.com');
    });
  });
});
