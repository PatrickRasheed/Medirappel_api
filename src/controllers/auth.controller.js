import { registerUser, verifyOTP, loginUser } from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "L'e-mail et le mot de passe sont requis.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const user = await registerUser(email, password);

    res.status(201).json({
      message: "Utilisateur créé avec succès. Veuillez vérifier votre e-mail.",
      user,
    });
  } catch (err) {
    if (err.message.includes("existe déjà")) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}

export async function verifyOTPController(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "L'e-mail et le code OTP sont requis.",
      });
    }

    const user = await verifyOTP(email, otp);

    res.json({
      message: "E-mail vérifié avec succès !",
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "L'e-mail et le mot de passe sont requis.",
      });
    }

    const result = await loginUser(email, password);

    res.json({
      message: "Connexion réussie !",
      ...result,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}