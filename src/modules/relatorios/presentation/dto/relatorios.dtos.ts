import { IsDateString, IsEnum, ValidateIf } from 'class-validator';

export enum PeriodoRelatorio {
  SETE_DIAS = 'SETE_DIAS',
  TRINTA_DIAS = 'TRINTA_DIAS',
  MES_ATUAL = 'MES_ATUAL',
  DOZE_MESES = 'DOZE_MESES',
  PERSONALIZADO = 'PERSONALIZADO',
}

export class DashboardQueryDto {
  @IsEnum(PeriodoRelatorio)
  periodo: PeriodoRelatorio;

  @ValidateIf((o: DashboardQueryDto) => o.periodo === PeriodoRelatorio.PERSONALIZADO)
  @IsDateString()
  dataInicio?: string;

  @ValidateIf((o: DashboardQueryDto) => o.periodo === PeriodoRelatorio.PERSONALIZADO)
  @IsDateString()
  dataFim?: string;
}
