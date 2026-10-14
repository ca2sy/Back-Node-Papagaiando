import type { Request, Response } from "express";
import {
  categoriaCreateSchema,
  categoriaUpdateSchema,
} from "../dtos/categoria.dto";
import { nomeQuerySchema } from "../dtos/common.dto";
import * as categoriaService from "../services/categoria.service";
import {
  getPerfilIdQuery,
  getUsuarioLogadoId,
  getUuidParam,
} from "../utils/request";

export async function criarCategoria(
  req: Request,
  res: Response,
): Promise<void> {
  const dados = categoriaCreateSchema.parse(req.body);

  const categoria = await categoriaService.criarCategoria(
    dados,
    getUsuarioLogadoId(req),
  );
  res.status(201).json(categoria);
}

export async function listarCategoriasPadrao(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json(await categoriaService.listarCategoriasPadrao());
}

export async function listarCategoriasPerfil(
  req: Request,
  res: Response,
): Promise<void> {
  const categorias = await categoriaService.listarCategoriasPerfilComPadrao(
    getUuidParam(req, "perfilId"),
    getUsuarioLogadoId(req),
  );
  res.json(categorias);
}

export async function buscarPorNomePerfil(
  req: Request,
  res: Response,
): Promise<void> {
  const { nome } = nomeQuerySchema.parse(req.query);

  const categorias = await categoriaService.buscarPorNomePerfil(
    getUuidParam(req, "perfilId"),
    nome,
    getUsuarioLogadoId(req),
  );
  res.json(categorias);
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const categoria = await categoriaService.buscarPorId(
    getUuidParam(req, "id"),
    getPerfilIdQuery(req),
    getUsuarioLogadoId(req),
  );
  res.json(categoria);
}

export async function getBotoesPadraoDaCategoria(
  req: Request,
  res: Response,
): Promise<void> {
  const botoes = await categoriaService.getBotoesPadraoDaCategoria(
    getUuidParam(req, "categoriaId"),
  );
  res.json(botoes);
}

export async function atualizarCategoria(
  req: Request,
  res: Response,
): Promise<void> {
  const dados = categoriaUpdateSchema.parse(req.body);

  const categoria = await categoriaService.atualizarCategoria(
    getUuidParam(req, "id"),
    getPerfilIdQuery(req),
    dados,
    getUsuarioLogadoId(req),
  );
  res.json(categoria);
}

export async function restaurarCategoria(
  req: Request,
  res: Response,
): Promise<void> {
  const categoria = await categoriaService.restaurarCategoriaPadrao(
    getUuidParam(req, "id"),
    getPerfilIdQuery(req),
    getUsuarioLogadoId(req),
  );
  res.json(categoria);
}

export async function deletarCategoria(
  req: Request,
  res: Response,
): Promise<void> {
  await categoriaService.deletarCategoria(
    getUuidParam(req, "id"),
    getUsuarioLogadoId(req),
  );
  res.status(204).send();
}