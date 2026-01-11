import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "./config/passport.config.js";
import studentRoutes from "./modules/Students/students.routes.js";
import alumniRoutes from "./modules/Alumini/alumini.routes.js";
import authRoutes from "./shared/auth/auth.routes.js";
import jobRoutes from "./modules/Jobs/jobs.routes.js";

export const app = express();

app.disable("x-powered-by");

// If you deploy behind a proxy (Render/Heroku/Nginx), set this to make secure cookies work.
app.set("trust proxy", 1);

app.use(passport.initialize());

app.use(cookieParser());

const allowedOrigins = (() => {
    const defaults = ["https://gsv-connect.vercel.app"];
    const configured = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return configured.length ? configured : defaults;
})();

app.use(
    cors({
        origin: (origin, cb) => {
            // allow non-browser clients (no Origin) + same-origin
            if (!origin) return cb(null, true);
            if (allowedOrigins.includes(origin)) return cb(null, true);
            const err = new Error("CORS: origin not allowed");
            err.status = 403;
            return cb(err, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400,
    })
);

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 200,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Routes
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/alumni", alumniRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);

app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Central error handler (keeps errors JSON and avoids leaking stack traces)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    const status = err?.status || 500;
    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }
    res.status(status).json({ message: status === 500 ? "Server error" : err.message });
});