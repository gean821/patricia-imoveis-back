import { Injectable, Logger } from '@nestjs/common';
import { HealthRepository } from '../repository/health.repository';
import { HealthResponseDto } from '../presentation/dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly repo: HealthRepository) { }

  async check(): Promise<HealthResponseDto> {
    const databaseUp = await this.checkDatabase();

    return {
      status: databaseUp ? 'ok' : 'degraded',
      database: databaseUp ? 'up' : 'down',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.repo.ping();
      return true;
    } catch (error) {
      this.logger.warn(`Database ping falhou: ${error instanceof Error ? error.message : error}`);
      return false;
    }
  }
}
