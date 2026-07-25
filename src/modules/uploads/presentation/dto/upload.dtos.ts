import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum UploadTipo {
  FOTO_IMOVEL = 'FOTO_IMOVEL',
  VIDEO_IMOVEL = 'VIDEO_IMOVEL',
  PLANTA_IMOVEL = 'PLANTA_IMOVEL',
  HERO_IMAGEM = 'HERO_IMAGEM',
  VIDEO_DESTAQUE = 'VIDEO_DESTAQUE',
  VIDEO_DESTAQUE_CAPA = 'VIDEO_DESTAQUE_CAPA',
}

export class PresignUploadDto {
  @IsEnum(UploadTipo)
  tipo: UploadTipo;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsInt()
  @Min(1)
  sizeBytes: number;

  @IsOptional()
  @IsUUID()
  imovelId?: string;
}

export class PresignUploadResponseDto {
  uploadUrl: string;
  key: string;
  url: string;
}

export class DeleteFileDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}