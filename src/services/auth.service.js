import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { sendOTPEmail } from "./email.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES = "7d";
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

// Hash password using JWT secret
function hashPassword(password) {
  return jwt.sign({ password }, JWT_SECRET);
}

// Verify password against hash
function verifyPassword(password, hash) {
  try {
    const decoded = jwt.verify(hash, JWT_SECRET);
    return decoded.password === password;
  } catch (error) {
    return false;
  }
}

export async function registerUser(email, password) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Un utilisateur avec cet e-mail existe déjà.");
  }

  const hashedPassword = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  // Send OTP email (don't block registration if email fails)
  try {
    await generateAndSendOTP(email);
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
  }

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
  };
}

export async function verifyOTP(email, otp) {
  const verification = await prisma.otpVerification.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    throw new Error("Aucun code OTP trouvé. Veuillez en demander un nouveau.");
  }

  if (new Date() > verification.expiresAt) {
    await prisma.otpVerification.delete({
      where: { id: verification.id },
    });
    throw new Error("Le code OTP a expiré. Veuillez en demander un nouveau.");
  }

  if (verification.otp !== otp) {
    throw new Error("Code OTP invalide.");
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  await prisma.otpVerification.delete({
    where: { id: verification.id },
  });

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Identifiants invalides.");
  }

  const isPasswordValid = verifyPassword(password, user.password);

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

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé.");
  }

  return user;
}

export async function generateAndSendOTP(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  await prisma.otpVerification.create({
    data: {
      email,
      otp,
      expiresAt,
    },
  });

  await sendOTPEmail(email, otp);

  return { message: "Code OTP envoyé avec succès." };
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}