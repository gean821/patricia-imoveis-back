import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import { AuthUser, JwtPayload } from '../types/auth-user.type';

type TokenKind = 'access' | 'refresh';

@Injectable()
export class TokenService {
  private readonly secret: Uint8Array;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(config: ConfigService) {
    const secret = config.getOrThrow<string>('jwt.secret');
    this.secret = new TextEncoder().encode(secret);
    this.accessExpiresIn = config.getOrThrow<string>('jwt.accessExpiresIn');
    this.refreshExpiresIn = config.getOrThrow<string>('jwt.refreshExpiresIn');
  }

  async sign(user: AuthUser, kind: TokenKind = 'access'): Promise<string> {
    const expiresIn = kind === 'access' ? this.accessExpiresIn : this.refreshExpiresIn;
    return await new SignJWT({ ...user, token_use: kind })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setIssuer('patricia-imoveis-api')
      .sign(this.secret);
  }

  async verify(token: string): Promise<JwtPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        issuer: 'patricia-imoveis-api',
      });
      return payload as unknown as JwtPayload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}