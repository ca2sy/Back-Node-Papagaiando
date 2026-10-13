import { prisma } from "../config/prisma";
import { BusinessError, ResourceNotFoundError } from "../errors";
import type {
  CategoriaCreateInput,
  CategoriaUpdateInput,
} from "../dtos/categoria.dto";
import {
  validarAcessoCategoria,
  validarPropriedadePerfil,
  validarRemocaoCategoria,
} from "./authorization.service";

function preenchido(valor: string | undefined): string | undefined {
  return valor !== undefined && valor.trim() !== "" ? valor : undefined;
}

interface CategoriaBase {
  id: string;
  nome: string;
  urlImagem: string;
  padrao: boolean;
  perfilId: string | null;
}

interface PersonalizacaoCategoria {
  nome: string | null;
  urlImagem: string | null;
}

function mesclar<T extends CategoriaBase>(
  categoria: T,
  personalizacao: PersonalizacaoCategoria | undefined,
) {
  return {
    ...categoria,
    nome: personalizacao?.nome ?? categoria.nome,
    urlImagem: personalizacao?.urlImagem ?? categoria.urlImagem,
    personalizado: personalizacao !== undefined,
  };
}

async function personalizacoesDoPerfil(
  perfilId: string,
  categoriaIds: string[],
) {
  const lista = await prisma.personalizacaoCategoria.findMany({
    where: { perfilId, categoriaId: { in: categoriaIds } },
  });
  return new Map(lista.map((p) => [p.categoriaId, p] as const));
}

async function buscarCategoriaPorIdOuFalhar(categoriaId: string) {
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
  });
  if (!categoria) throw ResourceNotFoundError.byId("Categoria", categoriaId);
  return categoria;
}

async function categoriaMesclada(categoriaId: string, perfilId: string) {
  const categoria = await buscarCategoriaPorIdOuFalhar(categoriaId);
  validarAcessoCategoria(categoria, perfilId);

  const personalizacao = await prisma.personalizacaoCategoria.findUnique({
    where: { categoriaId_perfilId: { categoriaId, perfilId } },
  });

  return mesclar(categoria, personalizacao ?? undefined);
}

export async function criarCategoria(
  { nome, urlImagem, perfilId }: CategoriaCreateInput,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  if (nome.trim() === "") throw BusinessError.invalidData("nome");
  if (urlImagem.trim() === "") throw BusinessError.invalidData("urlImagem");


  return prisma.categoria.create({
    data: { nome, urlImagem, perfilId, padrao: false },
  });
}


export async function listarPorPerfil(perfilId: string, usuarioId: string) {
  await validarPropriedadePerfil(perfilId, usuarioId);
  return prisma.categoria.findMany({ where: { perfilId } });
}


export async function listarCategoriasPadrao() {
  return prisma.categoria.findMany({ where: { padrao: true } });
}

export async function listarCategoriasPerfilComPadrao(
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const [doPerfil, padrao] = await Promise.all([
    prisma.categoria.findMany({ where: { perfilId }, orderBy: { nome: "asc" } }),
    prisma.categoria.findMany({
      where: { padrao: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  const personalizacoes = await personalizacoesDoPerfil(
    perfilId,
    padrao.map((c) => c.id),
  );

  return [
    ...doPerfil.map((c) => mesclar(c, undefined)),
    ...padrao.map((c) => mesclar(c, personalizacoes.get(c.id))),
  ];
}

export async function buscarPorId(
  categoriaId: string,
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);
  return categoriaMesclada(categoriaId, perfilId);
}

export async function buscarPorNomePerfil(
  perfilId: string,
  nome: string,
  usuarioId: string,
) {
  const todas = await listarCategoriasPerfilComPadrao(perfilId, usuarioId);
  const termo = nome.toLowerCase();
  return todas.filter((c) => c.nome.toLowerCase().includes(termo));
}

export async function atualizarCategoria(
  categoriaId: string,
  perfilId: string,
  dados: CategoriaUpdateInput,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const categoria = await buscarCategoriaPorIdOuFalhar(categoriaId);
  validarAcessoCategoria(categoria, perfilId);

  const campos = {
    nome: preenchido(dados.nome),
    urlImagem: preenchido(dados.urlImagem),
  };

  if (campos.nome !== undefined || campos.urlImagem !== undefined) {
    if (categoria.padrao) {
      await prisma.personalizacaoCategoria.upsert({
        where: { categoriaId_perfilId: { categoriaId, perfilId } },
        update: campos,
        create: { categoriaId, perfilId, ...campos },
      });
    } else {
      await prisma.categoria.update({
        where: { id: categoriaId },
        data: campos,
      });
    }
  }

  return categoriaMesclada(categoriaId, perfilId);
}

export async function restaurarCategoriaPadrao(
  categoriaId: string,
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const categoria = await buscarCategoriaPorIdOuFalhar(categoriaId);
  if (!categoria.padrao) {
    throw new BusinessError("Esta não é uma categoria padrão");
  }

  await prisma.personalizacaoCategoria.deleteMany({
    where: { categoriaId, perfilId },
  });

  return categoriaMesclada(categoriaId, perfilId);
}

export async function deletarCategoria(
  categoriaId: string,
  usuarioId: string,
): Promise<void> {
  await validarRemocaoCategoria(categoriaId, usuarioId);

  const totalBotoes = await prisma.botao.count({ where: { categoriaId } });
  if (totalBotoes > 0) {
    throw new BusinessError(
      "Não é possível deletar categoria com botões associados",
    );
  }

  await prisma.categoria.delete({ where: { id: categoriaId } });
}

export async function getBotoesPadraoDaCategoria(categoriaId: string) {
  const categoria = await buscarCategoriaPorIdOuFalhar(categoriaId);

  if (!categoria.padrao) {
    throw new BusinessError("Esta não é uma categoria padrão");
  }

  return prisma.botao.findMany({ where: { categoriaId, padrao: true } });
}