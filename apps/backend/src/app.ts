import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";

import authRoutes from "./modules/routes/auth.routes.js";
import healthRouter from "./modules/health/health.route.js";
import jobRouter from "./modules/routes/jobs.routes.js"
export const app = express();

// ===== CORS =====
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ===== BODY PARSER =====
app.use(express.json());

// ===== SESSION =====
app.use(
  session({
    secret: process.env.SESSION_SECRET || "libas-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== ROUTES =====
app.use("/auth", authRoutes);
app.use("/health", healthRouter);

// 🔥 JOB ROUTES (CORRECT PATH)
app.use("/api/jobs", jobRouter);

export default app;
