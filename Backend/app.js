import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import passport from "passport";
import "./config/passport.config.js";
import studentRoutes from "./modules/Students/students.routes.js";
import alumniRoutes from "./modules/Alumini/alumini.routes.js";
import authRoutes from "./shared/auth/auth.routes.js";

export const app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(cors({
    origin: true, // Allow all origins for development/testing
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/alumni", alumniRoutes);
app.use("/api/v1/auth", authRoutes);