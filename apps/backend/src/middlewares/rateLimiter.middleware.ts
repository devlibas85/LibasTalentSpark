import rateLimit from "express-rate-limit";

// Shared config: send IETF RateLimit-* headers, suppress legacy X-RateLimit-* headers
const base = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const authRateLimiters = {
  otp: rateLimit({
    ...base,
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many OTP requests. Try later." },
  }),
  login: rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many login attempts. Try later." },
  }),
  register: rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many registration attempts. Try later." },
  }),
};

export const profileRateLimiters = {
  update: rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many profile updates. Please try again later." },
  }),
  avatar: rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many avatar uploads. Please try again later." },
  }),
};

export const jobRateLimiters = {
  create: rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many job creations. Please try again later." },
  }),
  update: rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { success: false, message: "Too many job updates. Please try again later." },
  }),
};

export const referralRateLimiters = {
  create: rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many referral submissions. Please try again later." },
  }),
};
