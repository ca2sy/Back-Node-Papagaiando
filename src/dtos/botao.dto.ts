import { z } from "zod";

const uuidSchema = z.string().uuid("ID inválido");

export const botaoCreateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  urlImagem: z.string().min(1, "URL da imagem é obrigatória"),
  urlAudio: z.string().min(1, "URL do áudio é obrigatória"),
  categoriaId: uuidSchema,
});

export const botaoUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  urlImagem: z.string().min(1).optional(),
  urlAudio: z.string().min(1).optional(),
});

export type BotaoCreateInput = z.infer<typeof botaoCreateSchema>;
export type BotaoUpdateInput = z.infer<typeof botaoUpdateSchema>;