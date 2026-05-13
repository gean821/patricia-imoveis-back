import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService, UploadResult } from '../../../shared/storage/storage.service';

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const ALLOWED_DOC_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO = 200 * 1024 * 1024; // 200MB
const MAX_DOC = 25 * 1024 * 1024; // 25MB

@Injectable()
export class UploadsService {
  constructor(private readonly storage: StorageService) {}

  async uploadFotoImovel(imovelId: string, file: Express.Multer.File): Promise<UploadResult> {
    this.assertFile(file, ALLOWED_IMAGE_MIME, MAX_IMAGE);
    return this.storage.upload(`imoveis/${imovelId}/fotos`, file);
  }

  async uploadVideoImovel(imovelId: string, file: Express.Multer.File): Promise<UploadResult> {
    this.assertFile(file, ALLOWED_VIDEO_MIME, MAX_VIDEO);
    return this.storage.upload(`imoveis/${imovelId}/videos`, file);
  }

  async uploadPlantaImovel(imovelId: string, file: Express.Multer.File): Promise<UploadResult> {
    this.assertFile(file, ALLOWED_DOC_MIME, MAX_DOC);
    return this.storage.upload(`imoveis/${imovelId}/plantas`, file);
  }

  delete(key: string): Promise<void> {
    return this.storage.delete(key);
  }

  private assertFile(file: Express.Multer.File, allowed: Set<string>, maxSize: number) {
    if (!file) throw new BadRequestException('Arquivo obrigatório');
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException(
        `Tipo não permitido (${file.mimetype}). Aceitos: ${[...allowed].join(', ')}`,
      );
    }
    if (file.size > maxSize) {
      throw new BadRequestException(`Arquivo muito grande (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }
  }
}