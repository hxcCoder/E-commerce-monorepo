import { PrismaClient } from "../../../generated/prisma";
import { env } from "../../config/env";

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    if (!env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required to initialize PrismaClient");
    }

    prisma = new PrismaClient({
      log: ["error", "warn"],
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}
