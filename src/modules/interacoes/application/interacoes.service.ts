import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  InteracoesRepository,
  InteracaoDetailed,
} from '../repository/interacoes.repository';
import {
  CreateInteracaoDto,
  ListInteracoesQueryDto,
  TimelineQueryDto,
  UpdateInteracaoDto,
} from '../presentation/dto/interacao.dtos';
import { InteracaoResponseDto } from '../presentation/dto/interacao-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { mapInteracaoToResponse } from './interacoes.mapper';

@Injectable()
export class InteracoesService {
  constructor(private readonly repo: InteracoesRepository) {}

  async create(dto: CreateInteracaoDto): Promise<InteracaoResponseDto> {
    const data: Prisma.InteracaoCreateInput = {
      tipo: dto.tipo,
      titulo: dto.titulo,
      descricao: dto.descricao,
      data: dto.data,
      cliente: { connect: { id: dto.clienteId } },
      imovel: dto.imovelId ? { connect: { id: dto.imovelId } } : undefined,
    };

    const created = await this.repo.create(data);
    return mapInteracaoToResponse(created);
  }

  async findById(id: string): Promise<InteracaoResponseDto> {
    const entity = await this.findEntityById(id);
    return mapInteracaoToResponse(entity);
  }

  async update(id: string, dto: UpdateInteracaoDto): Promise<InteracaoResponseDto> {
    await this.findEntityById(id);

    const data: Prisma.InteracaoUpdateInput = {
      tipo: dto.tipo,
      titulo: dto.titulo,
      descricao: dto.descricao,
      data: dto.data,
    };

    if (dto.imovelId === null) {
      data.imovel = { disconnect: true };
    } else if (dto.imovelId !== undefined) {
      data.imovel = { connect: { id: dto.imovelId } };
    }

    const updated = await this.repo.update(id, data);
    return mapInteracaoToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findEntityById(id);
    await this.repo.delete(id);
  }

  async list(
    query: ListInteracoesQueryDto,
  ): Promise<PaginatedResponseDto<InteracaoResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);

    const { items, total } = await this.repo.findManyWithTotal({
      skip: (page - 1) * limit,
      take: limit,
      where,
    });

    return new PaginatedResponseDto(items.map(mapInteracaoToResponse), total, page, limit);
  }

  async timelineByCliente(
    clienteId: string,
    query: TimelineQueryDto,
  ): Promise<PaginatedResponseDto<InteracaoResponseDto>> {
    return await this.list({
      clienteId,
      tipo: query.tipo,
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  private async findEntityById(id: string): Promise<InteracaoDetailed> {
    const interacao = await this.repo.findById(id);

    if (!interacao) {
      throw new NotFoundException('Interação não encontrada');
    }

    return interacao;
  }

  private buildWhere(query: ListInteracoesQueryDto): Prisma.InteracaoWhereInput {
    const where: Prisma.InteracaoWhereInput = {};

    if (query.clienteId) {
      where.clienteId = query.clienteId;
    }
    if (query.imovelId) {
      where.imovelId = query.imovelId;
    }
    if (query.tipo) {
      where.tipo = query.tipo;
    }
    if (query.search) {
      where.OR = [
        { titulo: { contains: query.search, mode: 'insensitive' } },
        { descricao: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
