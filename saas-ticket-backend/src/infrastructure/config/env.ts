import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().optional(),
    JWT_SECRET: z.string().optional(),
    JWT_ISSUER: z.string().optional(),
    JWT_AUDIENCE: z.string().optional(),
    ENABLE_AUTH: z.enum(["true", "false"]).default("true"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== "test" && !data.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required outside test environment",
      });
    }

    if (data.NODE_ENV !== "test" && data.ENABLE_AUTH === "true") {
      if (!data.JWT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_SECRET"],
          message: "JWT_SECRET is required when ENABLE_AUTH=true",
        });
      } else if (data.JWT_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_SECRET"],
          message: "JWT_SECRET must be at least 32 chars",
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = {
  ...parsed.data,
  enableAuth: parsed.data.ENABLE_AUTH === "true",
  corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
};
