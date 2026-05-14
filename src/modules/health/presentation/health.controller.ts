import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthService } from '../application/health.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { Public } from '../../../shared/auth/decorators/public.decorator';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  async check(): Promise<HealthResponseDto> {
    return await this.service.check();
  }
}
