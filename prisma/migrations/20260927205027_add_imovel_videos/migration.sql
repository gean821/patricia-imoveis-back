CREATE TABLE "imovel_videos" (
    "id" UUID NOT NULL,
    "imovel_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "capa_url" TEXT,
    "capa_storage_key" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imovel_videos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "imovel_videos_imovel_id_idx" ON "imovel_videos"("imovel_id");

ALTER TABLE "imovel_videos" ADD CONSTRAINT "imovel_videos_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
