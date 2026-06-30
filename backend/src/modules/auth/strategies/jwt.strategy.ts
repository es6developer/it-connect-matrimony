import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { JwtPayload } from '../../../common/interfaces';
import { ERROR_CODES } from '../../../common/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userRepository.findOne({
      where: { uuid: payload.sub },
      select: ['id', 'uuid', 'email', 'role', 'status', 'isTwoFactorEnabled'],
    });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 401,
      });
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException({
        success: false,
        message: `Account is ${user.status}`,
        error: ERROR_CODES.ACCOUNT_SUSPENDED,
        statusCode: 401,
      });
    }

    return {
      sub: user.uuid,
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
