import express from "express";
import cors from "cors";

export function createApp() {
  const app = express();

  // Active CORS : autorise notre frontend à appeler l'API
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true, // autorise l'envoi des cookies de session
    })
  );

  // Route de test pour vérifier que le serveur tourne
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}