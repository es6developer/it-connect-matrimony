import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ERROR_CODES } from '../../../common/constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          success: false,
          message: 'Token has expired',
          error: ERROR_CODES.TOKEN_EXPIRED,
          statusCode: 401,
        });
      }
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid or missing token',
        error: ERROR_CODES.TOKEN_INVALID,
        statusCode: 401,
      });
    }
    return user;
  }
}
