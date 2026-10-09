import { StatusImovel, TipoContatoClique, TipoInteracao } from '@prisma/client';

export class PeriodoResumoDto {
  inicio: string;
  fim: string;
}

export class ResumoDashboardDto {
  totalLeads: number;
  totalNegociosFechados: number;
  totalVisitasRealizadas: number;
  totalImoveisAtivos: number;
  taxaConversao: number;
}

export class LeadsPorOrigemItemDto {
  origem: string;
  total: number;
}

export class FunilInteracaoItemDto {
  tipo: TipoInteracao;
  total: number;
}

export class ImoveisPorStatusItemDto {
  status: StatusImovel;
  total: number;
}

export class SerieTemporalItemDto {
  data: string;
  leads: number;
  visitasRealizadas: number;
  negociosFechados: number;
}

export class ContatoPorTipoItemDto {
  tipo: TipoContatoClique;
  total: number;
}

export class ImovelMaisProcuradoItemDto {
  codigo: string;
  titulo: string;
  contatos: number;
  pedidosVisita: number;
}

export class ContatosSiteDto {
  total: number;
  pedidosVisita: number;
  porTipo: ContatoPorTipoItemDto[];
  imoveisMaisProcurados: ImovelMaisProcuradoItemDto[];
}

export class DashboardResponseDto {
  periodo: PeriodoResumoDto;
  resumo: ResumoDashboardDto;
  leadsPorOrigem: LeadsPorOrigemItemDto[];
  funilInteracoes: FunilInteracaoItemDto[];
  imoveisPorStatus: ImoveisPorStatusItemDto[];
  serieTemporal: SerieTemporalItemDto[];
  contatosSite: ContatosSiteDto;
}
