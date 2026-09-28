import { z } from "zod";

const uuidSchema = z.string().uuid("ID inválido");

export const categoriaCreateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  urlImagem: z.string().min(1, "URL da imagem é obrigatória"),
  perfilId: uuidSchema,
});

export const categoriaUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  urlImagem: z.string().min(1).optional(),
});

export type CategoriaCreateInput = z.infer<typeof categoriaCreateSchema>;
export type CategoriaUpdateInput = z.infer<typeof categoriaUpdateSchema>;