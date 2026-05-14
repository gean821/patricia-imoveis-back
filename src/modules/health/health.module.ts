import { Module } from '@nestjs/common';
import { HealthController } from './presentation/health.controller';
import { HealthService } from './application/health.service';
import { HealthRepository } from './repository/health.repository';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthRepository],
})
export class HealthModule {}
