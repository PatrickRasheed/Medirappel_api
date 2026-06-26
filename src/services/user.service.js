import { prisma } from "../lib/prisma.js";

export async function getUserProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, emailVerified: true, createdAt: true },
  });
}