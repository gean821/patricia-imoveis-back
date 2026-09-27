import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ImoveisRepository, ImovelDetailed } from '../repository/imoveis.repository';
import {
  CreateImovelDto,
  ListImoveisQueryDto,
  UpdateImovelDto,
} from '../presentation/dto/imovel.dtos';
import {
  ImovelListItemResponseDto,
  ImovelResponseDto,
} from '../presentation/dto/imovel-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { StorageService } from '../../../shared/storage/storage.service';
import { mapImovelToListItem, mapImovelToResponse } from './imoveis.mapper';

@Injectable()
export class ImoveisService {
  private readonly logger = new Logger(ImoveisService.name);

  constructor(
    private readonly repo: ImoveisRepository,
    private readonly storage: StorageService,
  ) { }

  async create(dto: CreateImovelDto): Promise<ImovelResponseDto> {
    const data = this.buildCreateInput(dto);
    const created = await this.repo.create(data);
    return mapImovelToResponse(created);
  }

  async findById(id: string): Promise<ImovelResponseDto> {
    const imovel = await this.findEntityById(id);
    return mapImovelToResponse(imovel);
  }

  async findByCodigo(codigo: string): Promise<ImovelResponseDto> {
    const imovel = await this.repo.findByCodigo(codigo);

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return mapImovelToResponse(imovel);
  }

  async findByCodigoPublic(codigo: string): Promise<ImovelResponseDto> {
    const imovel = await this.repo.findByCodigo(codigo);

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    const visiveis: Array<typeof imovel.status> = ['DISPONIVEL', 'RESERVADO', 'NEGOCIACAO'];
    if (!visiveis.includes(imovel.status)) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return mapImovelToResponse(imovel);
  }

  async update(id: string, dto: UpdateImovelDto): Promise<ImovelResponseDto> {
    const atual = await this.findEntityById(id);
    const data = this.buildUpdateInput(dto);
    const updated = await this.repo.update(id, data);

    if (dto.fotos || dto.videos) {
      await this.removeFilesFromExcludedMedia(atual, updated);
    }

    return mapImovelToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findEntityById(id);
    await this.repo.softDelete(id);
  }

  async list(
    query: ListImoveisQueryDto,
  ): Promise<PaginatedResponseDto<ImovelListItemResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);

    const { items, total } = await this.repo.findManyWithTotal({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
    });

    return new PaginatedResponseDto(items.map(mapImovelToListItem), total, page, limit);
  }

  async listPublic(
    query: ListImoveisQueryDto,
  ): Promise<PaginatedResponseDto<ImovelListItemResponseDto>> {
    return await this.list({
      ...query,
      status: query.status ?? 'DISPONIVEL',
    });
  }

  private async findEntityById(id: string): Promise<ImovelDetailed> {
    const imovel = await this.repo.findById(id);

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return imovel;
  }

  private async removeFilesFromExcludedMedia(
    antes: ImovelDetailed,
    depois: ImovelDetailed,
  ): Promise<void> {
    const mantidas = new Set(this.mediaStorageKeys(depois));
    const excluidas = this.mediaStorageKeys(antes).filter(
      (key) => !mantidas.has(key),
    );

    for (const key of excluidas) {
      try {
        await this.storage.delete(key);
      } catch (error) {
        this.logger.warn(`Falha ao remover ${key} do storage: ${String(error)}`);
      }
    }
  }

  private mediaStorageKeys(imovel: ImovelDetailed): string[] {
    return [
      ...imovel.fotos.map((f) => f.storageKey),
      ...imovel.videos.flatMap((v) => [v.storageKey, v.capaStorageKey]),
    ].filter((key): key is string => Boolean(key));
  }

  private buildVideosCreate(
    videos: NonNullable<CreateImovelDto['videos']>,
  ): Prisma.ImovelVideoCreateWithoutImovelInput[] {
    return videos.map((v, idx) => ({
      url: v.url,
      storageKey: v.storageKey,
      capaUrl: v.capaUrl,
      capaStorageKey: v.capaStorageKey,
      ordem: v.ordem ?? idx,
    }));
  }

  private buildCreateInput(dto: CreateImovelDto): Prisma.ImovelCreateInput {
    const { fotos, videos, ...rest } = dto;
    const data: Prisma.ImovelCreateInput = { ...rest };

    if (fotos?.length) {
      data.fotos = {
        create: fotos.map((f, idx) => ({
          url: f.url,
          storageKey: f.storageKey,
          legenda: f.legenda,
          ordem: f.ordem ?? idx,
          isCapa: f.isCapa ?? idx === 0,
        })),
      };
    }

    if (videos?.length) {
      data.videos = { create: this.buildVideosCreate(videos) };
    }

    return data;
  }

  private buildUpdateInput(dto: UpdateImovelDto): Prisma.ImovelUpdateInput {
    const { fotos, videos, ...rest } = dto;
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

    if (videos) {
      data.videos = {
        deleteMany: {},
        create: this.buildVideosCreate(videos),
      };
    }

    return data;
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
    if (q.tipo) {
      where.tipo = q.tipo;
    }
    if (q.finalidade) {
      where.finalidade = q.finalidade;
    }
    if (q.status) {
      where.status = q.status;
    }
    if (q.cidade) {
      where.cidade = { contains: q.cidade, mode: 'insensitive' };
    }
    if (q.bairro) {
      where.bairro = { contains: q.bairro, mode: 'insensitive' };
    }
    if (q.destaque !== undefined) {
      where.destaque = q.destaque;
    }
    if (q.quartosMin !== undefined) {
      where.quartos = { gte: q.quartosMin };
    }
    if (q.vagasMin !== undefined) {
      where.vagas = { gte: q.vagasMin };
    }
    if (q.valorMin !== undefined || q.valorMax !== undefined) {
      where.valor = {};
      if (q.valorMin !== undefined) {
        where.valor.gte = q.valorMin;
      }
      if (q.valorMax !== undefined) {
        where.valor.lte = q.valorMax;
      }
    }

    return where;
  }
}
