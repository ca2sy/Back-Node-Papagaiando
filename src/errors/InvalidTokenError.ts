import { AppError } from "./AppError";

export class InvalidTokenError extends AppError {
  constructor(message: string) {
    super(message, 400, "INVALID_TOKEN");
  }

  static expired() {
    return new InvalidTokenError("Token expirado");
  }

  static invalid() {
    return new InvalidTokenError("Token inválido");
  }

  static notFound() {
    return new InvalidTokenError("Token não encontrado");
  }
}