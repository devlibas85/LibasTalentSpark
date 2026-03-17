import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import path from "path";

import authRoutes from "./modules/auth/auth.routes.js";
import healthRouter from "./modules/health/health.route.js";
import jobRouter from "./modules/job/jobs.routes.js";
import referralRouter from "./modules/routes/referral.routes.js";
import profileRouter from "./modules/profile/profile.routes.js";

export const app = express();

// ===== CORS =====

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://172.16.21.214:4173",
  "https://libas-talent-spark.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ===== BODY PARSER =====
app.use(express.json());

// ===== COOKIE PARSER =====
app.use(cookieParser());

// ===== STATIC FILES =====
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

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
  }),
);

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/health", healthRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/profile", profileRouter);
app.use("/api/referrals", referralRouter);

export default app;
