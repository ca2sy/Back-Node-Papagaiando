import type { Request, Response } from "express";
import { esqueciSenhaSchema, passwordResetSchema } from "../dtos/auth.dto";
import {
  usuarioCreateSchema,
  usuarioUpdateSchema,
} from "../dtos/usuario.dto";
import { ResourceNotFoundError } from "../errors";
import * as usuarioService from "../services/usuario.service";
import { generateToken } from "../utils/jwt";
import { getUsuarioLogadoId } from "../utils/request";

const MENSAGEM_ESQUECI_SENHA =
  "Se o email estiver cadastrado, você receberá as instruções de recuperação.";

export async function criarUsuario(req: Request, res: Response): Promise<void> {
  const dados = usuarioCreateSchema.parse(req.body);

  const usuario = await usuarioService.registrarUsuario(dados);
  const token = generateToken(usuario.email, usuario.id);

  res.status(201).json({ usuario, token });
}

export async function buscarMeuPerfil(
  req: Request,
  res: Response,
): Promise<void> {
  const usuario = await usuarioService.buscarPorId(getUsuarioLogadoId(req));
  res.json(usuario);
}

export async function atualizarMeuPerfil(
  req: Request,
  res: Response,
): Promise<void> {
  const dados = usuarioUpdateSchema.parse(req.body);

  const usuario = await usuarioService.atualizarUsuario(
    getUsuarioLogadoId(req),
    dados,
  );
  res.json(usuario);
}

export async function deletarMinhaConta(
  req: Request,
  res: Response,
): Promise<void> {
  await usuarioService.deletarUsuario(getUsuarioLogadoId(req));
  res.status(204).send();
}

export async function esqueciSenha(req: Request, res: Response): Promise<void> {
  const { email } = esqueciSenhaSchema.parse({
    email: req.query.email ?? req.body?.email,
  });

  let token: string | undefined;
  try {
    token = await usuarioService.gerarTokenRecuperacao(email);
  } catch (err) {

    if (!(err instanceof ResourceNotFoundError)) throw err;
  }

  const exporToken = process.env.EXPOSE_RESET_TOKEN === "true";

  res.json({
    message: MENSAGEM_ESQUECI_SENHA,
    ...(exporToken && token ? { token } : {}),
  });
}

export async function redefinirSenha(
  req: Request,
  res: Response,
): Promise<void> {
  const { token, novaSenha } = passwordResetSchema.parse(req.body);

  await usuarioService.redefinirSenha(token, novaSenha);

  res.json({ message: "Senha redefinida com sucesso!" });
}