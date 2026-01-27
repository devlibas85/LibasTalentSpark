import express from 'express';
import cors from 'cors';
import  healthRouter  from "../src/modules/health/health.route.js"
import passport from "passport";
// import "./modules/auth/microsoft.strategy.js";
import authRoutes from "./modules/auth/auth.routes.js";

export const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

// app.use(passport.initialize());
app.use("/auth", authRoutes);

app.use('/health',healthRouter);
