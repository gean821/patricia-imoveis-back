import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export const heroImagemSelect = {
  id: true,
  url: true,
  storageKey: true,
  ordem: true,
  ativo: true,
  createdAt: true,
} satisfies Prisma.HeroImagemSelect;

export type HeroImagemDetailed = Prisma.HeroImagemGetPayload<{ select: typeof heroImagemSelect }>;

interface FindManyArgs {
  skip: number;
  take: number;
  where: Prisma.HeroImagemWhereInput;
}

@Injectable()
export class HeroImagensRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.HeroImagemCreateInput): Promise<HeroImagemDetailed> {
    return await this.prisma.heroImagem.create({ data, select: heroImagemSelect });
  }

  async findById(id: string): Promise<HeroImagemDetailed | null> {
    return await this.prisma.heroImagem.findUnique({ where: { id }, select: heroImagemSelect });
  }

  async update(id: string, data: Prisma.HeroImagemUpdateInput): Promise<HeroImagemDetailed> {
    return await this.prisma.heroImagem.update({ where: { id }, data, select: heroImagemSelect });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.heroImagem.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return await this.prisma.heroImagem.count();
  }

  async findManyWithTotal(
    args: FindManyArgs,
  ): Promise<{ items: HeroImagemDetailed[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.heroImagem.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: { ordem: 'asc' },
        select: heroImagemSelect,
      }),
      this.prisma.heroImagem.count({ where: args.where }),
    ]);

    return { items, total };
  }

  async reordenar(ids: string[]): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.heroImagem.update({ where: { id }, data: { ordem: index } }),
      ),
    );
  }
}
