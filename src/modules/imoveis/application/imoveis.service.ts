import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ImoveisRepository, ImovelDetailed, ImovelListItem } from '../repository/imoveis.repository';
import { CreateImovelDto, ListImoveisQueryDto, UpdateImovelDto } from '../presentation/dto/imovel.dtos';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ImoveisService {
  constructor(private readonly repo: ImoveisRepository) { }

  async create(dto: CreateImovelDto): Promise<ImovelDetailed> {
    const { fotos, ...rest } = dto;
    const data: Prisma.ImovelCreateInput = {
      ...rest,
      fotos: fotos?.length
        ? {
          create: fotos.map((f, idx) => ({
            url: f.url,
            storageKey: f.storageKey,
            legenda: f.legenda,
            ordem: f.ordem ?? idx,
            isCapa: f.isCapa ?? idx === 0,
          })),
        }
        : undefined,
    };
    return this.repo.create(data);
  }

  async findById(id: string): Promise<ImovelDetailed> {
    const imovel = await this.repo.findById(id);
    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return imovel;
  }

  async findByCodigo(codigo: string): Promise<ImovelDetailed> {
    const imovel = await this.repo.findByCodigo(codigo);

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return imovel;
  }

  async update(id: string, dto: UpdateImovelDto): Promise<ImovelDetailed> {
    await this.findById(id);
    const { fotos, ...rest } = dto;
    const data: Prisma.ImovelUpdateInput = { ...rest };

    if (fotos) {
      data.fotos = {
        deleteMany: {},
        create: fotos.map((f, idx) => ({
          url: f.url,
          storageKey: f.storageKey,
          legenda: f.legenda,
          ordem: f.ordem ?? idx,
          isCapa: f.isCapa ?? idx === 0,
        })),
      };
    }
    
    return this.repo.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.softDelete(id);
  }

  async list(query: ListImoveisQueryDto): Promise<PaginatedResponse<ImovelListItem>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);

    const { items, total } = await this.repo.findManyWithTotal({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
    });

    return { items, total, page, limit };
  }

  async listPublic(query: ListImoveisQueryDto): Promise<PaginatedResponse<ImovelListItem>> {
    return this.list({
      ...query,
      status: query.status ?? 'DISPONIVEL',
    });
  }

  private buildWhere(q: ListImoveisQueryDto): Prisma.ImovelWhereInput {
    const where: Prisma.ImovelWhereInput = { deletedAt: null };

    if (q.search) {
      where.OR = [
        { titulo: { contains: q.search, mode: 'insensitive' } },
        { codigo: { contains: q.search, mode: 'insensitive' } },
        { bairro: { contains: q.search, mode: 'insensitive' } },
        { cidade: { contains: q.search, mode: 'insensitive' } },
        { descricao: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.tipo) where.tipo = q.tipo;
    if (q.finalidade) where.finalidade = q.finalidade;
    if (q.status) where.status = q.status;
    if (q.cidade) where.cidade = { contains: q.cidade, mode: 'insensitive' };
    if (q.bairro) where.bairro = { contains: q.bairro, mode: 'insensitive' };
    if (q.destaque !== undefined) where.destaque = q.destaque;
    if (q.quartosMin !== undefined) where.quartos = { gte: q.quartosMin };
    if (q.vagasMin !== undefined) where.vagas = { gte: q.vagasMin };
    if (q.valorMin !== undefined || q.valorMax !== undefined) {
      where.valor = {};
      if (q.valorMin !== undefined) where.valor.gte = q.valorMin;
      if (q.valorMax !== undefined) where.valor.lte = q.valorMax;
    }
    return where;
  }
}