import { Role } from '@prisma/client';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export class AuthSessionUserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthSessionUserDto;
}
