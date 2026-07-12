import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BasePaginationQueryDto } from '../../../../shared/dto/base-pagination-query.dto';

export class CreateHeroImagemDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordem?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateHeroImagemDto extends PartialType(CreateHeroImagemDto) {}

export class ListHeroImagensQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  ativo?: boolean;
}

export class ReordenarHeroImagensDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
