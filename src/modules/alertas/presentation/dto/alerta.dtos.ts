import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Finalidade, TipoImovel } from '@prisma/client';

export class CreateAlertaImovelDto {
  @IsString() @MinLength(2) @MaxLength(255) nome: string;

  @IsString()
  @Matches(/^\D*(\d\D*){10,11}$/, { message: 'Informe um WhatsApp com DDD' })
  telefone: string;

  @IsOptional() @IsEmail() @MaxLength(255) email?: string;

  @IsOptional() @IsArray() @IsEnum(TipoImovel, { each: true }) tipoDesejado?: TipoImovel[];
  @IsOptional() @IsEnum(Finalidade) finalidadeDesejada?: Finalidade;
  @IsOptional() @IsString() @MaxLength(100) bairroDesejado?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) valorMax?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) quartosMin?: number;

  @IsOptional() @IsString() @MaxLength(20) imovelCodigo?: string;
  @IsOptional() @IsString() @MaxLength(1000) mensagem?: string;

  @IsOptional() @IsString() website?: string;
}
