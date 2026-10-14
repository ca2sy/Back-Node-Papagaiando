import { z } from "zod";

export const uuidSchema = z.string("ID inválido").uuid("ID inválido");

export const perfilIdQuerySchema = z.object({
  perfilId: z.string("perfilId é obrigatório").uuid("perfilId inválido"),
});

export const nomeQuerySchema = z.object({
  nome: z.string("Nome é obrigatório").trim().min(1, "Nome é obrigatório"),
});