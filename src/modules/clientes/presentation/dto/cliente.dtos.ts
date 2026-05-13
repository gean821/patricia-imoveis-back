import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { Finalidade, TipoImovel } from '@prisma/client';

export class CreateClienteDto {
  @IsString() @MinLength(2) nome: string;
  @IsString() @IsNotEmpty() @Length(8, 20) telefone: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() cpf?: string;
  @IsOptional() @IsString() origem?: string;
  @IsOptional() @IsString() observacoes?: string;

  @IsOptional() @IsArray() @IsEnum(TipoImovel, { each: true }) tipoDesejado?: TipoImovel[];
  @IsOptional() @IsEnum(Finalidade) finalidadeDesejada?: Finalidade;
  @IsOptional() @IsString() bairroDesejado?: string;
  @IsOptional() @IsString() cidadeDesejada?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) valorMin?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) valorMax?: number;
  @IsOptional() @IsInt() @Min(0) quartosMin?: number;
  @IsOptional() @IsInt() @Min(0) vagasMin?: number;
}

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}

export class ListClientesQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(TipoImovel) tipoDesejado?: TipoImovel;
  @IsOptional() @IsString() cidadeDesejada?: string;
}

export class LinkImovelDto {
  @IsString() @IsNotEmpty() imovelId: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) interesse?: number;
  @IsOptional() @IsString() nota?: string;
}