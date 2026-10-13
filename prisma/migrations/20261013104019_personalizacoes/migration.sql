-- AlterTable
ALTER TABLE "tb_botoes" ADD COLUMN     "perfil_id" UUID;

-- CreateTable
CREATE TABLE "tb_personalizacoes_categoria" (
    "id" UUID NOT NULL,
    "nome" TEXT,
    "url_imagem" TEXT,
    "categoria_id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,

    CONSTRAINT "tb_personalizacoes_categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_personalizacoes_botao" (
    "id" UUID NOT NULL,
    "nome" TEXT,
    "url_imagem" TEXT,
    "url_audio" TEXT,
    "botao_id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,

    CONSTRAINT "tb_personalizacoes_botao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_personalizacoes_categoria_categoria_id_perfil_id_key" ON "tb_personalizacoes_categoria"("categoria_id", "perfil_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_personalizacoes_botao_botao_id_perfil_id_key" ON "tb_personalizacoes_botao"("botao_id", "perfil_id");

-- AddForeignKey
ALTER TABLE "tb_botoes" ADD CONSTRAINT "tb_botoes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "tb_perfis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_personalizacoes_categoria" ADD CONSTRAINT "tb_personalizacoes_categoria_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "tb_categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_personalizacoes_categoria" ADD CONSTRAINT "tb_personalizacoes_categoria_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "tb_perfis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_personalizacoes_botao" ADD CONSTRAINT "tb_personalizacoes_botao_botao_id_fkey" FOREIGN KEY ("botao_id") REFERENCES "tb_botoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_personalizacoes_botao" ADD CONSTRAINT "tb_personalizacoes_botao_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "tb_perfis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
