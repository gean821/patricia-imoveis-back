import { Module } from '@nestjs/common';
import { AlertasPublicController } from './presentation/alertas-public.controller';
import { AlertasService } from './application/alertas.service';
import { AlertasRepository } from './repository/alertas.repository';

@Module({
  controllers: [AlertasPublicController],
  providers: [AlertasService, AlertasRepository],
})
export class AlertasModule {}
