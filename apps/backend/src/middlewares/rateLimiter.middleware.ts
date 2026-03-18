import rateLimit from "express-rate-limit";

export const authRateLimiters = {
  otp: rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: { message: "Too many OTP requests. Try later." },
  }),
  login: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many login attempts. Try later." },
  }),
  register: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: "Too many registration attempts. Try later." },
  }),
};

export const profileRateLimiters = {
  update: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many profile updates. Please try again later." },
  }),
  avatar: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: "Too many avatar uploads. Please try again later." },
  }),
};

export const jobRateLimiters = {
  create: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { error: "Too many job creations. Please try again later." },
  }),
  update: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { error: "Too many job updates. Please try again later." },
  }),
};

export const referralRateLimiters = {
  create: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
      error: "Too many referral submissions. Please try again later.",
    },
  }),
};
