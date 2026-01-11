import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { applyJob, createJob, deleteJob, listJobs } from "./jobs.controller.js";

const router = Router();

router.get("/", authMiddleware, listJobs);
router.post("/", authMiddleware, createJob);
router.post("/:id/apply", authMiddleware, applyJob);
router.delete("/:id", authMiddleware, deleteJob);

export default router;
