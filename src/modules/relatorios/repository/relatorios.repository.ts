import { Injectable } from '@nestjs/common';
import { StatusImovel, TipoInteracao } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export interface PeriodoRange {
  inicio: Date;
  fim: Date;
}

export interface ClienteNoPeriodo {
  createdAt: Date;
  origem: string | null;
}

export interface InteracaoNoPeriodo {
  data: Date;
  tipo: TipoInteracao;
}

@Injectable()
export class RelatoriosRepository {
  constructor(private readonly prisma: PrismaService) { }

  async clientesNoPeriodo(range: PeriodoRange): Promise<ClienteNoPeriodo[]> {
    return await this.prisma.cliente.findMany({
      where: { deletedAt: null, createdAt: { gte: range.inicio, lte: range.fim } },
      select: { createdAt: true, origem: true },
    });
  }

  async interacoesNoPeriodo(range: PeriodoRange): Promise<InteracaoNoPeriodo[]> {
    return await this.prisma.interacao.findMany({
      where: { data: { gte: range.inicio, lte: range.fim } },
      select: { data: true, tipo: true },
    });
  }

  async statusImoveis(): Promise<StatusImovel[]> {
    const imoveis = await this.prisma.imovel.findMany({
      where: { deletedAt: null },
      select: { status: true },
    });

    return imoveis.map((imovel) => imovel.status);
  }
}
