-- CreateEnum
CREATE TYPE "TipoContatoClique" AS ENUM ('AGENDAR_VISITA', 'TIRAR_DUVIDA', 'LIGAR', 'WHATSAPP');

-- CreateTable
CREATE TABLE "contato_cliques" (
    "id" UUID NOT NULL,
    "tipo" "TipoContatoClique" NOT NULL,
    "origem" VARCHAR(40) NOT NULL,
    "imovel_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contato_cliques_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contato_cliques_created_at_idx" ON "contato_cliques"("created_at");

-- CreateIndex
CREATE INDEX "contato_cliques_imovel_id_created_at_idx" ON "contato_cliques"("imovel_id", "created_at");

-- AddForeignKey
ALTER TABLE "contato_cliques" ADD CONSTRAINT "contato_cliques_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

