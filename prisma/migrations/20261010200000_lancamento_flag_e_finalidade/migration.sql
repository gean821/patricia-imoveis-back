-- Lançamento volta a ser flag independente da finalidade: um imóvel pode ser
-- "Venda e Locação" (AMBOS) e lançamento ao mesmo tempo.
ALTER TABLE "imoveis" ADD COLUMN "is_lancamento" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "imoveis_is_lancamento_idx" ON "imoveis"("is_lancamento");

-- Dados: LANCAMENTO vira VENDA + flag. Comparação via ::text porque
-- VENDA_E_LOCACAO só existiu em banco local (em prod o valor não existe).
UPDATE "imoveis" SET "is_lancamento" = true, "finalidade" = 'VENDA' WHERE "finalidade"::text = 'LANCAMENTO';
UPDATE "imoveis" SET "finalidade" = 'AMBOS' WHERE "finalidade"::text = 'VENDA_E_LOCACAO';
UPDATE "clientes" SET "finalidade_desejada" = 'VENDA' WHERE "finalidade_desejada"::text = 'LANCAMENTO';
UPDATE "clientes" SET "finalidade_desejada" = 'AMBOS' WHERE "finalidade_desejada"::text = 'VENDA_E_LOCACAO';

-- Finalidade fica só VENDA / ALUGUEL / AMBOS
CREATE TYPE "Finalidade_new" AS ENUM ('VENDA', 'ALUGUEL', 'AMBOS');
ALTER TABLE "imoveis" ALTER COLUMN "finalidade" DROP DEFAULT;
ALTER TABLE "imoveis" ALTER COLUMN "finalidade" TYPE "Finalidade_new" USING ("finalidade"::text::"Finalidade_new");
ALTER TABLE "clientes" ALTER COLUMN "finalidade_desejada" TYPE "Finalidade_new" USING ("finalidade_desejada"::text::"Finalidade_new");
ALTER TYPE "Finalidade" RENAME TO "Finalidade_old";
ALTER TYPE "Finalidade_new" RENAME TO "Finalidade";
DROP TYPE "Finalidade_old";
ALTER TABLE "imoveis" ALTER COLUMN "finalidade" SET DEFAULT 'VENDA';
