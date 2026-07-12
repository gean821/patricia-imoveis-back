-- CreateTable
CREATE TABLE "hero_imagens" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hero_imagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos_destaque" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_destaque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_imagens_ativo_idx" ON "hero_imagens"("ativo");

-- CreateIndex
CREATE INDEX "videos_destaque_ativo_idx" ON "videos_destaque"("ativo");
