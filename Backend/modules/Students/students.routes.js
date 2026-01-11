import { Router } from "express";
import passport from "passport";
import { registerStudent, verifyStudentEmail, loginStudent, getStudentProfile, updateStudentProfile } from "./students.controller.js";
import { logout } from "../../shared/auth/auth.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { uploadSingle } from "../../shared/middlewares/upload.middleware.js";
import { getAuthCookieOptions } from "../../shared/auth/cookies.js";

const router = Router();

router.post("/register", registerStudent);
router.post("/verify-email", verifyStudentEmail);
router.post("/login", loginStudent);
router.post("/logout", logout);

router.get(
    "/google",
    passport.authenticate("google-student", {
        scope: ["profile", "email"],
        prompt: "select_account",
        session: false,
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google-student", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth?error=google`,
    }),
    (req, res) => {
        const { tokens } = req.user;
        const cookieOptions = getAuthCookieOptions();

        res.cookie("accessToken", tokens.accessToken, {
            ...cookieOptions,
            maxAge: 40 * 60 * 1000,
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            ...cookieOptions,
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/`);
    }
);

router.route("/profile")
    .get(authMiddleware, getStudentProfile)
    .patch(authMiddleware, uploadSingle("profileImage"), updateStudentProfile);

export default router;