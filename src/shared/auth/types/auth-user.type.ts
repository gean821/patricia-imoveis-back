import { Role } from '@prisma/client';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

export interface JwtPayload extends AuthUser {
  iat?: number;
  exp?: number;
}