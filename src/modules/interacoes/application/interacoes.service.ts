import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InteracoesRepository, InteracaoDetailed } from '../repository/interacoes.repository';
import {
  CreateInteracaoDto,
  ListInteracoesQueryDto,
  UpdateInteracaoDto,
} from '../presentation/dto/interacao.dtos';
import { PaginatedResponse } from '../../imoveis/application/imoveis.service';

@Injectable()
export class InteracoesService {
  constructor(private readonly repo: InteracoesRepository) {}

  create(dto: CreateInteracaoDto): Promise<InteracaoDetailed> {
    const data: Prisma.InteracaoCreateInput = {
      tipo: dto.tipo,
      titulo: dto.titulo,
      descricao: dto.descricao,
      data: dto.data,
      cliente: { connect: { id: dto.clienteId } },
      imovel: dto.imovelId ? { connect: { id: dto.imovelId } } : undefined,
    };
    return this.repo.create(data);
  }

  async findById(id: string): Promise<InteracaoDetailed> {
    const i = await this.repo.findById(id);
    if (!i) throw new NotFoundException('Interação não encontrada');
    return i;
  }

  async update(id: string, dto: UpdateInteracaoDto): Promise<InteracaoDetailed> {
    await this.findById(id);
    const data: Prisma.InteracaoUpdateInput = {
      tipo: dto.tipo,
      titulo: dto.titulo,
      descricao: dto.descricao,
      data: dto.data,
    };
    if (dto.imovelId === null) data.imovel = { disconnect: true };
    else if (dto.imovelId) data.imovel = { connect: { id: dto.imovelId } };
    return this.repo.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.delete(id);
  }

  async list(query: ListInteracoesQueryDto): Promise<PaginatedResponse<InteracaoDetailed>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Prisma.InteracaoWhereInput = {};
    if (query.clienteId) where.clienteId = query.clienteId;
    if (query.imovelId) where.imovelId = query.imovelId;
    if (query.tipo) where.tipo = query.tipo;

    const { items, total } = await this.repo.findManyWithTotal({
      skip: (page - 1) * limit,
      take: limit,
      where,
    });
    return { items, total, page, limit };
  }

  timelineByCliente(clienteId: string): Promise<InteracaoDetailed[]> {
    return this.repo.findTimelineByCliente(clienteId);
  }
}