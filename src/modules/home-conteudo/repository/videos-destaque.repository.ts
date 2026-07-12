import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export const videoDestaqueSelect = {
  id: true,
  titulo: true,
  url: true,
  storageKey: true,
  ordem: true,
  ativo: true,
  createdAt: true,
} satisfies Prisma.VideoDestaqueSelect;

export type VideoDestaqueDetailed = Prisma.VideoDestaqueGetPayload<{
  select: typeof videoDestaqueSelect;
}>;

interface FindManyArgs {
  skip: number;
  take: number;
  where: Prisma.VideoDestaqueWhereInput;
}

@Injectable()
export class VideosDestaqueRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.VideoDestaqueCreateInput): Promise<VideoDestaqueDetailed> {
    return await this.prisma.videoDestaque.create({ data, select: videoDestaqueSelect });
  }

  async findById(id: string): Promise<VideoDestaqueDetailed | null> {
    return await this.prisma.videoDestaque.findUnique({
      where: { id },
      select: videoDestaqueSelect,
    });
  }

  async update(id: string, data: Prisma.VideoDestaqueUpdateInput): Promise<VideoDestaqueDetailed> {
    return await this.prisma.videoDestaque.update({
      where: { id },
      data,
      select: videoDestaqueSelect,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.videoDestaque.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return await this.prisma.videoDestaque.count();
  }

  async findManyWithTotal(
    args: FindManyArgs,
  ): Promise<{ items: VideoDestaqueDetailed[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.videoDestaque.findMany({
        skip: args.skip,
        take: args.take,
        where: args.where,
        orderBy: { ordem: 'asc' },
        select: videoDestaqueSelect,
      }),
      this.prisma.videoDestaque.count({ where: args.where }),
    ]);

    return { items, total };
  }

  async reordenar(ids: string[]): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.videoDestaque.update({ where: { id }, data: { ordem: index } }),
      ),
    );
  }
}
