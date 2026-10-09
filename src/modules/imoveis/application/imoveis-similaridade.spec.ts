import { Prisma } from '@prisma/client';
import {
  finalidadesCompativeis,
  ImovelComparavel,
  pontuarSimilaridade,
  ranquearSimilares,
} from './imoveis-similaridade';

function imovel(overrides: Partial<ImovelComparavel> & { codigo?: string } = {}) {
  return {
    codigo: 'X',
    tipo: 'APARTAMENTO' as const,
    bairro: 'Zona 03',
    valor: new Prisma.Decimal(800_000),
    area: 100,
    quartos: 3,
    vagas: 2,
    caracteristicas: ['Piscina', 'Churrasqueira'],
    ...overrides,
  };
}

describe('imoveis-similaridade', () => {
  const referencia = imovel();

  it('imóvel idêntico recebe a pontuação máxima', () => {
    // tipo 3 + bairro 3 + valor 3 + quartos 2 + vagas 1 + área 1 + 2 características × 0,5
    expect(pontuarSimilaridade(referencia, imovel())).toBe(14);
  });

  it('compara bairro e características sem acento e caixa', () => {
    const candidato = imovel({
      tipo: 'CASA',
      bairro: ' zona 03 ',
      valor: new Prisma.Decimal(5_000_000),
      area: 500,
      quartos: null,
      vagas: null,
      caracteristicas: ['PISCINA'],
    });
    expect(pontuarSimilaridade(referencia, candidato)).toBe(3 + 0.5);
  });

  it('preço fora de 40% não pontua e preço próximo pontua proporcional', () => {
    const base = { tipo: 'CASA' as const, bairro: 'Outro', area: 999, quartos: null, vagas: null, caracteristicas: [] };
    expect(pontuarSimilaridade(referencia, imovel({ ...base, valor: new Prisma.Decimal(1_200_000) }))).toBe(0);
    expect(pontuarSimilaridade(referencia, imovel({ ...base, valor: new Prisma.Decimal(880_000) }))).toBeCloseTo(2.25);
  });

  it('referência com valor zero não quebra', () => {
    const semValor = imovel({ valor: new Prisma.Decimal(0) });
    expect(Number.isFinite(pontuarSimilaridade(semValor, imovel()))).toBe(true);
  });

  it('ranqueia do mais parecido pro menos e mantém a ordem original no empate', () => {
    const longe = imovel({ codigo: 'LONGE', tipo: 'TERRENO', bairro: 'Centro', quartos: null, vagas: null, caracteristicas: [], area: 1000, valor: new Prisma.Decimal(100_000) });
    const empateA = imovel({ codigo: 'A', bairro: 'Centro' });
    const empateB = imovel({ codigo: 'B', bairro: 'Centro' });
    const perto = imovel({ codigo: 'PERTO' });

    const ordem = ranquearSimilares(referencia, [longe, empateA, empateB, perto]).map((i) => i.codigo);
    expect(ordem).toEqual(['PERTO', 'A', 'B', 'LONGE']);
  });

  it('venda não mistura com aluguel', () => {
    expect(finalidadesCompativeis('VENDA')).not.toContain('ALUGUEL');
    expect(finalidadesCompativeis('ALUGUEL')).toEqual(['ALUGUEL', 'AMBOS']);
  });
});
