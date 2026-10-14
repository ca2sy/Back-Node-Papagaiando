import type { Request } from "express";
import { z } from "zod";
import { perfilIdQuerySchema, uuidSchema } from "../dtos/common.dto";
import { AuthenticationError } from "../errors";

// Id do usuário logado (preenchido pelo requireAuth). Dá erro 401 se não houver.
export function getUsuarioLogadoId(req: Request): string {
  if (!req.userId) throw AuthenticationError.missingToken();
  return req.userId;
}

// Lê um parâmetro da URL (ex: /:id) validando que é um UUID
export function getUuidParam(req: Request, nome: string): string {
  const parsed = z
    .object({ [nome]: uuidSchema })
    .parse({ [nome]: req.params[nome] });
  return parsed[nome];
}

// Lê ?perfilId=... da URL validando que é um UUID
export function getPerfilIdQuery(req: Request): string {
  return perfilIdQuerySchema.parse(req.query).perfilId;
}