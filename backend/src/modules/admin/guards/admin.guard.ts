import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../common/enums';
import { ERROR_CODES } from '../../../common/constants';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: ERROR_CODES.FORBIDDEN,
        statusCode: 403,
      });
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException({
        success: false,
        message: 'Admin access required',
        error: ERROR_CODES.FORBIDDEN,
        statusCode: 403,
      });
    }

    return user;
  }
}
