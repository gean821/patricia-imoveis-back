import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BasePaginationQueryDto } from '../../../../shared/dto/base-pagination-query.dto';

export class CreateVideoDestaqueDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

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

export class UpdateVideoDestaqueDto extends PartialType(CreateVideoDestaqueDto) { }

export class ListVideosDestaqueQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  ativo?: boolean;
}

export class ReordenarVideosDestaqueDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
