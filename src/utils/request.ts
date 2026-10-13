import type { Request } from "express";
import { AuthenticationError } from "../errors";

export function getUsuarioLogadoId(req: Request): string {
  if (!req.userId) throw AuthenticationError.missingToken();
  return req.userId;
}