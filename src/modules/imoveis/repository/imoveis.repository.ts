import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export const imovelDetailedSelect = {
  id: true,
  codigo: true,
  titulo: true,
  descricao: true,
  tipo: true,
  finalidade: true,
  status: true,
  destaque: true,
  isLancamento: true,
  endereco: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  estado: true,
  cep: true,
  latitude: true,
  longitude: true,
  valor: true,
  valorCondominio: true,
  valorIptu: true,
  area: true,
  areaTotal: true,
  quartos: true,
  suites: true,
  banheiros: true,
  vagas: true,
  anoConstrucao: true,
  mobiliado: true,
  caracteristicas: true,
  videoUrl: true,
  plantaUrl: true,
  tourVirtualUrl: true,
  publicadoFeed: true,
  publicadoOlx: true,
  publicadoChavesNaMao: true,
  publicadoSub100: true,
  publicadoZap: true,
  publicadoVivaReal: true,
  createdAt: true,
  updatedAt: true,
  fotos: {
    orderBy: { ordem: 'asc' as const },
    select: {
      id: true,
      url: true,
      storageKey: true,
      legenda: true,
      ordem: true,
      isCapa: true,
    },
  },
  _count: { select: { clientesInteressados: true, interacoes: true } },
} satisfies Prisma.ImovelSelect;

export const imovelListSelect = {
  id: true,
  codigo: true,
  titulo: true,
  tipo: true,
  finalidade: true,
  status: true,
  destaque: true,
  isLancamento: true,
  bairro: true,
  cidade: true,
  estado: true,
  valor: true,
  area: true,
  quartos: true,
  banheiros: true,
  suites: true,
  vagas: true,
  createdAt: true,
  fotos: {
    where: { isCapa: true },
    take: 1,
    select: { url: true, legenda: true },
  },
} satisfies Prisma.ImovelSelect;

export type ImovelDetailed = Prisma.ImovelGetPayload<{ select: typeof imovelDetailedSelect }>;
export type ImovelListItem = Prisma.ImovelGetPayload<{ select: typeof imovelListSelect }>;

interface FindManyArgs {
  skip: number;
  take: number;
  where: Prisma.ImovelWhereInput;
  orderBy: Prisma.ImovelOrderByWithRelationInput | Prisma.ImovelOrderByWithRelationInput[];
}

@Injectable()
export class ImoveisRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ImovelCreateInput): Promise<ImovelDetailed> {
    return await this.prisma.imovel.create({ data, select: imovelDetailedSelect });
  }

  async findById(id: string): Promise<ImovelDetailed | null> {
    return await this.prisma.imovel.findFirst({
      where: { id, deletedAt: null },
      select: imovelDetailedSelect,
    });
  }

  async findByCodigo(codigo: string): Promise<ImovelDetailed | null> {
    return await this.prisma.imovel.findFirst({
      where: { codigo, deletedAt: null },
      select: imovelDetailedSelect,
    });
  }

  async update(id: string, data: Prisma.ImovelUpdateInput): Promise<ImovelDetailed> {
    return await this.prisma.imovel.update({
      where: { id },
      data,
      select: imovelDetailedSelect,
    });
  }

  async softDelete(id: string): Promise<ImovelDetailed> {
    return await this.prisma.imovel.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INATIVO' },
      select: imovelDetailedSelect,
    });
  }

  async findManyWithTotal(args: FindManyArgs): Promise<{ items: ImovelListItem[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.imovel.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: args.orderBy,
        select: imovelListSelect,
      }),
      this.prisma.imovel.count({ where: args.where }),
    ]);

    return { items, total };
  }

  async findAllForFeed(): Promise<ImovelDetailed[]> {
    return await this.prisma.imovel.findMany({
      where: { deletedAt: null, status: 'DISPONIVEL', publicadoFeed: true },
      select: imovelDetailedSelect,
      orderBy: [{ destaque: 'desc' }, { updatedAt: 'desc' }],
    });
  }
}
