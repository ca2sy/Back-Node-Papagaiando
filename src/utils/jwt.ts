import jwt from "jsonwebtoken";
import { AuthenticationError } from "../errors";

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error("Variável de ambiente JWT_SECRET não definida");
  })();


const JWT_EXPIRATION_SECONDS = Number(process.env.JWT_EXPIRATION ?? 36000);

interface TokenPayload {
  sub: string; 
  userId: string;
}

export function generateToken(email: string, userId: string): string {
  return jwt.sign({ userId } satisfies Omit<TokenPayload, "sub">, JWT_SECRET, {
    subject: email,
    expiresIn: JWT_EXPIRATION_SECONDS,
    algorithm: "HS256",
  });
}

function decode(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw AuthenticationError.expiredToken();
    }
    throw AuthenticationError.invalidToken();
  }
}

export function extractUsername(token: string): string {
  const payload = decode(token);
  if (!payload.sub) throw AuthenticationError.invalidToken();
  return payload.sub;
}

export function extractUserId(token: string): string {
  const payload = decode(token);
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!payload.userId || !UUID_REGEX.test(payload.userId)) {
    throw AuthenticationError.invalidToken();
  }
  return payload.userId;
}

export function extractTokenFromHeader(
  authHeader: string | undefined,
): string {
  if (!authHeader) throw AuthenticationError.missingToken();
  if (!authHeader.startsWith("Bearer ")) {
    throw AuthenticationError.invalidToken();
  }
  return authHeader.slice("Bearer ".length);
}