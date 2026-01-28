import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";

import authRoutes from "./modules/auth/auth.routes.js";
import healthRouter from "./modules/health/health.route.js";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());


app.use(
  session({
    secret: "libas-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax", 
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/health", healthRouter);
