import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    select: {
      id: true,
      interesse: true,
      nota: true,
      createdAt: true,
      imovel: {
        select: { id: true, codigo: true, titulo: true, bairro: true, cidade: true, valor: true, status: true },
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

@Injectable()
export class ClientesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ClienteCreateInput): Promise<ClienteDetailed> {
    return this.prisma.cliente.create({ data, select: clienteDetailedSelect });
  }

  findById(id: string): Promise<ClienteDetailed | null> {
    return this.prisma.cliente.findFirst({
      where: { id, deletedAt: null },
      select: clienteDetailedSelect,
    });
  }

  update(id: string, data: Prisma.ClienteUpdateInput): Promise<ClienteDetailed> {
    return this.prisma.cliente.update({ where: { id }, data, select: clienteDetailedSelect });
  }

  softDelete(id: string): Promise<ClienteDetailed> {
    return this.prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: clienteDetailedSelect,
    });
  }

  async findManyWithTotal(args: {
    skip: number;
    take: number;
    where: Prisma.ClienteWhereInput;
    orderBy: Prisma.ClienteOrderByWithRelationInput;
  }): Promise<{ items: ClienteListItem[]; total: number }> {
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

  upsertImovelLink(clienteId: string, imovelId: string, interesse: number, nota?: string) {
    return this.prisma.clienteImovel.upsert({
      where: { clienteId_imovelId: { clienteId, imovelId } },
      update: { interesse, nota },
      create: { clienteId, imovelId, interesse, nota },
    });
  }

  removeImovelLink(clienteId: string, imovelId: string) {
    return this.prisma.clienteImovel.delete({
      where: { clienteId_imovelId: { clienteId, imovelId } },
    });
  }
}