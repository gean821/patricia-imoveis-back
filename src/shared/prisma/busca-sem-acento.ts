import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

export type ModoBuscaTexto = 'contem' | 'igual';

interface BuscaSemAcentoParams {
  tabela: string;
  colunas: readonly string[];
  termo: string;
  modo: ModoBuscaTexto;
}

export async function findIdsPorTextoSemAcento(
  prisma: PrismaService,
  { tabela, colunas, termo, modo }: BuscaSemAcentoParams,
): Promise<string[]> {
  const escapado = escaparLike(termo);
  const padrao = modo === 'contem' ? `%${escapado}%` : escapado;
  const condicoes = colunas.map(
    (coluna) => Prisma.sql`unaccent(${Prisma.raw(`"${coluna}"`)}) ILIKE unaccent(${padrao})`,
  );

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id::text AS id
    FROM ${Prisma.raw(`"${tabela}"`)}
    WHERE ${Prisma.join(condicoes, ' OR ')}
  `;

  return rows.map((r) => r.id);
}

function escaparLike(termo: string): string {
  return termo.replace(/[\\%_]/g, '\\$&');
}
