import { AppError } from "./AppError";

export class BusinessError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode, "BUSINESS_RULE_VIOLATION");
  }

  static duplicateEmail(email: string) {
    return new BusinessError(`Email '${email}' já está cadastrado`);
  }

  static invalidPassword() {
    return new BusinessError("Senha deve ter no mínimo 8 caracteres");
  }

  static invalidData(field: string) {
    return new BusinessError(`Dados inválidos no campo: ${field}`);
  }
}