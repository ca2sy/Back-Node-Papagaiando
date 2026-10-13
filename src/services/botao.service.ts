import { prisma } from "../config/prisma";
import { BusinessError, ResourceNotFoundError } from "../errors";
import type {
  BotaoCreateInput,
  BotaoPersonalizadoCreateInput,
  BotaoUpdateInput,
} from "../dtos/botao.dto";
import {
  validarAcessoBotao,
  validarAcessoCategoria,
  validarPropriedadePerfil,
  validarRemocaoBotao,
} from "./authorization.service";

function preenchido(valor: string | undefined): string | undefined {
  return valor !== undefined && valor.trim() !== "" ? valor : undefined;
}

function validarDadosBotao({
  nome,
  urlImagem,
  urlAudio,
}: Pick<BotaoCreateInput, "nome" | "urlImagem" | "urlAudio">): void {
  if (nome.trim() === "") throw BusinessError.invalidData("nome");
  if (urlImagem.trim() === "") throw BusinessError.invalidData("urlImagem");
  if (urlAudio.trim() === "") throw BusinessError.invalidData("urlAudio");
}

interface BotaoBase {
  id: string;
  nome: string;
  urlImagem: string;
  urlAudio: string;
  padrao: boolean;
  perfilId: string | null;
}

interface PersonalizacaoBotao {
  nome: string | null;
  urlImagem: string | null;
  urlAudio: string | null;
}

function mesclar<T extends BotaoBase>(
  botao: T,
  personalizacao: PersonalizacaoBotao | undefined,
) {
  return {
    ...botao,
    nome: personalizacao?.nome ?? botao.nome,
    urlImagem: personalizacao?.urlImagem ?? botao.urlImagem,
    urlAudio: personalizacao?.urlAudio ?? botao.urlAudio,
    personalizado: personalizacao !== undefined,
  };
}

async function personalizacoesDoPerfil(perfilId: string, botaoIds: string[]) {
  const lista = await prisma.personalizacaoBotao.findMany({
    where: { perfilId, botaoId: { in: botaoIds } },
  });
  return new Map(lista.map((p) => [p.botaoId, p] as const));
}

async function buscarCategoriaPorIdOuFalhar(categoriaId: string) {
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
  });
  if (!categoria) throw ResourceNotFoundError.byId("Categoria", categoriaId);
  return categoria;
}

async function buscarBotaoPorIdOuFalhar(botaoId: string) {
  const botao = await prisma.botao.findUnique({ where: { id: botaoId } });
  if (!botao) throw ResourceNotFoundError.byId("Botao", botaoId);
  return botao;
}

async function botaoMesclado(botaoId: string, perfilId: string) {
  const botao = await buscarBotaoPorIdOuFalhar(botaoId);
  validarAcessoBotao(botao, perfilId);

  const personalizacao = await prisma.personalizacaoBotao.findUnique({
    where: { botaoId_perfilId: { botaoId, perfilId } },
  });

  return mesclar(botao, personalizacao ?? undefined);
}

export async function criarBotaoPadrao(dados: BotaoCreateInput) {
  await buscarCategoriaPorIdOuFalhar(dados.categoriaId);
  validarDadosBotao(dados);

  return prisma.botao.create({ data: { ...dados, padrao: true } });
}

export async function criarBotaoPersonalizado(
  { perfilId, ...dados }: BotaoPersonalizadoCreateInput,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const categoria = await buscarCategoriaPorIdOuFalhar(dados.categoriaId);
  validarAcessoCategoria(categoria, perfilId);
  validarDadosBotao(dados);

  return prisma.botao.create({ data: { ...dados, padrao: false, perfilId } });
}


export async function listarPorCategoria(
  categoriaId: string,
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const categoria = await buscarCategoriaPorIdOuFalhar(categoriaId);
  validarAcessoCategoria(categoria, perfilId);

  const botoes = await prisma.botao.findMany({
    where: { categoriaId, OR: [{ padrao: true }, { perfilId }] },
    orderBy: [{ padrao: "desc" }, { nome: "asc" }],
  });

  const personalizacoes = await personalizacoesDoPerfil(
    perfilId,
    botoes.filter((b) => b.padrao).map((b) => b.id),
  );

  return botoes.map((b) => mesclar(b, personalizacoes.get(b.id)));
}


export async function listarBotoesPadraoPorCategoria(categoriaId: string) {
  return prisma.botao.findMany({ where: { categoriaId, padrao: true } });
}

export async function listarBotoesPersonalizadosPorCategoria(
  categoriaId: string,
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const categoria = await buscarCategoriaPorIdOuFalhar(categoriaId);
  validarAcessoCategoria(categoria, perfilId);

  return prisma.botao.findMany({
    where: { categoriaId, padrao: false, perfilId },
    orderBy: { nome: "asc" },
  });
}

export async function buscarPorId(
  botaoId: string,
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);
  return botaoMesclado(botaoId, perfilId);
}

export async function atualizarBotao(
  botaoId: string,
  perfilId: string,
  dados: BotaoUpdateInput,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const botao = await buscarBotaoPorIdOuFalhar(botaoId);
  validarAcessoBotao(botao, perfilId);

  const campos = {
    nome: preenchido(dados.nome),
    urlImagem: preenchido(dados.urlImagem),
    urlAudio: preenchido(dados.urlAudio),
  };

  const temMudanca =
    campos.nome !== undefined ||
    campos.urlImagem !== undefined ||
    campos.urlAudio !== undefined;

  if (temMudanca) {
    if (botao.padrao) {
      await prisma.personalizacaoBotao.upsert({
        where: { botaoId_perfilId: { botaoId, perfilId } },
        update: campos,
        create: { botaoId, perfilId, ...campos },
      });
    } else {
      await prisma.botao.update({ where: { id: botaoId }, data: campos });
    }
  }

  return botaoMesclado(botaoId, perfilId);
}

export async function restaurarBotaoPadrao(
  botaoId: string,
  perfilId: string,
  usuarioId: string,
) {
  await validarPropriedadePerfil(perfilId, usuarioId);

  const botao = await buscarBotaoPorIdOuFalhar(botaoId);
  if (!botao.padrao) {
    throw new BusinessError("Este não é um botão padrão");
  }

  await prisma.personalizacaoBotao.deleteMany({
    where: { botaoId, perfilId },
  });

  return botaoMesclado(botaoId, perfilId);
}

export async function deletarBotao(
  botaoId: string,
  usuarioId: string,
): Promise<void> {
  await validarRemocaoBotao(botaoId, usuarioId);
  await prisma.botao.delete({ where: { id: botaoId } });
}