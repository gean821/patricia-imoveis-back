/**
 * "Zona 03" → "zona-3", "Jardim Alvorada" → "jardim-alvorada", "Vila Operária" → "vila-operaria".
 * Zero à esquerda sai: "Zona 3" e "Zona 03" são o mesmo bairro e a mesma página.
 */
export function slugBairro(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/(^|-)0+(?=\d)/g, '$1');
}

export interface BairroAgrupado {
  slug: string;
  /** Grafia mais usada no cadastro — é a que aparece no site. */
  nome: string;
  /** Todas as grafias cadastradas ("Zona 03", "zona 03 "), pra filtrar com igualdade exata. */
  variantes: string[];
}

/**
 * Agrupa os bairros cadastrados pelo slug: a Patricia digita o bairro à mão,
 * então "Zona 03" e "zona 03" viram a mesma página.
 */
export function agruparBairros(contagens: { bairro: string; total: number }[]): BairroAgrupado[] {
  const grupos = new Map<string, { variantes: { nome: string; total: number }[] }>();

  for (const { bairro, total } of contagens) {
    const slug = slugBairro(bairro);
    if (!slug) {
      continue;
    }
    const grupo = grupos.get(slug) ?? { variantes: [] };
    grupo.variantes.push({ nome: bairro, total });
    grupos.set(slug, grupo);
  }

  return Array.from(grupos.entries())
    .map(([slug, { variantes }]) => ({
      slug,
      nome: [...variantes].sort((a, b) => b.total - a.total)[0].nome.trim(),
      variantes: variantes.map((v) => v.nome),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
}
