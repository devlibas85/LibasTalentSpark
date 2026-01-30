import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import path from "path";

import authRoutes from "./modules/routes/auth.routes.js";
import healthRouter from "./modules/health/health.route.js";
import jobRouter from "./modules/routes/jobs.routes.js";
import referralRouter from "./modules/routes/referral.routes.js";

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

// ===== STATIC FILES (REQUIRED)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src", "uploads"))
);

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
app.use("/api/jobs", jobRouter);

//  ADD THIS
app.use("/api/referrals", referralRouter);

export default app;
