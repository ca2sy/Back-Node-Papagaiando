import { z } from "zod";

export const perfilCreateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  urlFoto: z.string().min(1, "URL da foto é obrigatória"),
});

export const perfilUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  urlFoto: z.string().min(1).optional(),
});

export type PerfilCreateInput = z.infer<typeof perfilCreateSchema>;
export type PerfilUpdateInput = z.infer<typeof perfilUpdateSchema>;