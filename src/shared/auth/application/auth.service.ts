import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { LoginDto } from '../presentation/dto/login.dto';
import { AuthResponseDto } from '../presentation/dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly token: TokenService,
  ) { }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const ok = await this.password.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.token.sign(payload, 'access'),
      this.token.sign(payload, 'refresh'),
    ]);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.token.verify(refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw new UnauthorizedException('Usuário inativo');

    const next = { sub: user.id, email: user.email, name: user.name, role: user.role };
    const [newAccess, newRefresh] = await Promise.all([
      this.token.sign(next, 'access'),
      this.token.sign(next, 'refresh'),
    ]);

    return {
      accessToken: newAccess,
      refreshToken: newRefresh,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}