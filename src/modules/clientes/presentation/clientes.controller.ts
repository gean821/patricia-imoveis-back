import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ClientesService } from '../application/clientes.service';
import {
  CreateClienteDto,
  LinkImovelDto,
  ListClientesQueryDto,
  UpdateClienteDto,
} from './dto/cliente.dtos';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: clientes')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/clientes')
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() query: ListClientesQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClienteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }

  @Post(':id/imoveis')
  linkImovel(@Param('id', ParseUUIDPipe) id: string, @Body() dto: LinkImovelDto) {
    return this.service.linkImovel(id, dto.imovelId, dto.interesse, dto.nota);
  }

  @Delete(':id/imoveis/:imovelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkImovel(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imovelId', ParseUUIDPipe) imovelId: string,
  ): Promise<void> {
    await this.service.unlinkImovel(id, imovelId);
  }
}