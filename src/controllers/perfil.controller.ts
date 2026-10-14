import type { Request, Response } from "express";
import { perfilCreateSchema, perfilUpdateSchema } from "../dtos/perfil.dto";
import * as perfilService from "../services/perfil.service";
import { getUsuarioLogadoId, getUuidParam } from "../utils/request";

export async function criarPerfil(req: Request, res: Response): Promise<void> {
  const dados = perfilCreateSchema.parse(req.body);

  const perfil = await perfilService.criarPerfil(
    dados,
    getUsuarioLogadoId(req),
  );
  res.status(201).json(perfil);
}

export async function listarMeusPerfis(
  req: Request,
  res: Response,
): Promise<void> {
  const perfis = await perfilService.listarPerfisPorUsuario(
    getUsuarioLogadoId(req),
  );
  res.json(perfis);
}

export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const perfil = await perfilService.buscarPorId(
    getUuidParam(req, "id"),
    getUsuarioLogadoId(req),
  );
  res.json(perfil);
}

export async function atualizarPerfil(
  req: Request,
  res: Response,
): Promise<void> {
  const dados = perfilUpdateSchema.parse(req.body);

  const perfil = await perfilService.atualizarPerfil(
    getUuidParam(req, "id"),
    dados,
    getUsuarioLogadoId(req),
  );
  res.json(perfil);
}

export async function deletarPerfil(
  req: Request,
  res: Response,
): Promise<void> {
  await perfilService.deletarPerfil(
    getUuidParam(req, "id"),
    getUsuarioLogadoId(req),
  );
  res.status(204).send();
}