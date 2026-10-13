import { prisma } from "../config/prisma";
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

export async function buscarPerfilComAutorizacao(
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const perfil = await prisma.perfil.findUnique({ where: { id: perfilId } });
  if (!perfil) throw ResourceNotFoundError.byId("Perfil", perfilId);
  return perfil;
}

interface ItemComDono {
  id: string;
  padrao: boolean;
  perfilId: string | null;
}

export function validarAcessoCategoria(
  categoria: ItemComDono,
  perfilId: string,
): void {
  if (!categoria.padrao && categoria.perfilId !== perfilId) {
    throw AccessDeniedError.resource("Categoria", categoria.id);
  }
}

export function validarAcessoBotao(botao: ItemComDono, perfilId: string): void {
  if (!botao.padrao && botao.perfilId !== perfilId) {
    throw AccessDeniedError.resource("Botao", botao.id);
  }
}

export async function validarRemocaoCategoria(
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

  if (categoria.padrao) {
    throw new AccessDeniedError("Categorias padrão não podem ser removidas");
  }

  if (!categoria.perfil || categoria.perfil.usuarioId !== usuarioId) {
    throw AccessDeniedError.resource("Categoria", categoriaId);
  }
}

export async function validarRemocaoBotao(
  botaoId: string,
  usuarioId: string,
): Promise<void> {
  const botao = await prisma.botao.findUnique({
    where: { id: botaoId },
    include: { perfil: true },
  });

  if (!botao) {
    throw ResourceNotFoundError.byId("Botao", botaoId);
  }

  if (botao.padrao) {
    throw new AccessDeniedError("Botões padrão não podem ser removidos");
  }

  if (!botao.perfil || botao.perfil.usuarioId !== usuarioId) {
    throw AccessDeniedError.resource("Botao", botaoId);
  }
}