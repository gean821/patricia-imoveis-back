export type HealthStatus = 'ok' | 'degraded';
export type DatabaseStatus = 'up' | 'down';

export class HealthResponseDto {
  status: HealthStatus;
  database: DatabaseStatus;
  uptime: number;
  timestamp: string;
  version: string;
}
