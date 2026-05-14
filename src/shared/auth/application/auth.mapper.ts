import { User } from '@prisma/client';
import {
  AuthSessionUserDto,
  UserResponseDto,
} from '../presentation/dto/auth-response.dto';

export function mapUserToSession(user: User): AuthSessionUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function mapUserToResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
