import { prisma } from "../config/prisma";
import { BusinessError, ResourceNotFoundError } from "../errors";
import type { PerfilCreateInput, PerfilUpdateInput } from "../dtos/perfil.dto";
import {
  buscarPerfilComAutorizacao,
  validarPropriedadePerfil,
} from "./authorization.service";

function preenchido(valor: string | undefined): string | undefined {
  return valor !== undefined && valor.trim() !== "" ? valor : undefined;
}

export async function criarPerfil(
  { nome, urlFoto }: PerfilCreateInput,
  usuarioId: string,
) {
  const usuario = await prisma.usuario.count({ where: { id: usuarioId } });
  if (usuario === 0) throw ResourceNotFoundError.byId("Usuario", usuarioId);

  if (nome.trim() === "") throw BusinessError.invalidData("nome");
  if (urlFoto.trim() === "") throw BusinessError.invalidData("urlFoto");

  return prisma.perfil.create({ data: { nome, urlFoto, usuarioId } });
}

export async function atualizarPerfil(
  perfilId: string,
  dados: PerfilUpdateInput,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  return prisma.perfil.update({
    where: { id: perfilId },
    data: {
      nome: preenchido(dados.nome),
      urlFoto: preenchido(dados.urlFoto),
    },
  });
}

export async function buscarPorId(perfilId: string, usuarioId: string) {
  return buscarPerfilComAutorizacao(perfilId, usuarioId);
}

export async function listarPerfisPorUsuario(usuarioId: string) {
  return prisma.perfil.findMany({ where: { usuarioId } });
}

export async function deletarPerfil(
  perfilId: string,
  usuarioId: string,
): Promise<void> {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const [totalCategorias, totalBotoes] = await Promise.all([
    prisma.categoria.count({ where: { perfilId } }),
    prisma.botao.count({ where: { perfilId } }),
  ]);

  if (totalCategorias > 0 || totalBotoes > 0) {
    throw new BusinessError(
      "Não é possível deletar perfil com categorias ou botões associados",
    );
  }

  await prisma.$transaction([
    prisma.personalizacaoCategoria.deleteMany({ where: { perfilId } }),
    prisma.personalizacaoBotao.deleteMany({ where: { perfilId } }),
    prisma.perfil.delete({ where: { id: perfilId } }),
  ]);
}