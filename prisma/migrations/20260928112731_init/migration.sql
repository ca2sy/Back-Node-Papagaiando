-- CreateTable
CREATE TABLE "tb_usuarios" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "token_recuperacao" TEXT,
    "expiracao_token" TIMESTAMP(3),

    CONSTRAINT "tb_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_perfis" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "url_foto" TEXT NOT NULL,
    "usuario_id" UUID NOT NULL,

    CONSTRAINT "tb_perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_categorias" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "url_imagem" TEXT NOT NULL,
    "padrao" BOOLEAN NOT NULL DEFAULT true,
    "perfil_id" UUID,

    CONSTRAINT "tb_categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_botoes" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "url_imagem" TEXT NOT NULL,
    "url_audio" TEXT NOT NULL,
    "padrao" BOOLEAN NOT NULL DEFAULT true,
    "categoria_id" UUID NOT NULL,

    CONSTRAINT "tb_botoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_usuarios_email_key" ON "tb_usuarios"("email");

-- AddForeignKey
ALTER TABLE "tb_perfis" ADD CONSTRAINT "tb_perfis_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "tb_usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_categorias" ADD CONSTRAINT "tb_categorias_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "tb_perfis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_botoes" ADD CONSTRAINT "tb_botoes_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "tb_categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
