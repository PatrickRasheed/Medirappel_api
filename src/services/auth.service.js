// src/services/auth.service.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';                          // ← Ajout
import { prisma } from '../lib/prisma.js';
import { sendOTPEmail } from './email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const OTP_EXPIRY_MINUTES = 10;

// ── Fonctions utilitaires de hachage ─────────────────────────────────────────

// Hash le mot de passe avec bcrypt (10 "rounds" = bon équilibre sécurité/vitesse)
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Compare un mot de passe en clair avec son hash stocké en base
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ── Inscription ───────────────────────────────────────────────────────────────

export async function registerUser(email, password) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("Un utilisateur avec cet e-mail existe déjà.");
  }

  const hashedPassword = await hashPassword(password);  // ← async maintenant

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  // Envoie l'OTP sans bloquer la réponse si l'email échoue
  try {
    await generateAndSendOTP(email);
  } catch (error) {
    console.error('Échec de l\'envoi de l\'OTP:', error.message);
  }

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
  };
}

// ── Vérification OTP ──────────────────────────────────────────────────────────

export async function verifyOTP(email, otp) {
  const verification = await prisma.otpVerification.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    throw new Error("Aucun code OTP trouvé. Veuillez en demander un nouveau.");
  }

  if (new Date() > verification.expiresAt) {
    await prisma.otpVerification.delete({ where: { id: verification.id } });
    throw new Error("Le code OTP a expiré. Veuillez en demander un nouveau.");
  }

  if (verification.otp !== otp) {
    throw new Error("Code OTP invalide.");
  }

  // Marque l'email comme vérifié
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  // Supprime l'OTP utilisé
  await prisma.otpVerification.delete({ where: { id: verification.id } });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerified: true, createdAt: true },
  });

  return user;
}

// ── Connexion ─────────────────────────────────────────────────────────────────

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Identifiants invalides.");
  }

  const isPasswordValid = await verifyPassword(password, user.password);  // ← async

  if (!isPasswordValid) {
    throw new Error("Identifiants invalides.");
  }

  if (!user.emailVerified) {
    throw new Error("Veuillez vérifier votre e-mail avant de vous connecter.");
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    },
  };
}

// ── OTP ───────────────────────────────────────────────────────────────────────

export async function generateAndSendOTP(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  await prisma.otpVerification.create({
    data: { email, otp, expiresAt },
  });

  await sendOTPEmail(email, otp);

  return { message: "Code OTP envoyé avec succès." };
}

// ── Vérification du token JWT ─────────────────────────────────────────────────

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}