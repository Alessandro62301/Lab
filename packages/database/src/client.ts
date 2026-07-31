import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  labPrisma?: PrismaClient;
};

export const db =
  globalForPrisma.labPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.labPrisma = db;
}
