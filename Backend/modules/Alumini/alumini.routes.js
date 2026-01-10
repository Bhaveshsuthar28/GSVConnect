import { Router } from "express";
import passport from "passport";
import { 
    registerAlumni, 
    verifyAlumniOtp, 
    loginAlumni, 
    uploadProof, 
    getAlumniProfile,
    updateAlumniProfile 
} from "./alumini.controller.js";
import { logout } from "../../shared/auth/auth.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { upload } from "../../shared/middlewares/upload.middleware.js";

const router = Router();

router.post("/register", registerAlumni);
router.post("/login", loginAlumni);
router.post("/logout", logout);
router.post("/verify-email", verifyAlumniOtp);
router.post("/upload-proof", authMiddleware, uploadProof);

router.route("/profile")
    .get(authMiddleware, getAlumniProfile)
    .patch(authMiddleware, upload.fields([
        { name: 'profileImage', maxCount: 1 }, 
        { name: 'proofDocument', maxCount: 1 }
    ]), updateAlumniProfile);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login/failed",
        session: false,
    }),
    (req, res) => {
        const { tokens } = req.user;
        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 40 * 60 * 1000, // 40 minutes
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.FRONTEND_URL}/`);
    }
);

export default router;


