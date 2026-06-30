import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../../../common/interfaces';
import { ERROR_CODES } from '../../../common/constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req?.body?.refreshToken) {
            token = req.body.refreshToken;
          }
          if (!token && req?.headers?.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken =
      req?.body?.refreshToken || req?.headers?.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedException({
        success: false,
        message: 'Refresh token is missing',
        error: ERROR_CODES.TOKEN_INVALID,
        statusCode: 401,
      });
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
