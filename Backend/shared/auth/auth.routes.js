import { Router } from "express";
import { refreshToken, logout, getProfile } from "./auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/profile", authMiddleware, getProfile);

export default router;
