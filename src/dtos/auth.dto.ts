import { z } from "zod";

export const authLoginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email deve ser válido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  novaSenha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const passwordVerifySchema = z.object({
  senha: z.string().min(1, "Senha é obrigatória"),
});

export type AuthLoginInput = z.infer<typeof authLoginSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordVerifyInput = z.infer<typeof passwordVerifySchema>;