import { getUserProfile } from "../services/user.service.js";

export async function getMe(req, res, next) {
  try {
    const profile = await getUserProfile(req.user.id);
    res.json({ user: profile });
  } catch (err) {
    next(err);
  }
}