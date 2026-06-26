import { PrismaClient } from "@prisma/client";

// On évite de recréer un client à chaque rechargement en dev (--watch)
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}