import { verifyToken } from "../services/auth.service.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token d'authentification manquant. Veuillez vous connecter.",
    });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: "Token invalide ou expiré. Veuillez vous reconnecter.",
    });
  }

  req.user = decoded;
  next();
}