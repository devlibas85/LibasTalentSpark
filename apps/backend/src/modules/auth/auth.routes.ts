import express from "express";
import rateLimit from "express-rate-limit";

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

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { message: "Too many OTP requests. Try later." },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

/* ────────────────────────────────────────────── */
/* Microsoft SSO Routes */
/* ────────────────────────────────────────────── */

router.get("/microsoft", microsoftAuth);
router.get("/microsoft/callback", microsoftCallbackHandler, microsoftCallback);

/* ────────────────────────────────────────────── */
/* OTP Routes */
/* ────────────────────────────────────────────── */

router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);

/* ────────────────────────────────────────────── */
/* Email/Password Routes */
/* ────────────────────────────────────────────── */

router.post("/register", register);
router.post("/login", loginLimiter, login);

/* ────────────────────────────────────────────── */
/* Session Routes */
/* ────────────────────────────────────────────── */

router.get("/me", getCurrentUser);
router.post("/logout", logout);

/* ────────────────────────────────────────────── */
/* Error Routes */
/* ────────────────────────────────────────────── */

router.get("/failed", authFailed);

export default router;
