// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSQLite } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

// Récupère le chemin de la base de données depuis .env
// Format attendu : "file:./dev.db"
// On supprime le préfixe "file:" pour obtenir le chemin brut
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const dbPath = dbUrl.replace('file:', '');

// Ouvre la base de données SQLite
const sqlite = new Database(dbPath);

// Crée l'adaptateur Prisma pour better-sqlite3
const adapter = new PrismaBetterSQLite(sqlite);

// Crée et exporte le client Prisma (singleton partagé dans tout le projet)
export const prisma = new PrismaClient({ adapter });