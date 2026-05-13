import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MatchingService } from '../application/matching.service';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: matching')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/matching')
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  @Get('imoveis-para-cliente/:clienteId')
  imoveisParaCliente(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.service.imoveisParaCliente(clienteId);
  }

  @Get('clientes-para-imovel/:imovelId')
  clientesParaImovel(@Param('imovelId', ParseUUIDPipe) imovelId: string) {
    return this.service.clientesParaImovel(imovelId);
  }
}