import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './shared/auth/auth.module';
import { StorageModule } from './shared/storage/storage.module';
import { JwtAuthGuard } from './shared/auth/guards/jwt-auth.guard';
import { RolesGuard } from './shared/auth/guards/roles.guard';
import { ImoveisModule } from './modules/imoveis/imoveis.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { InteracoesModule } from './modules/interacoes/interacoes.module';
import { MatchingModule } from './modules/matching/matching.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { FeedPortaisModule } from './modules/feed-portais/feed-portais.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    ImoveisModule,
    ClientesModule,
    InteracoesModule,
    MatchingModule,
    UploadsModule,
    FeedPortaisModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}