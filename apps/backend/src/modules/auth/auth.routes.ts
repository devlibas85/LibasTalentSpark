import express from "express";

import {
  microsoftAuth,
  microsoftCallbackHandler,
  microsoftCallback,
  sendOtp,
  verifyOtp,
  register,
  login,
  getCurrentUser,
  logout,
  authFailed,
} from "./auth.controller.js";

import { authRateLimiters } from "../../middlewares/rateLimiter.middleware.js";
import { verifyToken } from "../../middlewares/requireAuth.middleware.js";

const router = express.Router();

/* ────────────────────────────────────────────── */
/* Microsoft SSO Routes */
/* ────────────────────────────────────────────── */

router.get("/microsoft", microsoftAuth);
router.get("/microsoft/callback", microsoftCallbackHandler, microsoftCallback);

/* ────────────────────────────────────────────── */
/* OTP Routes */
/* ────────────────────────────────────────────── */

router.post("/send-otp", authRateLimiters.otp, sendOtp);
router.post("/verify-otp", authRateLimiters.otp, verifyOtp);

/* ────────────────────────────────────────────── */
/* Email/Password Routes */
/* ────────────────────────────────────────────── */

router.post("/register", authRateLimiters.register, register);
router.post("/login", authRateLimiters.login, login);

/* ────────────────────────────────────────────── */
/* Session Routes */
/* ────────────────────────────────────────────── */

router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", logout);

/* ────────────────────────────────────────────── */
/* Error Routes */
/* ────────────────────────────────────────────── */

router.get("/failed", authFailed);

export default router;
