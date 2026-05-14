import { Injectable } from '@nestjs/common';
import { Interacao, Prisma } from '@prisma/client';
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

interface FindManyArgs {
  skip: number;
  take: number;
  where: Prisma.InteracaoWhereInput;
}

@Injectable()
export class InteracoesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.InteracaoCreateInput): Promise<InteracaoDetailed> {
    return await this.prisma.interacao.create({ data, select: interacaoSelect });
  }

  async findById(id: string): Promise<InteracaoDetailed | null> {
    return await this.prisma.interacao.findUnique({ where: { id }, select: interacaoSelect });
  }

  async update(id: string, data: Prisma.InteracaoUpdateInput): Promise<InteracaoDetailed> {
    return await this.prisma.interacao.update({
      where: { id },
      data,
      select: interacaoSelect,
    });
  }

  async delete(id: string): Promise<Interacao> {
    return await this.prisma.interacao.delete({ where: { id } });
  }

  async findManyWithTotal(
    args: FindManyArgs,
  ): Promise<{ items: InteracaoDetailed[]; total: number }> {
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
}
