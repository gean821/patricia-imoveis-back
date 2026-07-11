import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RelatoriosService } from '../application/relatorios.service';
import { DashboardQueryDto } from './dto/relatorios.dtos';
import { DashboardResponseDto } from './dto/relatorios-response.dtos';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: relatorios')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('dashboard')
  async dashboard(@Query() query: DashboardQueryDto): Promise<DashboardResponseDto> {
    return await this.service.dashboard(query);
  }
}
