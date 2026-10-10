import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ImoveisRepository, ImovelDetailed } from '../repository/imoveis.repository';
import {
  CreateImovelDto,
  ListImoveisQueryDto,
  ListBairrosQueryDto,
  ListImoveisSimilaresQueryDto,
  UpdateImovelDto,
} from '../presentation/dto/imovel.dtos';
import {
  BairroResponseDto,
  ImovelListItemResponseDto,
  ImovelResponseDto,
} from '../presentation/dto/imovel-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { StorageService } from '../../../shared/storage/storage.service';
import {
  mapBairroToResponse,
  mapImovelToListItem,
  mapImovelToResponse,
} from './imoveis.mapper';
import { agruparBairros, slugBairro } from './bairro-slug';
import {
  FAIXA_VALOR_CANDIDATOS,
  finalidadesCompativeis,
  ranquearSimilares,
} from './imoveis-similaridade';

const MAX_CANDIDATOS_SIMILARES = 60;

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
    const where = await this.buildWhere(query);

    if (query.bairroSlug) {
      where.bairro = { in: await this.resolverVariantesBairro(query.bairroSlug) };
    }

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

  async listBairrosPublic(
    query: ListBairrosQueryDto,
  ): Promise<PaginatedResponseDto<BairroResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const bairros = agruparBairros(
      await this.repo.countPorBairro({ deletedAt: null, status: 'DISPONIVEL' }),
    );
    const busca = query.search ? slugBairro(query.search) : '';
    const filtrados = busca ? bairros.filter((b) => b.slug.includes(busca)) : bairros;
    const pagina = filtrados.slice((page - 1) * limit, page * limit);

    return new PaginatedResponseDto(
      pagina.map(mapBairroToResponse),
      filtrados.length,
      page,
      limit,
    );
  }

  async listSimilaresPublic(
    codigo: string,
    query: ListImoveisSimilaresQueryDto,
  ): Promise<PaginatedResponseDto<ImovelListItemResponseDto>> {
    const referencia = await this.repo.findByCodigo(codigo);

    if (!referencia) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 6;
    const candidatos = await this.repo.findSimilaresCandidatos(
      await this.buildSimilaresWhere(referencia),
      MAX_CANDIDATOS_SIMILARES,
    );
    const ranqueados = ranquearSimilares(referencia, candidatos);
    const pagina = ranqueados.slice((page - 1) * limit, page * limit);

    return new PaginatedResponseDto(
      pagina.map(mapImovelToListItem),
      ranqueados.length,
      page,
      limit,
    );
  }

  /** Slug → todas as grafias cadastradas do bairro. Slug desconhecido → [] (lista vazia). */
  private async resolverVariantesBairro(slug: string): Promise<string[]> {
    const bairros = agruparBairros(await this.repo.countPorBairro({ deletedAt: null }));
    return bairros.find((b) => b.slug === slug)?.variantes ?? [];
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

  /**
   * Pré-filtro no banco: mesma cidade, finalidade compatível e parecido em
   * pelo menos tipo, bairro ou faixa de preço. O ranking fino é em memória
   * (`ranquearSimilares`) — o catálogo de Maringá é pequeno.
   */
  private async buildSimilaresWhere(referencia: ImovelDetailed): Promise<Prisma.ImovelWhereInput> {
    const valor = referencia.valor.toNumber();
    const [idsMesmaCidade, idsMesmoBairro] = await Promise.all([
      this.repo.findIdsPorTexto(['cidade'], referencia.cidade, 'igual'),
      this.repo.findIdsPorTexto(['bairro'], referencia.bairro, 'igual'),
    ]);

    return {
      deletedAt: null,
      status: 'DISPONIVEL',
      id: { in: idsMesmaCidade, not: referencia.id },
      finalidade: { in: finalidadesCompativeis(referencia.finalidade) },
      OR: [
        { tipo: referencia.tipo },
        { id: { in: idsMesmoBairro } },
        {
          valor: {
            gte: valor * FAIXA_VALOR_CANDIDATOS.min,
            lte: valor * FAIXA_VALOR_CANDIDATOS.max,
          },
        },
      ],
    };
  }

  /** Filtros de texto ignoram acento ("Maringa" acha "Maringá") — ver `findIdsPorTexto`. */
  private async buildWhere(q: ListImoveisQueryDto): Promise<Prisma.ImovelWhereInput> {
    const where: Prisma.ImovelWhereInput = { deletedAt: null };
    const filtrosTexto: Prisma.ImovelWhereInput[] = [];

    if (q.search) {
      const ids = await this.repo.findIdsPorTexto(
        ['titulo', 'codigo', 'bairro', 'cidade', 'descricao'],
        q.search,
        'contem',
      );
      filtrosTexto.push({ id: { in: ids } });
    }
    if (q.cidade) {
      const ids = await this.repo.findIdsPorTexto(['cidade'], q.cidade, 'contem');
      filtrosTexto.push({ id: { in: ids } });
    }
    if (q.bairro) {
      const ids = await this.repo.findIdsPorTexto(['bairro'], q.bairro, 'contem');
      filtrosTexto.push({ id: { in: ids } });
    }
    if (filtrosTexto.length > 0) {
      where.AND = filtrosTexto;
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
