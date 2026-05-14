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
  TimelineQueryDto,
  UpdateInteracaoDto,
} from './dto/interacao.dtos';
import { InteracaoResponseDto } from './dto/interacao-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: interacoes')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/interacoes')
export class InteracoesController {
  constructor(private readonly service: InteracoesService) {}

  @Post()
  async create(@Body() dto: CreateInteracaoDto): Promise<InteracaoResponseDto> {
    return await this.service.create(dto);
  }

  @Get()
  async list(
    @Query() query: ListInteracoesQueryDto,
  ): Promise<PaginatedResponseDto<InteracaoResponseDto>> {
    return await this.service.list(query);
  }

  @Get('timeline/:clienteId')
  async timeline(
    @Param('clienteId', ParseUUIDPipe) clienteId: string,
    @Query() query: TimelineQueryDto,
  ): Promise<PaginatedResponseDto<InteracaoResponseDto>> {
    return await this.service.timelineByCliente(clienteId, query);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<InteracaoResponseDto> {
    return await this.service.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInteracaoDto,
  ): Promise<InteracaoResponseDto> {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
