import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '../../../shared/storage/storage.service';
import { UploadFileResponseDto } from '../presentation/dto/upload.dtos';

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const ALLOWED_DOC_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 200 * 1024 * 1024;
const MAX_DOC = 25 * 1024 * 1024;

@Injectable()
export class UploadsService {
  constructor(private readonly storage: StorageService) {}

  async uploadFotoImovel(
    imovelId: string,
    file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    this.assertFile(file, ALLOWED_IMAGE_MIME, MAX_IMAGE);
    const result = await this.storage.upload(`imoveis/${imovelId}/fotos`, file);
    return { key: result.key, url: result.url };
  }

  async uploadVideoImovel(
    imovelId: string,
    file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    this.assertFile(file, ALLOWED_VIDEO_MIME, MAX_VIDEO);
    const result = await this.storage.upload(`imoveis/${imovelId}/videos`, file);
    return { key: result.key, url: result.url };
  }

  async uploadPlantaImovel(
    imovelId: string,
    file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    this.assertFile(file, ALLOWED_DOC_MIME, MAX_DOC);
    const result = await this.storage.upload(`imoveis/${imovelId}/plantas`, file);
    return { key: result.key, url: result.url };
  }

  async delete(key: string): Promise<void> {
    await this.storage.delete(key);
  }

  private assertFile(
    file: Express.Multer.File,
    allowed: Set<string>,
    maxSize: number,
  ): void {
    if (!file) {
      throw new BadRequestException('Arquivo obrigatório');
    }
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException(
        `Tipo não permitido (${file.mimetype}). Aceitos: ${[...allowed].join(', ')}`,
      );
    }
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Arquivo muito grande (max ${Math.round(maxSize / 1024 / 1024)}MB)`,
      );
    }
  }
}
