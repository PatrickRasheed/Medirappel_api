import { Router } from "express";
import { register, verifyOTPController, login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTPController);
router.post("/login", login);

export default router;