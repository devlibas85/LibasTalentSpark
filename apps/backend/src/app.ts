import express, { type Request, type Response, type NextFunction, type ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes.js";
import healthRouter from "./modules/health/health.route.js";
import jobRouter from "./modules/job/jobs.routes.js";
import referralRouter from "./modules/referral/referral.routes.js";
import profileRouter from "./modules/profile/profile.routes.js";
import { env } from "./config/env.js";

export const app = express();

/* ================= SECURITY HEADERS ================= */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow static file serving across origins
  }),
);

/* ================= COMPRESSION ================= */

app.use(compression());

/* ================= HTTP ACCESS LOGGING ================= */

app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

/* ================= REQUEST ID ================= */

app.use((req: Request, _res: Response, next: NextFunction) => {
  req.headers["x-request-id"] ??= crypto.randomUUID();
  next();
});

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:7777",
  "http://localhost:5555",
  "https://libas-talent-spark.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // In production, block requests with no origin (Postman/curl)
      if (!origin) {
        if (env.nodeEnv === "production") {
          return callback(new Error("Origin required in production"));
        }
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  }),
);

/* ================= BODY ================= */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* ================= COOKIES ================= */

app.use(cookieParser());

/* ================= STATIC ================= */

// Upload middleware saves files to <cwd>/uploads/ — serve from the same directory
const uploadsPath = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

/* ================= SESSION ================= */

app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);

/* ================= PASSPORT ================= */

app.use(passport.initialize());
app.use(passport.session());

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRouter);
app.use("/api/profile", profileRouter);
app.use("/api/referrals", referralRouter);
app.use("/health", healthRouter);

/* ================= FALLBACK HEALTH ================= */

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "LibasTalentSpark API" });
});

/* ================= GLOBAL ERROR HANDLER ================= */

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status: number = typeof err.status === "number" ? err.status : 500;
  const message: string = err.message || "Internal Server Error";

  if (env.nodeEnv !== "production") {
    console.error("🔥 Error:", err);
  }

  res.status(status).json({ success: false, message });
};

app.use(errorHandler);

export default app;
