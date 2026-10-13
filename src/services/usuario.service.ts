import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma";
import {
  AuthenticationError,
  BusinessError,
  InvalidTokenError,
  ResourceNotFoundError,
} from "../errors";
import type {
  UsuarioCreateInput,
  UsuarioUpdateInput,
} from "../dtos/usuario.dto";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const TOKEN_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora


const DUMMY_HASH = bcrypt.hashSync("senha-falsa", SALT_ROUNDS);


const camposPublicos = { id: true, nome: true, email: true } as const;

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "P2002"
  );
}

function validarSenha(senha: string): void {
  if (senha.length < MIN_PASSWORD_LENGTH) {
    throw BusinessError.invalidPassword();
  }
}

function validarNome(nome: string): void {
  if (nome.trim() === "") {
    throw BusinessError.invalidData("nome");
  }
}

async function buscarPorIdOuFalhar(id: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw ResourceNotFoundError.byId("Usuario", id);
  return usuario;
}

async function validarEmailDisponivel(email: string): Promise<void> {
  const existe = await prisma.usuario.count({ where: { email } });
  if (existe > 0) throw BusinessError.duplicateEmail(email);
}

export async function registrarUsuario({
  email,
  nome,
  senha,
}: UsuarioCreateInput) {
  await validarEmailDisponivel(email);
  validarNome(nome);
  validarSenha(senha);

  const senhaCriptografada = await bcrypt.hash(senha, SALT_ROUNDS);

  try {
    return await prisma.usuario.create({
      data: { email, nome, senha: senhaCriptografada },
      select: camposPublicos,
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw BusinessError.duplicateEmail(email);
    throw err;
  }
}

export async function autenticarUsuario(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  const senhaConfere = await bcrypt.compare(
    senha,
    usuario ? usuario.senha : DUMMY_HASH,
  );

  if (!usuario || !senhaConfere) {
    throw AuthenticationError.invalidCredentials();
  }

  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

export async function atualizarUsuario(id: string, dados: UsuarioUpdateInput) {
  const usuario = await buscarPorIdOuFalhar(id);

  const data: { email?: string; nome?: string; senha?: string } = {};

  if (dados.email !== undefined && dados.email !== usuario.email) {
    await validarEmailDisponivel(dados.email);
    data.email = dados.email;
  }

  if (dados.nome !== undefined) {
    validarNome(dados.nome);
    data.nome = dados.nome;
  }

  if (dados.senha !== undefined) {
    validarSenha(dados.senha);
    data.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS);
  }

  try {
    return await prisma.usuario.update({
      where: { id },
      data,
      select: camposPublicos,
    });
  } catch (err) {
    if (isUniqueViolation(err) && data.email) {
      throw BusinessError.duplicateEmail(data.email);
    }
    throw err;
  }
}

export async function listarUsuarios() {
  return prisma.usuario.findMany({ select: camposPublicos });
}

export async function buscarPorId(id: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: camposPublicos,
  });
  if (!usuario) throw ResourceNotFoundError.byId("Usuario", id);
  return usuario;
}

export async function deletarUsuario(id: string): Promise<void> {
  await buscarPorIdOuFalhar(id);

  const totalPerfis = await prisma.perfil.count({ where: { usuarioId: id } });
  if (totalPerfis > 0) {
    throw new BusinessError(
      "Não é possível deletar usuário com perfis associados",
    );
  }

  await prisma.usuario.delete({ where: { id } });
}

export async function gerarTokenRecuperacao(email: string): Promise<string> {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) throw ResourceNotFoundError.byId("Usuario", email);

  const token = randomUUID();

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      tokenRecuperacao: token,
      expiracaoToken: new Date(Date.now() + TOKEN_EXPIRATION_MS),
    },
  });

  return token;
}

export async function validarTokenRecuperacao(token: string): Promise<boolean> {
  const usuario = await prisma.usuario.findFirst({
    where: { tokenRecuperacao: token },
  });
  if (!usuario || !usuario.expiracaoToken) return false;
  return usuario.expiracaoToken > new Date();
}

export async function redefinirSenha(
  token: string,
  novaSenha: string,
): Promise<void> {
  const usuario = await prisma.usuario.findFirst({
    where: { tokenRecuperacao: token },
  });

  if (!usuario) throw InvalidTokenError.notFound();

  if (!usuario.expiracaoToken || usuario.expiracaoToken <= new Date()) {
    throw InvalidTokenError.expired();
  }

  validarSenha(novaSenha);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senha: await bcrypt.hash(novaSenha, SALT_ROUNDS),
      tokenRecuperacao: null,
      expiracaoToken: null,
    },
  });
}

export async function verificarSenha(
  id: string,
  senha: string,
): Promise<boolean> {
  const usuario = await buscarPorIdOuFalhar(id);
  return bcrypt.compare(senha, usuario.senha);
}