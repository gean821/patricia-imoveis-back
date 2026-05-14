import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/auth.service';
import { PasswordService } from './application/password.service';
import { TokenService } from './application/token.service';
import { UserRepository } from './repository/user.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, UserRepository],
  exports: [TokenService, PasswordService, UserRepository],
})
export class AuthModule {}