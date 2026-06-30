// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import "dotenv/config";

// Récupère le chemin de la base de données depuis .env
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

// Crée l'adaptateur Prisma pour better-sqlite3
// Le constructeur attend (config, options) où config = { url: "file:./dev.db" }
const adapter = new PrismaBetterSqlite3({ url: dbUrl }, {});

// Crée et exporte le client Prisma (singleton partagé dans tout le projet)
export const prisma = new PrismaClient({ adapter });
