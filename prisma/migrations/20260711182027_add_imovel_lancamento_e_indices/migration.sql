-- AlterTable
ALTER TABLE "imoveis" ADD COLUMN     "is_lancamento" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "clientes_origem_idx" ON "clientes"("origem");

-- CreateIndex
CREATE INDEX "imoveis_is_lancamento_idx" ON "imoveis"("is_lancamento");
