import { STATUS_CODES } from "node:http";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors";


export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  errorCode: string;
  message: string;
  path: string;
  details?: string[];
}

function buildResponse(
  req: Request,
  status: number,
  errorCode: string,
  message: string,
  details?: string[],
): ErrorResponse {
  return {
    timestamp: new Date().toISOString(),
    status,
    error: STATUS_CODES[status] ?? "Error",
    errorCode,
    message,
    path: req.path,
    ...(details && { details }),
  };
}


export function notFoundHandler(req: Request, res: Response): void {
  res
    .status(404)
    .json(
      buildResponse(
        req,
        404,
        "RESOURCE_NOT_FOUND",
        `Rota não encontrada: ${req.method} ${req.path}`,
      ),
    );
}


export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {

  if (err instanceof AppError) {
    console.warn(`[${err.errorCode}] ${err.message}`);
    res
      .status(err.statusCode)
      .json(buildResponse(req, err.statusCode, err.errorCode, err.message));
    return;
  }

 
  if (err instanceof ZodError) {
    const details = err.issues.map(
      (issue) => `${issue.path.join(".") || "body"}: ${issue.message}`,
    );
    res
      .status(400)
      .json(
        buildResponse(
          req,
          400,
          "VALIDATION_ERROR",
          "Erro de validação nos dados fornecidos",
          details,
        ),
      );
    return;
  }

 
  if (err instanceof SyntaxError && "body" in err) {
    res
      .status(400)
      .json(
        buildResponse(
          req,
          400,
          "MALFORMED_JSON",
          "Formato de JSON inválido ou malformado",
        ),
      );
    return;
  }


  console.error("Erro não tratado:", err);
  res
    .status(500)
    .json(buildResponse(req, 500, "INTERNAL_ERROR", "Erro interno do servidor"));
}