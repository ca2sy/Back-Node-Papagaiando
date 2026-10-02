import { prisma } from "../config/prisma.js";
import { AccessDeniedError, ResourceNotFoundError } from "../errors";

export async function validarPropriedadePerfil(
  perfilId: string,
  usuarioId: string,
): Promise<void> {
  const existe = await prisma.perfil.count({
    where: { id: perfilId, usuarioId },
  });
  if (existe === 0) {
    throw AccessDeniedError.resource("Perfil", perfilId);
  }
}

export async function validarPropriedadeCategoria(
  categoriaId: string,
  usuarioId: string,
): Promise<void> {
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
    include: { perfil: true },
  });

  if (!categoria) {
    throw ResourceNotFoundError.byId("Categoria", categoriaId);
  }

  if (categoria.padrao) return;

  if (!categoria.perfil || categoria.perfil.usuarioId !== usuarioId) {
    throw AccessDeniedError.resource("Categoria", categoriaId);
  }
}

export const validarCriacaoCategoria = validarPropriedadePerfil;

export const validarCriacaoBotaoPersonalizado = validarPropriedadeCategoria;

export async function validarPropriedadeBotao(
  botaoId: string,
  usuarioId: string,
): Promise<void> {
  const botao = await prisma.botao.findUnique({
    where: { id: botaoId },
    include: { categoria: true },
  });

  if (!botao) {
    throw ResourceNotFoundError.byId("Botao", botaoId);
  }

  if (botao.padrao) return;

  if (!botao.categoria?.perfilId) {
    throw AccessDeniedError.resource("Botao", botaoId);
  }

  await validarPropriedadePerfil(botao.categoria.perfilId, usuarioId);
}

export async function buscarPerfilComAutorizacao(
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const perfil = await prisma.perfil.findUnique({ where: { id: perfilId } });
  if (!perfil) throw ResourceNotFoundError.byId("Perfil", perfilId);
  return perfil;
}

export async function buscarCategoriaComAutorizacao(
  categoriaId: string,
  usuarioId: string,
) {
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
  });
  if (!categoria) throw ResourceNotFoundError.byId("Categoria", categoriaId);

  if (!categoria.padrao) {
    await validarPropriedadeCategoria(categoriaId, usuarioId);
  }

  return categoria;
}