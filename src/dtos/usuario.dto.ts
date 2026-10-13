import { z } from "zod";

export const usuarioCreateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email deve ser válido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const usuarioUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email("Email deve ser válido").optional(),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").optional(),
});

export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>;