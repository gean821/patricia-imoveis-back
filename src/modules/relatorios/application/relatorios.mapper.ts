import { StatusImovel, TipoContatoClique, TipoInteracao } from '@prisma/client';
import {
  ClienteNoPeriodo,
  CliqueNoPeriodo,
  InteracaoNoPeriodo,
  PeriodoRange,
} from '../repository/relatorios.repository';
import {
  ContatosSiteDto,
  DashboardResponseDto,
  ImovelMaisProcuradoItemDto,
  FunilInteracaoItemDto,
  ImoveisPorStatusItemDto,
  LeadsPorOrigemItemDto,
  SerieTemporalItemDto,
} from '../presentation/dto/relatorios-response.dtos';

const ORDEM_FUNIL: TipoInteracao[] = [
  'CONTATO',
  'VISITA_AGENDADA',
  'VISITA_REALIZADA',
  'PROPOSTA',
  'CONTRAPROPOSTA',
  'NEGOCIO_FECHADO',
  'PERDIDO',
  'DESISTENCIA',
  'NOTA',
];

const ORDEM_STATUS: StatusImovel[] = [
  'DISPONIVEL',
  'RESERVADO',
  'NEGOCIACAO',
  'VENDIDO',
  'ALUGADO',
  'INATIVO',
];

const STATUS_ATIVOS: StatusImovel[] = ['DISPONIVEL', 'RESERVADO', 'NEGOCIACAO'];

function chaveDia(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function chaveMes(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function mapLeadsPorOrigem(clientes: ClienteNoPeriodo[]): LeadsPorOrigemItemDto[] {
  const contagem = new Map<string, number>();

  for (const cliente of clientes) {
    const origem = cliente.origem?.trim() || 'Não informado';
    contagem.set(origem, (contagem.get(origem) ?? 0) + 1);
  }

  return Array.from(contagem.entries())
    .map(([origem, total]) => ({ origem, total }))
    .sort((a, b) => b.total - a.total);
}

export function mapFunilInteracoes(interacoes: InteracaoNoPeriodo[]): FunilInteracaoItemDto[] {
  const contagem = new Map<TipoInteracao, number>();

  for (const interacao of interacoes) {
    contagem.set(interacao.tipo, (contagem.get(interacao.tipo) ?? 0) + 1);
  }

  return ORDEM_FUNIL.map((tipo) => ({ tipo, total: contagem.get(tipo) ?? 0 }));
}

export function mapImoveisPorStatus(statusList: StatusImovel[]): ImoveisPorStatusItemDto[] {
  const contagem = new Map<StatusImovel, number>();

  for (const status of statusList) {
    contagem.set(status, (contagem.get(status) ?? 0) + 1);
  }

  return ORDEM_STATUS.map((status) => ({ status, total: contagem.get(status) ?? 0 }));
}

export function mapSerieTemporal(
  range: PeriodoRange,
  clientes: ClienteNoPeriodo[],
  interacoes: InteracaoNoPeriodo[],
): SerieTemporalItemDto[] {
  const diasNoPeriodo = Math.ceil((range.fim.getTime() - range.inicio.getTime()) / 86_400_000);
  const porMes = diasNoPeriodo > 31;
  const chaveDe = porMes ? chaveMes : chaveDia;

  const buckets = new Map<string, SerieTemporalItemDto>();
  const cursor = new Date(range.inicio);

  while (cursor <= range.fim) {
    const chave = chaveDe(cursor);
    if (!buckets.has(chave)) {
      buckets.set(chave, { data: chave, leads: 0, visitasRealizadas: 0, negociosFechados: 0 });
    }
    if (porMes) {
      cursor.setMonth(cursor.getMonth() + 1);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  for (const cliente of clientes) {
    const bucket = buckets.get(chaveDe(cliente.createdAt));
    if (bucket) {
      bucket.leads += 1;
    }
  }

  for (const interacao of interacoes) {
    const bucket = buckets.get(chaveDe(interacao.data));
    if (!bucket) {
      continue;
    }
    if (interacao.tipo === 'VISITA_REALIZADA') {
      bucket.visitasRealizadas += 1;
    }
    if (interacao.tipo === 'NEGOCIO_FECHADO') {
      bucket.negociosFechados += 1;
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.data.localeCompare(b.data));
}

const ORDEM_CONTATO: TipoContatoClique[] = ['AGENDAR_VISITA', 'TIRAR_DUVIDA', 'LIGAR', 'WHATSAPP'];
const LIMITE_IMOVEIS_MAIS_PROCURADOS = 5;

export function mapContatosSite(cliques: CliqueNoPeriodo[]): ContatosSiteDto {
  const porTipo = new Map<TipoContatoClique, number>();
  const porImovel = new Map<string, ImovelMaisProcuradoItemDto>();

  for (const clique of cliques) {
    porTipo.set(clique.tipo, (porTipo.get(clique.tipo) ?? 0) + 1);

    if (!clique.imovel) {
      continue;
    }
    const item = porImovel.get(clique.imovel.codigo) ?? {
      codigo: clique.imovel.codigo,
      titulo: clique.imovel.titulo,
      contatos: 0,
      pedidosVisita: 0,
    };
    item.contatos += 1;
    if (clique.tipo === 'AGENDAR_VISITA') {
      item.pedidosVisita += 1;
    }
    porImovel.set(item.codigo, item);
  }

  return {
    total: cliques.length,
    pedidosVisita: porTipo.get('AGENDAR_VISITA') ?? 0,
    porTipo: ORDEM_CONTATO.map((tipo) => ({ tipo, total: porTipo.get(tipo) ?? 0 })),
    imoveisMaisProcurados: Array.from(porImovel.values())
      .sort((a, b) => b.contatos - a.contatos || b.pedidosVisita - a.pedidosVisita)
      .slice(0, LIMITE_IMOVEIS_MAIS_PROCURADOS),
  };
}

export function mapDashboard(
  range: PeriodoRange,
  clientes: ClienteNoPeriodo[],
  interacoes: InteracaoNoPeriodo[],
  statusImoveis: StatusImovel[],
  cliques: CliqueNoPeriodo[],
): DashboardResponseDto {
  const totalVisitasRealizadas = interacoes.filter((i) => i.tipo === 'VISITA_REALIZADA').length;
  const totalNegociosFechados = interacoes.filter((i) => i.tipo === 'NEGOCIO_FECHADO').length;
  const totalLeads = clientes.length;
  const totalImoveisAtivos = statusImoveis.filter((status) =>
    STATUS_ATIVOS.includes(status),
  ).length;

  return {
    periodo: { inicio: range.inicio.toISOString(), fim: range.fim.toISOString() },
    resumo: {
      totalLeads,
      totalNegociosFechados,
      totalVisitasRealizadas,
      totalImoveisAtivos,
      taxaConversao:
        totalLeads > 0 ? Number(((totalNegociosFechados / totalLeads) * 100).toFixed(1)) : 0,
    },
    leadsPorOrigem: mapLeadsPorOrigem(clientes),
    funilInteracoes: mapFunilInteracoes(interacoes),
    imoveisPorStatus: mapImoveisPorStatus(statusImoveis),
    serieTemporal: mapSerieTemporal(range, clientes, interacoes),
    contatosSite: mapContatosSite(cliques),
  };
}
