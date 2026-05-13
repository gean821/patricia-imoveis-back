import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { TipoInteracao } from '@prisma/client';

export class CreateInteracaoDto {
  @IsUUID() clienteId: string;
  @IsOptional() @IsUUID() imovelId?: string;
  @IsEnum(TipoInteracao) tipo: TipoInteracao;
  @IsOptional() @IsString() titulo?: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @Type(() => Date) @IsDate() data?: Date;
}

export class UpdateInteracaoDto {
  @IsOptional() @IsEnum(TipoInteracao) tipo?: TipoInteracao;
  @IsOptional() @IsString() titulo?: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @Type(() => Date) @IsDate() data?: Date;
  @IsOptional() @IsUUID() imovelId?: string | null;
}

export class ListInteracoesQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) limit?: number = 50;
  @IsOptional() @IsUUID() clienteId?: string;
  @IsOptional() @IsUUID() imovelId?: string;
  @IsOptional() @IsEnum(TipoInteracao) tipo?: TipoInteracao;
}