import { AppError } from "./AppError";

export class ResourceNotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, "RESOURCE_NOT_FOUND");
  }

  static byId(resourceType: string, resourceId: string) {
    return new ResourceNotFoundError(
      `${resourceType} com ID '${resourceId}' não encontrado(a)`,
    );
  }
}