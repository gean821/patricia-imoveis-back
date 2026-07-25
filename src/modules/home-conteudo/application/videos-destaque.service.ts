import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  VideoDestaqueDetailed,
  VideosDestaqueRepository,
} from '../repository/videos-destaque.repository';
import { StorageService } from '../../../shared/storage/storage.service';
import {
  CreateVideoDestaqueDto,
  ListVideosDestaqueQueryDto,
  ReordenarVideosDestaqueDto,
  UpdateVideoDestaqueDto,
} from '../presentation/dto/video-destaque.dtos';
import { VideoDestaqueResponseDto } from '../presentation/dto/video-destaque-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { mapVideoDestaqueToResponse } from './home-conteudo.mapper';

@Injectable()
export class VideosDestaqueService {
  constructor(
    private readonly repo: VideosDestaqueRepository,
    private readonly storage: StorageService,
  ) { }

  async create(dto: CreateVideoDestaqueDto): Promise<VideoDestaqueResponseDto> {
    const ordem = dto.ordem ?? (await this.repo.count());
    const created = await this.repo.create({ ...dto, ordem });
    return mapVideoDestaqueToResponse(created);
  }

  async update(id: string, dto: UpdateVideoDestaqueDto): Promise<VideoDestaqueResponseDto> {
    await this.findEntityById(id);
    const updated = await this.repo.update(id, dto);
    return mapVideoDestaqueToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findEntityById(id);
    await this.storage.delete(entity.storageKey);
    if (entity.capaStorageKey) {
      await this.storage.delete(entity.capaStorageKey);
    }
    await this.repo.remove(id);
  }

  async reordenar(dto: ReordenarVideosDestaqueDto): Promise<void> {
    await this.repo.reordenar(dto.ids);
  }

  async list(
    query: ListVideosDestaqueQueryDto,
  ): Promise<PaginatedResponseDto<VideoDestaqueResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where = this.buildWhere(query);

    const { items, total } = await this.repo.findManyWithTotal({
      skip: (page - 1) * limit,
      take: limit,
      where,
    });

    return new PaginatedResponseDto(items.map(mapVideoDestaqueToResponse), total, page, limit);
  }

  async listPublic(): Promise<PaginatedResponseDto<VideoDestaqueResponseDto>> {
    return await this.list({ ativo: true, limit: 50 });
  }

  private async findEntityById(id: string): Promise<VideoDestaqueDetailed> {
    const entity = await this.repo.findById(id);

    if (!entity) {
      throw new NotFoundException('Vídeo em destaque não encontrado');
    }

    return entity;
  }

  private buildWhere(q: ListVideosDestaqueQueryDto): Prisma.VideoDestaqueWhereInput {
    const where: Prisma.VideoDestaqueWhereInput = {};

    if (q.ativo !== undefined) {
      where.ativo = q.ativo;
    }

    return where;
  }
}
