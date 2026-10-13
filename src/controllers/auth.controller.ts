import type { Request, Response } from "express";
import { authLoginSchema, passwordVerifySchema } from "../dtos/auth.dto";
import * as usuarioService from "../services/usuario.service";
import { generateToken } from "../utils/jwt";
import { getUsuarioLogadoId } from "../utils/request";

export async function login(req: Request, res: Response): Promise<void> {
  const { email, senha } = authLoginSchema.parse(req.body);

  const usuario = await usuarioService.autenticarUsuario(email, senha);
  const token = generateToken(usuario.email, usuario.id);

  res.json({
    token,
    email: usuario.email,
    userId: usuario.id,
    nome: usuario.nome,
  });
}

export async function verificarSenha(
  req: Request,
  res: Response,
): Promise<void> {
  const { senha } = passwordVerifySchema.parse(req.body);

  const valido = await usuarioService.verificarSenha(
    getUsuarioLogadoId(req),
    senha,
  );

  if (!valido) {
    res.status(401).json({ valido: false, message: "Senha incorreta" });
    return;
  }

  res.json({ valido: true });
}