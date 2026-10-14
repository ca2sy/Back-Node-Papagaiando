import type { Request, Response } from "express";
import {
  botaoPersonalizadoCreateSchema,
  botaoUpdateSchema,
} from "../dtos/botao.dto";
import * as botaoService from "../services/botao.service";
import {
  getPerfilIdQuery,
  getUsuarioLogadoId,
  getUuidParam,
} from "../utils/request";

export async function criarBotaoPersonalizado(
  req: Request,
  res: Response,
): Promise<void> {
  const dados = botaoPersonalizadoCreateSchema.parse(req.body);

  const botao = await botaoService.criarBotaoPersonalizado(
    dados,
    getUsuarioLogadoId(req),
  );
  res.status(201).json(botao);
}

export async function listarPorCategoria(
  req: Request,
  res: Response,
): Promise<void> {
  const botoes = await botaoService.listarPorCategoria(
    getUuidParam(req, "categoriaId"),
    getPerfilIdQuery(req),
    getUsuarioLogadoId(req),
  );
  res.json(botoes);
}

export async function listarBotoesPadrao(
  req: Request,
  res: Response,
): Promise<void> {
  const botoes = await botaoService.listarBotoesPadraoPorCategoria(
    getUuidParam(req, "categoriaId"),
  );
  res.json(botoes);
}

export async function listarBotoesPersonalizados(
  req: Request,
  res: Response,
): Promise<void> {
  const botoes = await botaoService.listarBotoesPersonalizadosPorCategoria(
    getUuidParam(req, "categoriaId"),
    getPerfilIdQuery(req),
    getUsuarioLogadoId(req),
  );
  res.json(botoes);
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const botao = await botaoService.buscarPorId(
    getUuidParam(req, "id"),
    getPerfilIdQuery(req),
    getUsuarioLogadoId(req),
  );
  res.json(botao);
}

export async function atualizarBotao(
  req: Request,
  res: Response,
): Promise<void> {
  const dados = botaoUpdateSchema.parse(req.body);

  const botao = await botaoService.atualizarBotao(
    getUuidParam(req, "id"),
    getPerfilIdQuery(req),
    dados,
    getUsuarioLogadoId(req),
  );
  res.json(botao);
}

export async function restaurarBotao(
  req: Request,
  res: Response,
): Promise<void> {
  const botao = await botaoService.restaurarBotaoPadrao(
    getUuidParam(req, "id"),
    getPerfilIdQuery(req),
    getUsuarioLogadoId(req),
  );
  res.json(botao);
}

export async function deletarBotao(
  req: Request,
  res: Response,
): Promise<void> {
  await botaoService.deletarBotao(
    getUuidParam(req, "id"),
    getUsuarioLogadoId(req),
  );
  res.status(204).send();
}