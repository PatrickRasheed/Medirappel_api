import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../services/email.service.js";

export const auth = betterAuth({
  // Connecte Better Auth à notre base de données via Prisma
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  // Active l'authentification par e-mail + mot de passe
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },

  // Vérification de l'adresse e-mail après inscription
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  // Configuration des sessions
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours, en secondes
    updateAge: 60 * 60 * 24,     // rafraîchit la session toutes les 24h d'activité
  },

  // Origines autorisées à appeler l'API (sécurité CSRF)
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:5173"],
});