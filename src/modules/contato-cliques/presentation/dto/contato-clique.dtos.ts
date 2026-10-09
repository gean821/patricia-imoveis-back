import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { TipoContatoClique } from '@prisma/client';

export class CreateContatoCliqueDto {
  @IsEnum(TipoContatoClique) tipo: TipoContatoClique;

  @IsString()
  @MaxLength(40)
  @Matches(/^[a-z0-9-]+$/, { message: 'origem inválida' })
  origem: string;

  @IsOptional() @IsString() @MaxLength(20) imovelCodigo?: string;
}
