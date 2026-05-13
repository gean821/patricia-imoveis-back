import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthUser } from '../types/auth-user.type';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      return undefined;
    }
    return data ? user[data] : user;
  },
);