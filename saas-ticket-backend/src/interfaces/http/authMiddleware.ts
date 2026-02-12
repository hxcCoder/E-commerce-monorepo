import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../infrastructure/config/env";

export type AuthenticatedRequest = Request & {
  auth?: {
    sub: string;
    tenantId?: string;
    role?: string;
    jti?: string;
  };
};

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!env.enableAuth) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  const secret = env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "JWT configuration missing" });
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as jwt.JwtPayload;

    req.auth = {
      sub: String(payload.sub ?? ""),
      tenantId: payload.tenantId ? String(payload.tenantId) : undefined,
      role: payload.role ? String(payload.role) : undefined,
      jti: payload.jti ? String(payload.jti) : undefined,
    };

    if (!req.auth.sub) {
      return res.status(401).json({ error: "Token subject (sub) is required" });
    }

    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
