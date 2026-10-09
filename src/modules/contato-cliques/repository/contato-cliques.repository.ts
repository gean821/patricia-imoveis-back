import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class ContatoCliquesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findImovelIdPorCodigo(codigo: string): Promise<string | null> {
    const imovel = await this.prisma.imovel.findFirst({
      where: { codigo, deletedAt: null },
      select: { id: true },
    });
    return imovel?.id ?? null;
  }

  async create(data: Prisma.ContatoCliqueCreateInput): Promise<void> {
    await this.prisma.contatoClique.create({ data, select: { id: true } });
  }
}
