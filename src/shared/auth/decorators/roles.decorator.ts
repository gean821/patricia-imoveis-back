import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'requiredRoles';
export const RequireRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);