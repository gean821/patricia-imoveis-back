-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CORRETOR');

-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('APARTAMENTO', 'CASA', 'SOBRADO', 'COBERTURA', 'KITNET', 'STUDIO', 'TERRENO', 'CHACARA', 'SITIO', 'FAZENDA', 'COMERCIAL', 'GALPAO', 'SALA');

-- CreateEnum
CREATE TYPE "Finalidade" AS ENUM ('VENDA', 'ALUGUEL', 'AMBOS');

-- CreateEnum
CREATE TYPE "StatusImovel" AS ENUM ('DISPONIVEL', 'RESERVADO', 'NEGOCIACAO', 'VENDIDO', 'ALUGADO', 'INATIVO');

-- CreateEnum
CREATE TYPE "TipoInteracao" AS ENUM ('CONTATO', 'VISITA_AGENDADA', 'VISITA_REALIZADA', 'PROPOSTA', 'CONTRAPROPOSTA', 'NEGOCIO_FECHADO', 'PERDIDO', 'DESISTENCIA', 'NOTA');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imoveis" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoImovel" NOT NULL,
    "finalidade" "Finalidade" NOT NULL DEFAULT 'VENDA',
    "status" "StatusImovel" NOT NULL DEFAULT 'DISPONIVEL',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "endereco" VARCHAR(255) NOT NULL,
    "numero" VARCHAR(20),
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100) NOT NULL,
    "cidade" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "cep" VARCHAR(10),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "valor" DECIMAL(12,2) NOT NULL,
    "valor_condominio" DECIMAL(10,2),
    "valor_iptu" DECIMAL(10,2),
    "area" DOUBLE PRECISION NOT NULL,
    "area_total" DOUBLE PRECISION,
    "quartos" INTEGER,
    "suites" INTEGER,
    "banheiros" INTEGER,
    "vagas" INTEGER,
    "ano_construcao" INTEGER,
    "mobiliado" BOOLEAN NOT NULL DEFAULT false,
    "caracteristicas" TEXT[],
    "video_url" TEXT,
    "planta_url" TEXT,
    "tour_virtual_url" TEXT,
    "publicado_feed" BOOLEAN NOT NULL DEFAULT true,
    "publicado_olx" BOOLEAN NOT NULL DEFAULT false,
    "publicado_chaves_na_mao" BOOLEAN NOT NULL DEFAULT false,
    "publicado_sub100" BOOLEAN NOT NULL DEFAULT false,
    "publicado_zap" BOOLEAN NOT NULL DEFAULT false,
    "publicado_viva_real" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imoveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imovel_fotos" (
    "id" UUID NOT NULL,
    "imovel_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "legenda" VARCHAR(255),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "is_capa" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imovel_fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "cpf" VARCHAR(14),
    "origem" VARCHAR(100),
    "observacoes" TEXT,
    "tipoDesejado" "TipoImovel"[],
    "finalidade_desejada" "Finalidade",
    "bairro_desejado" VARCHAR(100),
    "cidade_desejada" VARCHAR(100),
    "valor_min" DECIMAL(12,2),
    "valor_max" DECIMAL(12,2),
    "quartos_min" INTEGER,
    "vagas_min" INTEGER,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_imovel" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "imovel_id" UUID NOT NULL,
    "interesse" INTEGER NOT NULL DEFAULT 3,
    "nota" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacoes" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "imovel_id" UUID,
    "tipo" "TipoInteracao" NOT NULL,
    "titulo" VARCHAR(255),
    "descricao" TEXT,
    "data" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "imoveis_codigo_key" ON "imoveis"("codigo");

-- CreateIndex
CREATE INDEX "imoveis_status_idx" ON "imoveis"("status");

-- CreateIndex
CREATE INDEX "imoveis_tipo_idx" ON "imoveis"("tipo");

-- CreateIndex
CREATE INDEX "imoveis_cidade_bairro_idx" ON "imoveis"("cidade", "bairro");

-- CreateIndex
CREATE INDEX "imoveis_finalidade_idx" ON "imoveis"("finalidade");

-- CreateIndex
CREATE INDEX "imoveis_destaque_idx" ON "imoveis"("destaque");

-- CreateIndex
CREATE INDEX "imoveis_deleted_at_idx" ON "imoveis"("deleted_at");

-- CreateIndex
CREATE INDEX "imovel_fotos_imovel_id_idx" ON "imovel_fotos"("imovel_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");

-- CreateIndex
CREATE INDEX "clientes_nome_idx" ON "clientes"("nome");

-- CreateIndex
CREATE INDEX "clientes_telefone_idx" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "clientes_email_idx" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "clientes_deleted_at_idx" ON "clientes"("deleted_at");

-- CreateIndex
CREATE INDEX "cliente_imovel_cliente_id_idx" ON "cliente_imovel"("cliente_id");

-- CreateIndex
CREATE INDEX "cliente_imovel_imovel_id_idx" ON "cliente_imovel"("imovel_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_imovel_cliente_id_imovel_id_key" ON "cliente_imovel"("cliente_id", "imovel_id");

-- CreateIndex
CREATE INDEX "interacoes_cliente_id_idx" ON "interacoes"("cliente_id");

-- CreateIndex
CREATE INDEX "interacoes_imovel_id_idx" ON "interacoes"("imovel_id");

-- CreateIndex
CREATE INDEX "interacoes_data_idx" ON "interacoes"("data");

-- AddForeignKey
ALTER TABLE "imovel_fotos" ADD CONSTRAINT "imovel_fotos_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_imovel" ADD CONSTRAINT "cliente_imovel_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_imovel" ADD CONSTRAINT "cliente_imovel_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
