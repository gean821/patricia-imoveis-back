import { Injectable } from '@nestjs/common';
import { ClienteImovel, Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export const clienteDetailedSelect = {
  id: true,
  nome: true,
  telefone: true,
  email: true,
  cpf: true,
  origem: true,
  observacoes: true,
  tipoDesejado: true,
  finalidadeDesejada: true,
  bairroDesejado: true,
  cidadeDesejada: true,
  valorMin: true,
  valorMax: true,
  quartosMin: true,
  vagasMin: true,
  createdAt: true,
  updatedAt: true,
  imoveis: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      interesse: true,
      nota: true,
      createdAt: true,
      imovel: {
        select: {
          id: true,
          codigo: true,
          titulo: true,
          bairro: true,
          cidade: true,
          valor: true,
          status: true,
        },
      },
    },
  },
  _count: { select: { interacoes: true, imoveis: true } },
} satisfies Prisma.ClienteSelect;

export const clienteListSelect = {
  id: true,
  nome: true,
  telefone: true,
  email: true,
  cidadeDesejada: true,
  bairroDesejado: true,
  finalidadeDesejada: true,
  createdAt: true,
  _count: { select: { interacoes: true, imoveis: true } },
} satisfies Prisma.ClienteSelect;

export type ClienteDetailed = Prisma.ClienteGetPayload<{ select: typeof clienteDetailedSelect }>;
export type ClienteListItem = Prisma.ClienteGetPayload<{ select: typeof clienteListSelect }>;

interface FindManyArgs {
  skip: number;
  take: number;
  where: Prisma.ClienteWhereInput;
  orderBy: Prisma.ClienteOrderByWithRelationInput | Prisma.ClienteOrderByWithRelationInput[];
}

@Injectable()
export class ClientesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClienteCreateInput): Promise<ClienteDetailed> {
    return await this.prisma.cliente.create({ data, select: clienteDetailedSelect });
  }

  async findById(id: string): Promise<ClienteDetailed | null> {
    return await this.prisma.cliente.findFirst({
      where: { id, deletedAt: null },
      select: clienteDetailedSelect,
    });
  }

  async update(id: string, data: Prisma.ClienteUpdateInput): Promise<ClienteDetailed> {
    return await this.prisma.cliente.update({
      where: { id },
      data,
      select: clienteDetailedSelect,
    });
  }

  async softDelete(id: string): Promise<ClienteDetailed> {
    return await this.prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: clienteDetailedSelect,
    });
  }

  async findManyWithTotal(args: FindManyArgs): Promise<{ items: ClienteListItem[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: args.orderBy,
        select: clienteListSelect,
      }),
      this.prisma.cliente.count({ where: args.where }),
    ]);

    return { items, total };
  }

  async upsertImovelLink(
    clienteId: string,
    imovelId: string,
    interesse: number,
    nota?: string,
  ): Promise<ClienteImovel> {
    return await this.prisma.clienteImovel.upsert({
      where: { clienteId_imovelId: { clienteId, imovelId } },
      update: { interesse, nota },
      create: { clienteId, imovelId, interesse, nota },
    });
  }

  async removeImovelLink(clienteId: string, imovelId: string): Promise<ClienteImovel> {
    return await this.prisma.clienteImovel.delete({
      where: { clienteId_imovelId: { clienteId, imovelId } },
    });
  }
}
