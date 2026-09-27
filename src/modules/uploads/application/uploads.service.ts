import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '../../../shared/storage/storage.service';
import {
  PresignUploadDto,
  PresignUploadResponseDto,
  UploadTipo,
} from '../presentation/dto/upload.dtos';

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const ALLOWED_DOC_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_IMAGE = 30 * 1024 * 1024;
const MAX_VIDEO = 600 * 1024 * 1024;
const MAX_DOC = 30 * 1024 * 1024;

interface UploadRule {
  allowed: Set<string>;
  maxSize: number;
  requiresImovel: boolean;
  prefix: (imovelId?: string) => string;
}

const UPLOAD_RULES: Record<UploadTipo, UploadRule> = {
  [UploadTipo.FOTO_IMOVEL]: {
    allowed: ALLOWED_IMAGE_MIME,
    maxSize: MAX_IMAGE,
    requiresImovel: true,
    prefix: (imovelId) => `imoveis/${imovelId}/fotos`,
  },
  [UploadTipo.VIDEO_IMOVEL]: {
    allowed: ALLOWED_VIDEO_MIME,
    maxSize: MAX_VIDEO,
    requiresImovel: true,
    prefix: (imovelId) => `imoveis/${imovelId}/videos`,
  },
  [UploadTipo.VIDEO_IMOVEL_CAPA]: {
    allowed: ALLOWED_IMAGE_MIME,
    maxSize: MAX_IMAGE,
    requiresImovel: true,
    prefix: (imovelId) => `imoveis/${imovelId}/videos-capas`,
  },
  [UploadTipo.PLANTA_IMOVEL]: {
    allowed: ALLOWED_DOC_MIME,
    maxSize: MAX_DOC,
    requiresImovel: true,
    prefix: (imovelId) => `imoveis/${imovelId}/plantas`,
  },
  [UploadTipo.HERO_IMAGEM]: {
    allowed: ALLOWED_IMAGE_MIME,
    maxSize: MAX_IMAGE,
    requiresImovel: false,
    prefix: () => 'home/hero',
  },
  [UploadTipo.VIDEO_DESTAQUE]: {
    allowed: ALLOWED_VIDEO_MIME,
    maxSize: MAX_VIDEO,
    requiresImovel: false,
    prefix: () => 'home/reels',
  },
  [UploadTipo.VIDEO_DESTAQUE_CAPA]: {
    allowed: ALLOWED_IMAGE_MIME,
    maxSize: MAX_IMAGE,
    requiresImovel: false,
    prefix: () => 'home/reels-capas',
  },
};

@Injectable()
export class UploadsService {
  constructor(private readonly storage: StorageService) { }

  async presign(dto: PresignUploadDto): Promise<PresignUploadResponseDto> {
    const rule = UPLOAD_RULES[dto.tipo];

    if (rule.requiresImovel && !dto.imovelId) {
      throw new BadRequestException('imovelId obrigatório para esse tipo de upload');
    }
    if (!rule.allowed.has(dto.contentType)) {
      throw new BadRequestException(
        `Tipo não permitido (${dto.contentType}). Aceitos: ${[...rule.allowed].join(', ')}`,
      );
    }
    if (dto.sizeBytes > rule.maxSize) {
      throw new BadRequestException(
        `Arquivo muito grande (max ${Math.round(rule.maxSize / 1024 / 1024)}MB)`,
      );
    }

    const key = this.storage.buildKey(rule.prefix(dto.imovelId), dto.filename);
    const uploadUrl = await this.storage.getSignedUploadUrl(key, dto.contentType);

    return { uploadUrl, key, url: this.storage.buildPublicUrl(key) };
  }

  async delete(key: string): Promise<void> {
    await this.storage.delete(key);
  }
}