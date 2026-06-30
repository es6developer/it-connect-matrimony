import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import axios from 'axios';

import { AuthService } from '../../src/modules/auth/auth.service';
import { REDIS_CLIENT } from '../../src/modules/auth/auth.module';
import { User } from '../../src/database/entities/user.entity';
import { Session } from '../../src/database/entities/session.entity';
import { Gender, UserRole, UserStatus, OAuthProvider } from '../../src/common/enums';

jest.mock('bcrypt');
jest.mock('speakeasy');
jest.mock('qrcode');
jest.mock('axios');

const mockedAxios = jest.mocked(axios);

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let sessionRepository: any;
  let jwtService: any;
  let configService: any;
  let redis: any;
  let emailQueue: any;
  let smsQueue: any;

  const mockUser = {
    id: 1,
    uuid: 'test-uuid-1234',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hashed-password',
    gender: Gender.MALE,
    dateOfBirth: '1995-06-15',
    role: UserRole.USER,
    status: UserStatus.PENDING,
    phone: '+919876543210',
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    isTwoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorRecoveryCodes: null,
    profileCompletionPercentage: 0,
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
  };

  const mockUserActive = {
    ...mockUser,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
  };

  beforeEach(async () => {
    userRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    sessionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('test-access-token'),
      verifyAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'jwt.secret': 'test-jwt-secret',
          'jwt.refreshSecret': 'test-jwt-refresh-secret',
          'jwt.expiry': '15m',
          'jwt.refreshExpiry': '7d',
        };
        return config[key] ?? defaultValue;
      }),
    };

    redis = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
    };

    emailQueue = { add: jest.fn() };
    smsQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Session), useValue: sessionRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: REDIS_CLIENT, useValue: redis },
        { provide: getQueueToken('email'), useValue: emailQueue },
        { provide: getQueueToken('sms'), useValue: smsQueue },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user, return tokens, and send verification email', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'StrongP@ss1',
        gender: Gender.MALE,
        dateOfBirth: '1995-06-15',
        phone: '+919876543210',
      };

      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(dto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Registration successful');
      expect(result.data.user).toBeDefined();
      expect(result.data.tokens.accessToken).toBe('test-access-token');
      expect(result.data.tokens.refreshToken).toBe('test-access-token');
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
        }),
      );
      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-verification-email',
        expect.objectContaining({ to: dto.email }),
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'StrongP@ss1',
        gender: Gender.MALE,
        dateOfBirth: '1995-06-15',
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should validate credentials and return tokens', async () => {
      const dto = { email: 'john@example.com', password: 'StrongP@ss1' };

      userRepository.findOne.mockResolvedValue({
        ...mockUserActive,
        status: UserStatus.ACTIVE,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.save.mockResolvedValue(mockUserActive);

      const result = await service.login(dto);

      expect(result.success).toBe(true);
      expect(result.data.tokens.accessToken).toBe('test-access-token');
      expect(result.data.user).toBeDefined();
      expect(result.data.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const dto = { email: 'john@example.com', password: 'wrong-password' };

      userRepository.findOne.mockResolvedValue(mockUserActive);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      const dto = { email: 'john@example.com', password: 'StrongP@ss1' };
      const unverifiedUser = { ...mockUser, emailVerifiedAt: null, status: UserStatus.PENDING };

      userRepository.findOne.mockResolvedValue(unverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should mark user as verified', async () => {
      const token = 'valid-verification-token';

      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser.uuid, email: mockUser.email, role: mockUser.role });
      userRepository.findOne.mockResolvedValue({ ...mockUser, emailVerifiedAt: null });

      const result = await service.verifyEmail(token);

      expect(result.success).toBe(true);
      expect(result.message).toContain('verified');
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ emailVerifiedAt: expect.any(Date) }),
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const dto = { email: 'john@example.com' };

      userRepository.findOne.mockResolvedValue(mockUserActive);
      redis.setex.mockResolvedValue('OK');

      const result = await service.forgotPassword(dto);

      expect(result.success).toBe(true);
      expect(redis.setex).toHaveBeenCalledWith(
        expect.stringContaining('reset:'),
        expect.any(Number),
        mockUser.uuid,
      );
      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-password-reset',
        expect.objectContaining({ to: dto.email }),
      );
    });
  });

  describe('resetPassword', () => {
    it('should update password with a new hash', async () => {
      const dto = { token: 'valid-reset-token', password: 'NewStr0ng!Pass1' };

      redis.get.mockResolvedValue(mockUser.uuid);
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.resetPassword(dto);

      expect(result.success).toBe(true);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'new-hashed-password' }),
      );
      expect(redis.del).toHaveBeenCalledWith(`reset:${dto.token}`);
    });

    it('should throw BadRequestException for invalid token', async () => {
      redis.get.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'invalid', password: 'NewStr0ng!Pass1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateTokens', () => {
    it('should return access and refresh tokens', async () => {
      jwtService.signAsync.mockResolvedValue('generated-token');
      redis.setex.mockResolvedValue('OK');

      const result = await service.generateTokens(mockUser);

      expect(result.accessToken).toBe('generated-token');
      expect(result.refreshToken).toBe('generated-token');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(redis.setex).toHaveBeenCalledWith(
        `refresh:${mockUser.uuid}`,
        expect.any(Number),
        'generated-token',
      );
    });
  });

  describe('refreshToken', () => {
    it('should return a new token pair when refresh token is valid', async () => {
      redis.get.mockResolvedValue('valid-refresh-token');
      userRepository.findOne.mockResolvedValue(mockUserActive);
      jwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshToken(mockUser.uuid, 'valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(redis.del).toHaveBeenCalledWith(`refresh:${mockUser.uuid}`);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      redis.get.mockResolvedValue('stored-token');

      await expect(
        service.refreshToken(mockUser.uuid, 'wrong-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('setup2FA', () => {
    it('should return secret and QR code', async () => {
      const mockSecret = {
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url: 'otpauth://totp/IT%20Connect%20Matrimony?secret=JBSWY3DPEHPK3PXP',
      };

      userRepository.findOne.mockResolvedValue({ ...mockUser, isTwoFactorEnabled: false });
      (speakeasy.generateSecret as jest.Mock).mockReturnValue(mockSecret);
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,qrcode-data');

      const result = await service.setup2FA(mockUser.uuid);

      expect(result.success).toBe(true);
      expect(result.data.secret).toBe(mockSecret.base32);
      expect(result.data.qrCode).toBe('data:image/png;base64,qrcode-data');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.setup2FA('nonexistent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verify2FA', () => {
    it('should validate TOTP and enable 2FA', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isTwoFactorEnabled: false,
      });
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
      userRepository.save.mockResolvedValue({ ...mockUser, isTwoFactorEnabled: true });

      const result = await service.verify2FA(mockUser.uuid, '123456');

      expect(result.success).toBe(true);
      expect(result.data.tokens).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid TOTP', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      });
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      await expect(service.verify2FA(mockUser.uuid, '000000')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('socialLogin', () => {
    it('should create a new user and return tokens for Google login', async () => {
      const dto = { provider: OAuthProvider.GOOGLE, accessToken: 'google-token' };
      const googleProfile = {
        id: 'google-sub-123',
        email: 'googleuser@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        picture: 'https://example.com/photo.jpg',
      };

      mockedAxios.get.mockResolvedValue({ data: { sub: googleProfile.id, email: googleProfile.email, given_name: googleProfile.firstName, family_name: googleProfile.lastName, picture: googleProfile.picture } });
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepository.create.mockReturnValue({
        ...mockUser,
        uuid: 'new-uuid',
        email: googleProfile.email,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        oauthProvider: OAuthProvider.GOOGLE,
        oauthId: googleProfile.id,
      });
      userRepository.save.mockResolvedValue({ ...mockUser, email: googleProfile.email });

      const result = await service.socialLogin(dto);

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe(googleProfile.email);
      expect(result.data.tokens).toBeDefined();
    });

    it('should return tokens for existing social login user', async () => {
      const dto = { provider: OAuthProvider.GOOGLE, accessToken: 'google-token' };

      mockedAxios.get.mockResolvedValue({
        data: { sub: 'google-sub-123', email: 'existing@gmail.com', given_name: 'Existing', family_name: 'User' },
      });
      userRepository.findOne.mockResolvedValue({
        ...mockUserActive,
        email: 'existing@gmail.com',
        oauthProvider: OAuthProvider.GOOGLE,
        oauthId: 'google-sub-123',
      });

      const result = await service.socialLogin(dto);

      expect(result.success).toBe(true);
      expect(result.data.tokens).toBeDefined();
    });
  });
});
