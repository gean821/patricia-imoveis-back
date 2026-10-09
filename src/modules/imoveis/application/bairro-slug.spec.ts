import { agruparBairros, slugBairro } from './bairro-slug';

describe('bairro-slug', () => {
  it('gera slug sem acento, minúsculo e com hífen', () => {
    expect(slugBairro('Zona 03')).toBe('zona-3');
    expect(slugBairro('Zona 3')).toBe('zona-3');
    expect(slugBairro('Zona 10')).toBe('zona-10');
    expect(slugBairro('Parque 2000')).toBe('parque-2000');
    expect(slugBairro(' Vila Operária ')).toBe('vila-operaria');
    expect(slugBairro('Jd. Alvorada III')).toBe('jd-alvorada-iii');
    expect(slugBairro('***')).toBe('');
  });

  it('junta grafias diferentes no mesmo slug e usa a mais cadastrada como nome', () => {
    const resultado = agruparBairros([
      { bairro: 'zona 03', total: 1 },
      { bairro: 'Zona 03', total: 4 },
      { bairro: 'Jardim Alvorada', total: 2 },
      { bairro: 'Jardim Alvorada III', total: 1 },
    ]);

    expect(resultado).toEqual([
      { slug: 'jardim-alvorada', nome: 'Jardim Alvorada', variantes: ['Jardim Alvorada'] },
      { slug: 'jardim-alvorada-iii', nome: 'Jardim Alvorada III', variantes: ['Jardim Alvorada III'] },
      { slug: 'zona-3', nome: 'Zona 03', variantes: ['zona 03', 'Zona 03'] },
    ]);
  });

  it('ordena números de forma natural (Zona 2 antes de Zona 10)', () => {
    const nomes = agruparBairros([
      { bairro: 'Zona 10', total: 1 },
      { bairro: 'Zona 2', total: 1 },
    ]).map((b) => b.nome);
    expect(nomes).toEqual(['Zona 2', 'Zona 10']);
  });
});
