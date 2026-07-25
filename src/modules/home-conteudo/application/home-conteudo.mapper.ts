import { HeroImagemDetailed } from '../repository/hero-imagens.repository';
import { VideoDestaqueDetailed } from '../repository/videos-destaque.repository';
import { HeroImagemResponseDto } from '../presentation/dto/hero-imagem-response.dtos';
import { VideoDestaqueResponseDto } from '../presentation/dto/video-destaque-response.dtos';

export function mapHeroImagemToResponse(entity: HeroImagemDetailed): HeroImagemResponseDto {
  return {
    id: entity.id,
    url: entity.url,
    storageKey: entity.storageKey,
    ordem: entity.ordem,
    ativo: entity.ativo,
    createdAt: entity.createdAt,
  };
}

export function mapVideoDestaqueToResponse(entity: VideoDestaqueDetailed): VideoDestaqueResponseDto {
  return {
    id: entity.id,
    titulo: entity.titulo,
    url: entity.url,
    storageKey: entity.storageKey,
    capaUrl: entity.capaUrl,
    ordem: entity.ordem,
    ativo: entity.ativo,
    createdAt: entity.createdAt,
  };
}
