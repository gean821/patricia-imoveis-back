import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
  ImovelListItem,
  imovelListSelect,
} from '../../imoveis/repository/imoveis.repository';
import {
  ClienteListItem,
  clienteListSelect,
} from '../../clientes/repository/clientes.repository';

export const clienteMatchSelect = {
  id: true,
  tipoDesejado: true,
  finalidadeDesejada: true,
  bairroDesejado: true,
  cidadeDesejada: true,
  valorMin: true,
  valorMax: true,
  quartosMin: true,
  vagasMin: true,
} satisfies Prisma.ClienteSelect;

export const imovelMatchSelect = {
  id: true,
  tipo: true,
  finalidade: true,
  cidade: true,
  bairro: true,
  valor: true,
  quartos: true,
  vagas: true,
} satisfies Prisma.ImovelSelect;

export type ClienteMatchPrefs = Prisma.ClienteGetPayload<{ select: typeof clienteMatchSelect }>;
export type ImovelMatchKeys = Prisma.ImovelGetPayload<{ select: typeof imovelMatchSelect }>;

interface FindImoveisArgs {
  skip: number;
  take: number;
  where: Prisma.ImovelWhereInput;
}

interface FindClientesArgs {
  skip: number;
  take: number;
  where: Prisma.ClienteWhereInput;
}

@Injectable()
export class MatchingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findClientePrefs(id: string): Promise<ClienteMatchPrefs | null> {
    return await this.prisma.cliente.findFirst({
      where: { id, deletedAt: null },
      select: clienteMatchSelect,
    });
  }

  async findImovelKeys(id: string): Promise<ImovelMatchKeys | null> {
    return await this.prisma.imovel.findFirst({
      where: { id, deletedAt: null },
      select: imovelMatchSelect,
    });
  }

  async findMatchingImoveis(
    args: FindImoveisArgs,
  ): Promise<{ items: ImovelListItem[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.imovel.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
        select: imovelListSelect,
      }),
      this.prisma.imovel.count({ where: args.where }),
    ]);

    return { items, total };
  }

  async findMatchingClientes(
    args: FindClientesArgs,
  ): Promise<{ items: ClienteListItem[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: { createdAt: 'desc' },
        select: clienteListSelect,
      }),
      this.prisma.cliente.count({ where: args.where }),
    ]);

    return { items, total };
  }
}
