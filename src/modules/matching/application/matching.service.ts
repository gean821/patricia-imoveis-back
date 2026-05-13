import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { imovelListSelect } from '../../imoveis/repository/imoveis.repository';
import { clienteListSelect } from '../../clientes/repository/clientes.repository';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async imoveisParaCliente(clienteId: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, deletedAt: null },
    });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const where: Prisma.ImovelWhereInput = {
      deletedAt: null,
      status: 'DISPONIVEL',
    };

    if (cliente.tipoDesejado.length > 0) where.tipo = { in: cliente.tipoDesejado };
    if (cliente.finalidadeDesejada) {
      where.OR = [{ finalidade: cliente.finalidadeDesejada }, { finalidade: 'AMBOS' }];
    }
    if (cliente.cidadeDesejada) {
      where.cidade = { contains: cliente.cidadeDesejada, mode: 'insensitive' };
    }
    if (cliente.bairroDesejado) {
      where.bairro = { contains: cliente.bairroDesejado, mode: 'insensitive' };
    }
    if (cliente.valorMin || cliente.valorMax) {
      where.valor = {};
      if (cliente.valorMin) where.valor.gte = cliente.valorMin;
      if (cliente.valorMax) where.valor.lte = cliente.valorMax;
    }
    if (cliente.quartosMin) where.quartos = { gte: cliente.quartosMin };
    if (cliente.vagasMin) where.vagas = { gte: cliente.vagasMin };

    return this.prisma.imovel.findMany({
      where,
      select: imovelListSelect,
      orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
  }

  async clientesParaImovel(imovelId: string) {
    const imovel = await this.prisma.imovel.findFirst({
      where: { id: imovelId, deletedAt: null },
    });
    if (!imovel) throw new NotFoundException('Imóvel não encontrado');

    const where: Prisma.ClienteWhereInput = {
      deletedAt: null,
      AND: [
        { OR: [{ tipoDesejado: { has: imovel.tipo } }, { tipoDesejado: { isEmpty: true } }] },
        {
          OR: [
            { cidadeDesejada: null },
            { cidadeDesejada: { equals: imovel.cidade, mode: 'insensitive' } },
          ],
        },
        { OR: [{ valorMin: null }, { valorMin: { lte: imovel.valor } }] },
        { OR: [{ valorMax: null }, { valorMax: { gte: imovel.valor } }] },
      ],
    };
    if (imovel.quartos !== null && imovel.quartos !== undefined) {
      where.AND = [
        ...(where.AND as Prisma.ClienteWhereInput[]),
        { OR: [{ quartosMin: null }, { quartosMin: { lte: imovel.quartos } }] },
      ];
    }

    return this.prisma.cliente.findMany({
      where,
      select: clienteListSelect,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}