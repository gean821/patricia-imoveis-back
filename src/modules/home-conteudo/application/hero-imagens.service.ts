import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HeroImagemDetailed, HeroImagensRepository } from '../repository/hero-imagens.repository';
import { StorageService } from '../../../shared/storage/storage.service';
import {
  CreateHeroImagemDto,
  ListHeroImagensQueryDto,
  ReordenarHeroImagensDto,
  UpdateHeroImagemDto,
} from '../presentation/dto/hero-imagem.dtos';
import { HeroImagemResponseDto } from '../presentation/dto/hero-imagem-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { mapHeroImagemToResponse } from './home-conteudo.mapper';

@Injectable()
export class HeroImagensService {
  constructor(
    private readonly repo: HeroImagensRepository,
    private readonly storage: StorageService,
  ) { }

  async create(dto: CreateHeroImagemDto): Promise<HeroImagemResponseDto> {
    const ordem = dto.ordem ?? (await this.repo.count());
    const created = await this.repo.create({ ...dto, ordem });
    return mapHeroImagemToResponse(created);
  }

  async update(
    id: string,
    dto: UpdateHeroImagemDto): Promise<HeroImagemResponseDto> {
    await this.findEntityById(id);
    const updated = await this.repo.update(id, dto);
    return mapHeroImagemToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findEntityById(id);
    await this.storage.delete(entity.storageKey);
    await this.repo.remove(id);
  }

  async reordenar(dto: ReordenarHeroImagensDto): Promise<void> {
    await this.repo.reordenar(dto.ids);
  }

  async list(query: ListHeroImagensQueryDto): Promise<PaginatedResponseDto<HeroImagemResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where = this.buildWhere(query);

    const { items, total } = await this.repo.findManyWithTotal({
      skip: (page - 1) * limit,
      take: limit,
      where,
    });

    return new PaginatedResponseDto(items.map(mapHeroImagemToResponse), total, page, limit);
  }

  async listPublic(): Promise<PaginatedResponseDto<HeroImagemResponseDto>> {
    return await this.list({ ativo: true, limit: 50 });
  }

  private async findEntityById(id: string): Promise<HeroImagemDetailed> {
    const entity = await this.repo.findById(id);

    if (!entity) {
      throw new NotFoundException('Imagem do hero não encontrada');
    }

    return entity;
  }

  private buildWhere(q: ListHeroImagensQueryDto): Prisma.HeroImagemWhereInput {
    const where: Prisma.HeroImagemWhereInput = {};

    if (q.ativo !== undefined) {
      where.ativo = q.ativo;
    }

    return where;
  }
}
