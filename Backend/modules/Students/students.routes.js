import { Router } from "express";
import { registerStudent, verifyStudentEmail, loginStudent, getStudentProfile, updateStudentProfile } from "./students.controller.js";
import { logout } from "../../shared/auth/auth.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { upload } from "../../shared/middlewares/upload.middleware.js";

const router = Router();

router.post("/register", registerStudent);
router.post("/verify-email", verifyStudentEmail);
router.post("/login", loginStudent);
router.post("/logout", logout);

router.route("/profile")
    .get(authMiddleware, getStudentProfile)
    .patch(authMiddleware, upload.single('profileImage'), updateStudentProfile);

export default router;