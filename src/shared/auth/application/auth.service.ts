import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { UserRepository } from '../repository/user.repository';
import { LoginDto } from '../presentation/dto/login.dto';
import {
  AuthResponseDto,
  UserResponseDto,
} from '../presentation/dto/auth-response.dto';
import { mapUserToResponse, mapUserToSession } from './auth.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly password: PasswordService,
    private readonly token: TokenService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await this.password.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return await this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.token.verify(refreshToken);
    const user = await this.users.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    return await this.issueTokens(user);
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return mapUserToResponse(user);
  }

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.token.sign(payload, 'access'),
      this.token.sign(payload, 'refresh'),
    ]);

    return {
      accessToken,
      refreshToken,
      user: mapUserToSession(user),
    };
  }
}
