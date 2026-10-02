import type { NextFunction, Request, Response } from "express";
import { extractTokenFromHeader, extractUserId, extractUsername } from "../utils/jwt";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractTokenFromHeader(req.header("Authorization"));
    req.userEmail = extractUsername(token);
    req.userId = extractUserId(token);
    next();
  } catch (err) {
    next(err);
  }
}