import { AppError } from "./AppError";

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401, "AUTHENTICATION_FAILED");
  }

  static invalidCredentials() {
    return new AuthenticationError("Email ou senha inválidos");
  }

  static invalidToken() {
    return new AuthenticationError("Token de autenticação inválido");
  }

  static expiredToken() {
    return new AuthenticationError("Token de autenticação expirado");
  }

  static missingToken() {
    return new AuthenticationError("Token de autenticação não fornecido");
  }
}