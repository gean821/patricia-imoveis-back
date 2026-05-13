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
import { InteracoesService } from '../application/interacoes.service';
import {
  CreateInteracaoDto,
  ListInteracoesQueryDto,
  UpdateInteracaoDto,
} from './dto/interacao.dtos';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: interacoes')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/interacoes')
export class InteracoesController {
  constructor(private readonly service: InteracoesService) { }

  @Post()
  create(@Body() dto: CreateInteracaoDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() query: ListInteracoesQueryDto) {
    return this.service.list(query);
  }

  @Get('timeline/:clienteId')
  timeline(@Param('clienteId', ParseUUIDPipe) clienteId: string) {
    return this.service.timelineByCliente(clienteId);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInteracaoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}