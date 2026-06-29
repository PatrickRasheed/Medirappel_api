// src/app.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Active CORS pour le frontend Ionic (port 8100 en développement)
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:8100',  // ← Corrigé
      credentials: true,
    })
  );

  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);

  return app;
}