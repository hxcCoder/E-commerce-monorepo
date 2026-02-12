import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

function createMockResponse() {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("authMiddleware", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      ENABLE_AUTH: "true",
      JWT_SECRET: "super-secure-test-secret-with-32-plus",
      JWT_ISSUER: "issuer-test",
      JWT_AUDIENCE: "audience-test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns 401 when Authorization header is missing", async () => {
    const { authMiddleware } = await import("../authMiddleware");

    const req = { headers: {} } as any;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing or invalid Authorization header" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    const { authMiddleware } = await import("../authMiddleware");

    const req = { headers: { authorization: "Bearer invalid.token" } } as any;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and enriches req.auth for a valid token", async () => {
    const { authMiddleware } = await import("../authMiddleware");

    const token = jwt.sign(
      { sub: "user-1", tenantId: "org-1", role: "admin", jti: "jti-1" },
      process.env.JWT_SECRET as string,
      {
        algorithm: "HS256",
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      },
    );

    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.auth).toEqual({
      sub: "user-1",
      tenantId: "org-1",
      role: "admin",
      jti: "jti-1",
    });
  });

  it("skips auth when ENABLE_AUTH=false", async () => {
    process.env.ENABLE_AUTH = "false";
    const { authMiddleware } = await import("../authMiddleware");

    const req = { headers: {} } as any;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
