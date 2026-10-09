import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export const clienteAlertaSelect = {
  id: true,
  telefone: true,
  email: true,
  tipoDesejado: true,
  finalidadeDesejada: true,
  bairroDesejado: true,
  cidadeDesejada: true,
  valorMax: true,
  quartosMin: true,
} satisfies Prisma.ClienteSelect;

export type ClienteAlerta = Prisma.ClienteGetPayload<{ select: typeof clienteAlertaSelect }>;

export interface InteracaoAlertaInput {
  titulo: string;
  descricao: string;
  imovelId?: string;
}

@Injectable()
export class AlertasRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findClientesPorFinalTelefone(finalTelefone: string): Promise<ClienteAlerta[]> {
    return await this.prisma.cliente.findMany({
      where: { deletedAt: null, telefone: { endsWith: finalTelefone } },
      select: clienteAlertaSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findImovelIdPorCodigo(codigo: string): Promise<string | null> {
    const imovel = await this.prisma.imovel.findFirst({
      where: { codigo, deletedAt: null },
      select: { id: true },
    });
    return imovel?.id ?? null;
  }

  async createClienteComInteracao(
    data: Prisma.ClienteCreateInput,
    interacao: InteracaoAlertaInput,
  ): Promise<void> {
    await this.prisma.cliente.create({
      data: {
        ...data,
        interacoes: { create: this.buildInteracao(interacao) },
      },
      select: { id: true },
    });
  }

  async updateClienteComInteracao(
    id: string,
    data: Prisma.ClienteUpdateInput,
    interacao: InteracaoAlertaInput,
  ): Promise<void> {
    await this.prisma.cliente.update({
      where: { id },
      data: {
        ...data,
        interacoes: { create: this.buildInteracao(interacao) },
      },
      select: { id: true },
    });
  }

  private buildInteracao(
    interacao: InteracaoAlertaInput,
  ): Prisma.InteracaoCreateWithoutClienteInput {
    return {
      tipo: 'CONTATO',
      titulo: interacao.titulo,
      descricao: interacao.descricao,
      imovel: interacao.imovelId ? { connect: { id: interacao.imovelId } } : undefined,
    };
  }
}
