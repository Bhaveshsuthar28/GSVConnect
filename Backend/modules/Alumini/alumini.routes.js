import { Router } from "express";
import passport from "passport";
import { 
    registerAlumni, 
    verifyAlumniOtp, 
    loginAlumni, 
    uploadProof, 
    getAlumniProfile,
    updateAlumniProfile,
    listAlumniDirectory,
    getAlumniPublicProfile,
    createAlumniStory,
    listAlumniStories,
    deleteAlumniStory,
} from "./alumini.controller.js";
import { logout } from "../../shared/auth/auth.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { uploadFields, uploadSingle } from "../../shared/middlewares/upload.middleware.js";
import { getAuthCookieOptions } from "../../shared/auth/cookies.js";

const router = Router();

router.post("/register", registerAlumni);
router.post("/login", loginAlumni);
router.post("/logout", logout);
router.post("/verify-email", verifyAlumniOtp);
router.post("/upload-proof", authMiddleware, uploadSingle("proofDocument"), uploadProof);

router.route("/profile")
    .get(authMiddleware, getAlumniProfile)
    .patch(
        authMiddleware,
        uploadFields([
            { name: "profileImage", maxCount: 1 },
            { name: "proofDocument", maxCount: 1 },
        ]),
        updateAlumniProfile
    );

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account", session: false }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login/failed",
        session: false,
    }),
    (req, res) => {
        const { tokens } = req.user;
        const cookieOptions = getAuthCookieOptions();

        res.cookie("accessToken", tokens.accessToken, {
            ...cookieOptions,
            maxAge: 40 * 60 * 1000, // 40 minutes
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            ...cookieOptions,
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/`);
    }
);

router.get("/directory", authMiddleware, listAlumniDirectory);
router.route("/stories")
    .get(authMiddleware, listAlumniStories)
    .post(
        authMiddleware,
        uploadFields([
            { name: "images", maxCount: 3 },
        ]),
        createAlumniStory
    );
router.delete("/stories/:id", authMiddleware, deleteAlumniStory);
router.get("/:id", authMiddleware, getAlumniPublicProfile);

export default router;


