// src/controllers/user.controller.js
import { getUserProfile } from '../services/user.service.js';

export async function getMe(req, res, next) {
  try {
    // req.user.userId (et non req.user.id) — c'est la clé utilisée dans jwt.sign()
    const profile = await getUserProfile(req.user.userId);  // ← Corrigé
    res.json({ user: profile });
  } catch (err) {
    next(err);
  }
}
