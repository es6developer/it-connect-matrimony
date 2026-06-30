import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import { User } from '../../database/entities/user.entity';
import { Session } from '../../database/entities/session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpLoginDto, VerifyOtpDto } from './dto/otp-login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtPayload, TokenPair } from '../../common/interfaces';
import { UserRole, UserStatus, OAuthProvider } from '../../common/enums';
import { ERROR_CODES } from '../../common/constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();
  private refreshTokenStore = new Map<string, { token: string; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
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

    if (dto.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: dto.phone },
      });

      if (existingPhone) {
        throw new ConflictException({
          success: false,
          message: 'Phone number is already registered',
          error: ERROR_CODES.USER_ALREADY_EXISTS,
          statusCode: 409,
        });
      }
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      uuid: uuidv4(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone || null,
      passwordHash,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth,
      role: UserRole.USER,
      status: UserStatus.PENDING,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    await this.sendVerificationEmail(user);

    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
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

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password',
        error: ERROR_CODES.INVALID_CREDENTIALS,
        statusCode: 401,
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password',
        error: ERROR_CODES.INVALID_CREDENTIALS,
        statusCode: 401,
      });
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException({
        success: false,
        message: `Account is ${user.status}`,
        error: ERROR_CODES.ACCOUNT_SUSPENDED,
        statusCode: 401,
      });
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException({
        success: false,
        message: 'Account is inactive',
        error: ERROR_CODES.ACCOUNT_INACTIVE,
        statusCode: 401,
      });
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException({
        success: false,
        message: 'Please verify your email before logging in',
        error: ERROR_CODES.EMAIL_NOT_VERIFIED,
        statusCode: 401,
      });
    }

    if (user.isTwoFactorEnabled) {
      return {
        success: true,
        message: '2FA verification required',
        data: {
          requiresTwoFactor: true,
          userId: user.uuid,
        },
      };
    }

    if (user.status === UserStatus.PENDING) {
      user.status = UserStatus.ACTIVE;
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
    };
  }

  async sendOtp(dto: OtpLoginDto) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = 300;

    this.otpStore.set(`otp:${dto.phone}`, { otp, expiresAt: Date.now() + ttl * 1000 });

    // dev: this.smsQueue.add('send-otp', {
    //   to: dto.phone,
    //   body: `Your IT Connect Matrimony verification code is: ${otp}. Valid for 5 minutes.`,
    // });

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const stored = this.otpStore.get(`otp:${dto.phone}`);
    const storedOtp = stored && stored.expiresAt > Date.now() ? stored.otp : null;

    if (!storedOtp) {
      throw new BadRequestException({
        success: false,
        message: 'OTP has expired. Please request a new one.',
        error: ERROR_CODES.OTP_EXPIRED,
        statusCode: 400,
      });
    }

    if (storedOtp !== dto.otp) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid OTP',
        error: ERROR_CODES.OTP_INVALID,
        statusCode: 400,
      });
    }

    this.otpStore.delete(`otp:${dto.phone}`);

    let user = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (!user) {
      user = this.userRepository.create({
        uuid: uuidv4(),
        phone: dto.phone,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: null,
        phoneVerifiedAt: new Date(),
      });
      await this.userRepository.save(user);
    } else {
      if (!user.phoneVerifiedAt) {
        user.phoneVerifiedAt = new Date();
        await this.userRepository.save(user);
      }
    }

    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
    };
  }

  async verifyEmail(token: string) {
    const payload = await this.verifyEmailToken(token);

    const user = await this.userRepository.findOne({
      where: { uuid: payload.sub },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (user.emailVerifiedAt) {
      return {
        success: true,
        message: 'Email is already verified',
      };
    }

    user.emailVerifiedAt = new Date();

    if (user.status === UserStatus.PENDING) {
      user.status = UserStatus.ACTIVE;
    }

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a verification link has been sent',
      };
    }

    if (user.emailVerifiedAt) {
      return {
        success: true,
        message: 'Email is already verified',
      };
    }

    await this.sendVerificationEmail(user);

    return {
      success: true,
      message: 'Verification email sent successfully',
    };
  }

  async verifyMobile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { uuid: userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (!user.phone) {
      throw new BadRequestException({
        success: false,
        message: 'No phone number registered',
        statusCode: 400,
      });
    }

    user.phoneVerifiedAt = new Date();
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Mobile number verified successfully',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    const resetToken = uuidv4();
    const ttl = 900;

    this.otpStore.set(`reset:${resetToken}`, { otp: user.uuid, expiresAt: Date.now() + ttl * 1000 });

    // dev: this.emailQueue.add('send-password-reset', {
    //   to: user.email,
    //   subject: 'Password Reset - IT Connect Matrimony',
    //   template: 'password-reset',
    //   context: {
    //     name: `${user.firstName} ${user.lastName}`,
    //     token: resetToken,
    //     expiresIn: '15 minutes',
    //   },
    // });

    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetStore = this.otpStore.get(`reset:${dto.token}`);
    const userId = resetStore && resetStore.expiresAt > Date.now() ? resetStore.otp : null;

    if (!userId) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid or expired reset token',
        error: ERROR_CODES.TOKEN_INVALID,
        statusCode: 400,
      });
    }

    const user = await this.userRepository.findOne({
      where: { uuid: userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(dto.password, salt);

    await this.userRepository.save(user);
    this.otpStore.delete(`reset:${dto.token}`);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async generateTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.uuid,
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiry', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiry', '7d'),
      }),
    ]);

    const refreshTtl = 7 * 24 * 60 * 60;
    this.refreshTokenStore.set(`${user.uuid}`, { token: refreshToken, expiresAt: Date.now() + refreshTtl * 1000 });

    const expiryStr = this.configService.get<string>('jwt.expiry', '15m');
    const match = expiryStr.match(/^(\d+)([smhd])$/);
    let expiresInMs = 15 * 60 * 1000;
    if (match) {
      const num = parseInt(match[1]);
      const unit = match[2];
      const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      expiresInMs = num * (multipliers[unit] || 60000);
    }

    return { accessToken, refreshToken, expiresAt: Date.now() + expiresInMs };
  }

  async refreshToken(uuid: string, token: string): Promise<TokenPair> {
    const refStore = this.refreshTokenStore.get(`${uuid}`);
    const storedToken = refStore && refStore.expiresAt > Date.now() ? refStore.token : null;

    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid refresh token',
        error: ERROR_CODES.TOKEN_INVALID,
        statusCode: 401,
      });
    }

    const user = await this.userRepository.findOne({
      where: { uuid },
    });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 401,
      });
    }

    this.refreshTokenStore.delete(`${uuid}`);

    return this.generateTokens(user);
  }

  async logout(uuid: string) {
    this.refreshTokenStore.delete(`${uuid}`);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async setup2FA(userId: string) {
    const user = await this.userRepository.findOne({
      where: { uuid: userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException({
        success: false,
        message: '2FA is already enabled',
        statusCode: 400,
      });
    }

    const secret = speakeasy.generateSecret({
      name: `IT Connect Matrimony (${user.email})`,
      issuer: 'IT Connect Matrimony',
    });

    user.twoFactorSecret = secret.base32;
    await this.userRepository.save(user);

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      success: true,
      message: '2FA setup initiated. Verify with a TOTP token to enable.',
      data: {
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
      },
    };
  }

  async verify2FA(userId: string, token: string) {
    const user = await this.userRepository.findOne({
      where: { uuid: userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException({
        success: false,
        message: '2FA has not been set up',
        statusCode: 400,
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid TOTP token',
        error: ERROR_CODES.TOKEN_INVALID,
        statusCode: 401,
      });
    }

    if (!user.isTwoFactorEnabled) {
      user.isTwoFactorEnabled = true;
      user.twoFactorRecoveryCodes = JSON.stringify(
        this.generateRecoveryCodes(),
      );
      await this.userRepository.save(user);
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: '2FA verification successful',
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
    };
  }

  async disable2FA(userId: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { uuid: userId },
      select: ['id', 'uuid', 'email', 'passwordHash', 'isTwoFactorEnabled', 'twoFactorSecret', 'twoFactorRecoveryCodes'],
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid password',
        error: ERROR_CODES.INVALID_CREDENTIALS,
        statusCode: 401,
      });
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorRecoveryCodes = null;
    await this.userRepository.save(user);

    return {
      success: true,
      message: '2FA disabled successfully',
    };
  }

  async verify2FALogin(userId: string, token: string) {
    const user = await this.userRepository.findOne({
      where: { uuid: userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException({
        success: false,
        message: '2FA is not enabled',
        statusCode: 400,
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid TOTP token',
        error: ERROR_CODES.TOKEN_INVALID,
        statusCode: 401,
      });
    }

    if (user.status === UserStatus.PENDING) {
      user.status = UserStatus.ACTIVE;
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: '2FA login successful',
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
    };
  }

  async socialLogin(dto: SocialLoginDto) {
    let profile: any;

    if (dto.provider === OAuthProvider.GOOGLE) {
      profile = await this.verifyGoogleToken(dto.accessToken);
    } else if (dto.provider === OAuthProvider.LINKEDIN) {
      profile = await this.verifyLinkedInToken(dto.accessToken);
    } else {
      throw new BadRequestException({
        success: false,
        message: `Unsupported OAuth provider: ${dto.provider}`,
        statusCode: 400,
      });
    }

    if (!profile?.email) {
      throw new UnauthorizedException({
        success: false,
        message: 'Failed to retrieve email from OAuth provider',
        error: ERROR_CODES.THIRD_PARTY_ERROR,
        statusCode: 401,
      });
    }

    let user = await this.userRepository.findOne({
      where: [
        { oauthProvider: dto.provider, oauthId: profile.id },
        { email: profile.email },
      ],
    });

    if (user) {
      if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BLOCKED) {
        throw new UnauthorizedException({
          success: false,
          message: `Account is ${user.status}`,
          error: ERROR_CODES.ACCOUNT_SUSPENDED,
          statusCode: 401,
        });
      }

      if (!user.oauthProvider) {
        user.oauthProvider = dto.provider;
        user.oauthId = profile.id;
      }

      if (user.status === UserStatus.PENDING) {
        user.status = UserStatus.ACTIVE;
      }

      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
      }

      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    } else {
      user = this.userRepository.create({
        uuid: uuidv4(),
        email: profile.email,
        firstName: profile.firstName || profile.given_name || '',
        lastName: profile.lastName || profile.family_name || '',
        passwordHash: await bcrypt.hash(uuidv4(), 12),
        gender: profile.gender || ('prefer_not_to_say' as any),
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        oauthProvider: dto.provider,
        oauthId: profile.id,
      });

      await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: 'Social login successful',
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
    };
  }

  private async verifyGoogleToken(accessToken: string) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const { sub, email, given_name, family_name, picture } = response.data;

      return {
        id: sub,
        email,
        firstName: given_name,
        lastName: family_name,
        picture,
      };
    } catch (error) {
      this.logger.error('Google token verification failed', error);
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid Google access token',
        error: ERROR_CODES.THIRD_PARTY_ERROR,
        statusCode: 401,
      });
    }
  }

  private async verifyLinkedInToken(accessToken: string) {
    try {
      const [userInfo] = await Promise.all([
        axios.get('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const { sub, name, given_name, family_name, picture } = userInfo.data;

      let email = userInfo.data.email;

      if (!email) {
        try {
          const emailRes = await axios.get(
            'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          email =
            emailRes.data?.elements?.[0]?.['handle~']?.emailAddress || null;
        } catch {
          this.logger.warn('Could not fetch LinkedIn email');
        }
      }

      return {
        id: sub,
        email,
        firstName: given_name || name?.split(' ')?.[0] || '',
        lastName: family_name || name?.split(' ')?.slice(1)?.join(' ') || '',
        picture,
      };
    } catch (error) {
      this.logger.error('LinkedIn token verification failed', error);
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid LinkedIn access token',
        error: ERROR_CODES.THIRD_PARTY_ERROR,
        statusCode: 401,
      });
    }
  }

  private async sendVerificationEmail(user: User) {
    const payload: JwtPayload = { sub: user.uuid, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: '24h',
    });

    // dev: this.emailQueue.add('send-verification-email', {
    //   to: user.email,
    //   subject: 'Verify your email - IT Connect Matrimony',
    //   template: 'email-verification',
    //   context: {
    //     name: `${user.firstName} ${user.lastName}`,
    //     token,
    //     expiresIn: '24 hours',
    //   },
    // });
  }

  private async verifyEmailToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch {
      throw new BadRequestException({
        success: false,
        message: 'Invalid or expired verification token',
        error: ERROR_CODES.TOKEN_INVALID,
        statusCode: 400,
      });
    }
  }

  private generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = Array.from({ length: 4 }, () =>
        Math.random().toString(36).substring(2, 4).toUpperCase(),
      ).join('-');
      codes.push(code);
    }
    return codes;
  }

  private sanitizeUser(user: User) {
    const { passwordHash, twoFactorSecret, twoFactorRecoveryCodes, deletedAt, ...rest } = user;
    return {
      ...rest,
      name: `${rest.firstName} ${rest.lastName}`,
    };
  }
}
