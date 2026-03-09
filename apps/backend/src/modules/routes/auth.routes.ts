import express, { type Request, type Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

import { env } from "../../config/env.js";
import { User, type UserDocument } from "../models/user.Models.js";
import { sendEmail } from "../../config/sendEmail.js";

const router = express.Router();

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

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
/* Utility: Generate JWT */
/* ────────────────────────────────────────────── */

const generateToken = (user: UserDocument) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: "8h" },
  );
};

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000,
  });
};

/* ────────────────────────────────────────────── */
/* MICROSOFT SSO */
/* ────────────────────────────────────────────── */

router.get("/microsoft", passport.authenticate("azuread-openidconnect"));

router.get(
  "/microsoft/callback",
  (req, res, next) => {
    passport.authenticate(
      "azuread-openidconnect",
      (err: any, user: Express.User | undefined) => {
        if (err || !user) {
          console.error("❌ Passport error:", err);
          return res.redirect("/auth/failed");
        }
        req.user = user;
        next();
      },
    )(req, res, next);
  },
  async (req, res) => {
    try {
      const profile: any = req.user;
      const raw = profile._json || profile;

      const email =
        raw.preferred_username || raw.email || raw.upn || raw.unique_name;

      const name = raw.name || raw.displayName || "Unknown User";

      const providerId = raw.oid || raw.sub || profile.id || email;

      if (!email) {
        return res.redirect("/auth/failed");
      }

      const dbUser = await User.findOneAndUpdate(
        { email },
        {
          email,
          name,
          provider: "microsoft",
          providerId,
          lastLoginAt: new Date(),
        },
        { upsert: true, new: true },
      );

      const token = generateToken(dbUser);
      setAuthCookie(res, token);
      return res.redirect(`${env.frontendUrl}/dashboard`);
    } catch (error) {
      console.error("❌ Auth callback failed:", error);
      res.redirect("/auth/failed");
    }
  },
);

/* ────────────────────────────────────────────── */
/* SEND OTP */
/* ────────────────────────────────────────────── */

router.post("/send-otp", otpLimiter, async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(otp);
    const hashedOtp = await bcrypt.hash(otp, 10);

    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      {
        email,
        provider: "email",
        otp: hashedOtp,
        otpExpiresAt: expiry,
        otpAttempts: 0,
        isOtpVerified: false,
      },
      { upsert: true, new: true },
    );

    await sendEmail(
      email,
      "Your OTP Code",
      `<h2>Your OTP is: ${otp}</h2><p>Valid for ${OTP_EXPIRY_MINUTES} minutes.</p>`,
    );
    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ────────────────────────────────────────────── */
/* VERIFY OTP */
/* ────────────────────────────────────────────── */

router.post("/verify-otp", otpLimiter, async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(400).json({ message: "Invalid OTP request" });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        message: "Too many failed attempts. Request new OTP.",
      });
    }
    const isValid = await bcrypt.compare(otp, user.otp);

    if (!isValid) {
      await User.updateOne({ _id: user._id }, { $inc: { otpAttempts: 1 } });
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $unset: {
          otp: 1,
          otpExpiresAt: 1,
        },
        $set: {
          isOtpVerified: true,
          otpAttempts: 0,
        },
      },
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

/* ────────────────────────────────────────────── */
/* REGISTER (after OTP verified) */
/* ────────────────────────────────────────────── */

router.post("/register", async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password, name } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({
        message: "OTP verification required",
      });
    }

    if (user.password) {
      return res.status(400).json({ message: "User already registered" });
    }

    user.password = password;
    user.name = name || "User";
    user.provider = "email";
    user.isOtpVerified = false;
    user.lastLoginAt = new Date();

    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

/* ────────────────────────────────────────────── */
/* LOGIN */
/* ────────────────────────────────────────────── */

router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.provider !== "email") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ────────────────────────────────────────────── */

router.get("/failed", (_req: Request, res: Response) => {
  res.status(401).json({
    success: false,
    message: "Microsoft login failed",
  });
});
/* ────────────────────────────────────────────── */
/* GET /auth/me — rehydrate session from cookie   */
/* ────────────────────────────────────────────── */

router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.id).select(
      "_id name email role isActive",
    );

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return res.status(401).json({ success: false, message: "Token expired" });
  }
});

/* ────────────────────────────────────────────── */
/* POST /auth/logout — clear the cookie           */
/* ────────────────────────────────────────────── */

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
