import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Active CORS : autorise notre frontend à appeler l'API
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    })
  );

  // Parseur JSON pour toutes les routes
  app.use(express.json());

  // Routes d'authentification
  app.use("/api/auth", authRoutes);

  // Routes utilisateur
  app.use("/api/users", userRoutes);

  // Route de test pour vérifier que le serveur tourne
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Middleware de gestion d'erreurs (doit être le dernier)
  app.use(errorHandler);

  return app;
}