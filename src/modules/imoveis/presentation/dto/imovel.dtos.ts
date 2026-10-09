import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { Finalidade, StatusImovel, TipoImovel } from '@prisma/client';
import { BasePaginationQueryDto } from '../../../../shared/dto/base-pagination-query.dto';

export class FotoInputDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @IsOptional()
  @IsString()
  legenda?: string;

  @IsOptional()
  @IsInt()
  ordem?: number;

  @IsOptional()
  @IsBoolean()
  isCapa?: boolean;
}

export class VideoInputDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @IsOptional()
  @IsString()
  capaUrl?: string;

  @IsOptional()
  @IsString()
  capaStorageKey?: string;

  @IsOptional()
  @IsInt()
  ordem?: number;
}

export class CreateImovelDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  codigo: string;

  @IsString()
  @MinLength(3)
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsEnum(TipoImovel)
  tipo: TipoImovel;

  @IsOptional()
  @IsEnum(Finalidade)
  finalidade?: Finalidade;

  @IsOptional()
  @IsEnum(StatusImovel)
  status?: StatusImovel;

  @IsOptional()
  @IsBoolean()
  destaque?: boolean;

  @IsString() @IsNotEmpty() endereco: string;
  @IsOptional() @IsString() numero?: string;
  @IsOptional() @IsString() complemento?: string;
  @IsString() @IsNotEmpty() bairro: string;
  @IsString() @IsNotEmpty() cidade: string;
  @IsString() @Length(2, 2) estado: string;
  @IsOptional() @IsString() cep?: string;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;

  @Type(() => Number) @IsNumber() @Min(0) valor: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) valorCondominio?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) valorIptu?: number;

  @Type(() => Number) @IsNumber() @Min(0) area: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) areaTotal?: number;
  @IsOptional() @IsInt() @Min(0) quartos?: number;
  @IsOptional() @IsInt() @Min(0) suites?: number;
  @IsOptional() @IsInt() @Min(0) banheiros?: number;
  @IsOptional() @IsInt() @Min(0) vagas?: number;
  @IsOptional() @IsInt() @Min(1800) anoConstrucao?: number;
  @IsOptional() @IsBoolean() mobiliado?: boolean;

  @IsOptional() @IsArray() @IsString({ each: true }) caracteristicas?: string[];

  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsString() plantaUrl?: string;
  @IsOptional() @IsString() tourVirtualUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FotoInputDto)
  fotos?: FotoInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoInputDto)
  videos?: VideoInputDto[];

  @IsOptional() @IsBoolean() publicadoFeed?: boolean;
  @IsOptional() @IsBoolean() publicadoOlx?: boolean;
  @IsOptional() @IsBoolean() publicadoChavesNaMao?: boolean;
  @IsOptional() @IsBoolean() publicadoSub100?: boolean;
  @IsOptional() @IsBoolean() publicadoZap?: boolean;
  @IsOptional() @IsBoolean() publicadoVivaReal?: boolean;
}

export class UpdateImovelDto extends PartialType(CreateImovelDto) {}

export class ListImoveisQueryDto extends BasePaginationQueryDto {
  @IsOptional() @IsEnum(TipoImovel) tipo?: TipoImovel;
  @IsOptional() @IsEnum(Finalidade) finalidade?: Finalidade;
  @IsOptional() @IsEnum(StatusImovel) status?: StatusImovel;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() bairro?: string;
  @IsOptional() @Type(() => Number) @IsNumber() valorMin?: number;
  @IsOptional() @Type(() => Number) @IsNumber() valorMax?: number;
  @IsOptional() @Type(() => Number) @IsInt() quartosMin?: number;
  @IsOptional() @Type(() => Number) @IsInt() vagasMin?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() destaque?: boolean;
}

export class ListImoveisSimilaresQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  limit?: number = 6;
}
