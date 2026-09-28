import { AppError } from "./AppError";

export class AccessDeniedError extends AppError {
  constructor(message: string) {
    super(message, 403, "ACCESS_DENIED");
  }

  static resource(resourceType: string, resourceId: string) {
    return new AccessDeniedError(
      `Acesso negado ao recurso: ${resourceType} (ID: ${resourceId})`,
    );
  }
}