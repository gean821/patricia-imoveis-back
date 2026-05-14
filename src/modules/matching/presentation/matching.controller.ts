import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MatchingService } from '../application/matching.service';
import {
  ClientesParaImovelQueryDto,
  ImoveisParaClienteQueryDto,
} from './dto/matching.dtos';
import { ImovelListItemResponseDto } from '../../imoveis/presentation/dto/imovel-response.dtos';
import { ClienteListItemResponseDto } from '../../clientes/presentation/dto/cliente-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: matching')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/matching')
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  @Get('imoveis-para-cliente/:clienteId')
  async imoveisParaCliente(
    @Param('clienteId', ParseUUIDPipe) clienteId: string,
    @Query() query: ImoveisParaClienteQueryDto,
  ): Promise<PaginatedResponseDto<ImovelListItemResponseDto>> {
    return await this.service.imoveisParaCliente(clienteId, query);
  }

  @Get('clientes-para-imovel/:imovelId')
  async clientesParaImovel(
    @Param('imovelId', ParseUUIDPipe) imovelId: string,
    @Query() query: ClientesParaImovelQueryDto,
  ): Promise<PaginatedResponseDto<ClienteListItemResponseDto>> {
    return await this.service.clientesParaImovel(imovelId, query);
  }
}
