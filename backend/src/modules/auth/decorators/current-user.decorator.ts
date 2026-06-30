import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../../common/interfaces';

export const CurrentUser = createParamDecorator<
  keyof JwtPayload | undefined,
  ExecutionContext
>((data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as JwtPayload;
  return data ? user?.[data] : user;
});
