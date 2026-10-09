import { Finalidade, Prisma, TipoImovel } from '@prisma/client';

export interface ImovelComparavel {
  tipo: TipoImovel;
  bairro: string;
  valor: Prisma.Decimal;
  area: number;
  quartos: number | null;
  vagas: number | null;
  caracteristicas: string[];
}

const PESO_TIPO = 3;
const PESO_BAIRRO = 3;
const PESO_VALOR = 3;
const PESO_QUARTOS = 2;
const PESO_VAGAS = 1;
const PESO_AREA = 1;
const PESO_POR_CARACTERISTICA = 0.5;
const MAX_CARACTERISTICAS_PONTUADAS = 3;

const TOLERANCIA_VALOR = 0.4;
const TOLERANCIA_AREA = 0.2;

export const FAIXA_VALOR_CANDIDATOS = { min: 0.6, max: 1.6 };

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

function diferencaRelativa(referencia: number, outro: number): number {
  if (referencia <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.abs(outro - referencia) / referencia;
}

export function finalidadesCompativeis(finalidade: Finalidade): Finalidade[] {
  switch (finalidade) {
    case 'ALUGUEL':
      return ['ALUGUEL', 'AMBOS'];
    case 'AMBOS':
      return ['VENDA', 'ALUGUEL', 'AMBOS', 'LANCAMENTO'];
    case 'VENDA':
    case 'LANCAMENTO':
      return ['VENDA', 'AMBOS', 'LANCAMENTO'];
  }
}

export function pontuarSimilaridade(
  referencia: ImovelComparavel,
  candidato: ImovelComparavel,
): number {
  let pontos = 0;

  if (candidato.tipo === referencia.tipo) {
    pontos += PESO_TIPO;
  }

  if (normalizar(candidato.bairro) === normalizar(referencia.bairro)) {
    pontos += PESO_BAIRRO;
  }

  const difValor = diferencaRelativa(
    referencia.valor.toNumber(),
    candidato.valor.toNumber(),
  );

  if (difValor < TOLERANCIA_VALOR) {
    pontos += PESO_VALOR * (1 - difValor / TOLERANCIA_VALOR);
  }

  if (referencia.quartos !== null && candidato.quartos !== null) {
    const difQuartos = Math.abs(referencia.quartos - candidato.quartos);

    if (difQuartos === 0) {
      pontos += PESO_QUARTOS;
    } else if (difQuartos === 1) {
      pontos += PESO_QUARTOS / 2;
    }
  }

  if (referencia.vagas !== null && referencia.vagas === candidato.vagas) {
    pontos += PESO_VAGAS;
  }

  if (diferencaRelativa(referencia.area, candidato.area) <= TOLERANCIA_AREA) {
    pontos += PESO_AREA;
  }

  const caracteristicasReferencia = new Set(referencia.caracteristicas.map(normalizar));
  const emComum = candidato.caracteristicas.filter((c) =>
    caracteristicasReferencia.has(normalizar(c)),
  ).length;

  pontos += Math.min(emComum, MAX_CARACTERISTICAS_PONTUADAS) * PESO_POR_CARACTERISTICA;

  return pontos;
}

export function ranquearSimilares<T extends ImovelComparavel>(
  referencia: ImovelComparavel,
  candidatos: T[],
): T[] {
  return candidatos
    .map((candidato, ordem) => ({
      candidato,
      ordem,
      pontos: pontuarSimilaridade(referencia, candidato),
    }))
    .sort((a, b) => b.pontos - a.pontos || a.ordem - b.ordem)
    .map(({ candidato }) => candidato);
}
