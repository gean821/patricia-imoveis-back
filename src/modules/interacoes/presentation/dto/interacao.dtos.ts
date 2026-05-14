import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { TipoInteracao } from '@prisma/client';
import { BasePaginationQueryDto } from '../../../../shared/dto/base-pagination-query.dto';

export class CreateInteracaoDto {
  @IsUUID() clienteId: string;
  @IsOptional() @IsUUID() imovelId?: string;
  @IsEnum(TipoInteracao) tipo: TipoInteracao;
  @IsOptional() @IsString() titulo?: string;
  @IsOptional() @IsString() descricao?: string;
  @IsOptional() @Type(() => Date) @IsDate() data?: Date;
}

export class UpdateInteracaoDto extends PartialType(CreateInteracaoDto) {
  @IsOptional() @IsUUID() override clienteId?: string;
}

export class ListInteracoesQueryDto extends BasePaginationQueryDto {
  @IsOptional() @IsUUID() clienteId?: string;
  @IsOptional() @IsUUID() imovelId?: string;
  @IsOptional() @IsEnum(TipoInteracao) tipo?: TipoInteracao;
}

export class TimelineQueryDto extends BasePaginationQueryDto {
  @IsOptional() @IsEnum(TipoInteracao) tipo?: TipoInteracao;
}
