import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export const interacaoSelect = {
  id: true,
  clienteId: true,
  imovelId: true,
  tipo: true,
  titulo: true,
  descricao: true,
  data: true,
  createdAt: true,
  imovel: {
    select: { id: true, codigo: true, titulo: true },
  },
  cliente: {
    select: { id: true, nome: true, telefone: true },
  },
} satisfies Prisma.InteracaoSelect;

export type InteracaoDetailed = Prisma.InteracaoGetPayload<{ select: typeof interacaoSelect }>;

@Injectable()
export class InteracoesRepository {
  constructor(private readonly prisma: PrismaService) { }

  create(data: Prisma.InteracaoCreateInput): Promise<InteracaoDetailed> {
    return this.prisma.interacao.create({ data, select: interacaoSelect });
  }

  findById(id: string): Promise<InteracaoDetailed | null> {
    return this.prisma.interacao.findUnique({ where: { id }, select: interacaoSelect });
  }

  update(id: string, data: Prisma.InteracaoUpdateInput): Promise<InteracaoDetailed> {
    return this.prisma.interacao.update({ where: { id }, data, select: interacaoSelect });
  }

  delete(id: string) {
    return this.prisma.interacao.delete({ where: { id } });
  }

  async findManyWithTotal(args: {
    skip: number;
    take: number;
    where: Prisma.InteracaoWhereInput;
  }): Promise<{ items: InteracaoDetailed[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.interacao.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: { data: 'desc' },
        select: interacaoSelect,
      }),
      this.prisma.interacao.count({ where: args.where }),
    ]);
    return { items, total };
  }

  findTimelineByCliente(clienteId: string): Promise<InteracaoDetailed[]> {
    return this.prisma.interacao.findMany({
      where: { clienteId },
      orderBy: { data: 'desc' },
      select: interacaoSelect,
    });
  }
}