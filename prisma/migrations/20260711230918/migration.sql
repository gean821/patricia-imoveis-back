/*
  Warnings:

  - The values [KITNET] on the enum `TipoImovel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "Finalidade" ADD VALUE 'LANCAMENTO';

-- AlterEnum
BEGIN;
CREATE TYPE "TipoImovel_new" AS ENUM ('APARTAMENTO', 'CASA', 'SOBRADO', 'COBERTURA', 'STUDIO', 'TERRENO', 'CHACARA', 'SITIO', 'FAZENDA', 'COMERCIAL', 'GALPAO', 'SALA');
ALTER TABLE "imoveis" ALTER COLUMN "tipo" TYPE "TipoImovel_new" USING ("tipo"::text::"TipoImovel_new");
ALTER TABLE "clientes" ALTER COLUMN "tipoDesejado" TYPE "TipoImovel_new"[] USING ("tipoDesejado"::text::"TipoImovel_new"[]);
ALTER TYPE "TipoImovel" RENAME TO "TipoImovel_old";
ALTER TYPE "TipoImovel_new" RENAME TO "TipoImovel";
DROP TYPE "public"."TipoImovel_old";
COMMIT;
