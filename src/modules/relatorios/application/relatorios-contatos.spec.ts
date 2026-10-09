import { mapContatosSite } from './relatorios.mapper';

describe('mapContatosSite', () => {
  const ap3 = { codigo: 'AP3', titulo: 'Apartamento Zona 03' };
  const ca1 = { codigo: 'CA1', titulo: 'Casa Jardim Alvorada' };

  it('sem cliques devolve zeros em todos os tipos', () => {
    const resultado = mapContatosSite([]);
    expect(resultado.total).toBe(0);
    expect(resultado.pedidosVisita).toBe(0);
    expect(resultado.porTipo.map((t) => t.total)).toEqual([0, 0, 0, 0]);
    expect(resultado.imoveisMaisProcurados).toEqual([]);
  });

  it('conta por tipo e ranqueia imóveis por contatos, desempatando por pedidos de visita', () => {
    const resultado = mapContatosSite([
      { tipo: 'TIRAR_DUVIDA', imovel: ca1 },
      { tipo: 'TIRAR_DUVIDA', imovel: ca1 },
      { tipo: 'AGENDAR_VISITA', imovel: ap3 },
      { tipo: 'LIGAR', imovel: ap3 },
      { tipo: 'WHATSAPP', imovel: null },
    ]);

    expect(resultado.total).toBe(5);
    expect(resultado.pedidosVisita).toBe(1);
    expect(resultado.porTipo).toEqual([
      { tipo: 'AGENDAR_VISITA', total: 1 },
      { tipo: 'TIRAR_DUVIDA', total: 2 },
      { tipo: 'LIGAR', total: 1 },
      { tipo: 'WHATSAPP', total: 1 },
    ]);
    expect(resultado.imoveisMaisProcurados).toEqual([
      { codigo: 'AP3', titulo: 'Apartamento Zona 03', contatos: 2, pedidosVisita: 1 },
      { codigo: 'CA1', titulo: 'Casa Jardim Alvorada', contatos: 2, pedidosVisita: 0 },
    ]);
  });

  it('limita o ranking a 5 imóveis', () => {
    const cliques = Array.from({ length: 7 }, (_, i) => ({
      tipo: 'TIRAR_DUVIDA' as const,
      imovel: { codigo: `X${i}`, titulo: `Imóvel ${i}` },
    }));
    expect(mapContatosSite(cliques).imoveisMaisProcurados).toHaveLength(5);
  });
});
