import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Active CORS : autorise notre frontend à appeler l'API
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true, // autorise l'envoi des cookies de session
    })
  );
 // IMPORTANT : monté AVANT express.json(), Better Auth lit le corps brut lui-même
  app.all("/api/auth/*splat", toNodeHandler(auth));

  // Le parseur JSON s'applique aux routes définies APRÈS cette ligne
  app.use(express.json());
  app.use("/api/users", userRoutes);

  // Route de test pour vérifier que le serveur tourne
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });


  return app;
}