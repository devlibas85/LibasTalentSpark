import type { Request, Response } from "express";
import passport from "passport";

import { AuthService } from "./auth.service.js";

const authService = new AuthService();

/* ────────────────────────────────────────────── */
/* Microsoft SSO Controllers */
/* ────────────────────────────────────────────── */

export const microsoftAuth = passport.authenticate("azuread-openidconnect");

export const microsoftCallbackHandler = (
  req: Request,
  res: Response,
  next: Function,
) => {
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
};

export const microsoftCallback = async (req: Request, res: Response) => {
  try {
    const profile: any = req.user;
    const { user, token } = await authService.handleMicrosoftAuth(profile);

    authService.setAuthCookie(res, token);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("❌ Auth callback failed:", error);
    res.redirect("/auth/failed");
  }
};

/* ────────────────────────────────────────────── */
/* Send OTP Controller */
/* ────────────────────────────────────────────── */

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await authService.generateAndSendOtp(email);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ────────────────────────────────────────────── */
/* Verify OTP Controller */
/* ────────────────────────────────────────────── */

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    await authService.verifyOtp(email, otp);
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Verify OTP error:", error);

    if (error.message === "OTP expired") {
      return res.status(400).json({ message: "OTP expired" });
    }
    if (error.message === "Too many failed attempts. Request new OTP.") {
      return res.status(429).json({ message: error.message });
    }
    if (error.message === "Incorrect OTP") {
      return res.status(400).json({ message: "Incorrect OTP" });
    }
    if (error.message === "Invalid OTP request") {
      return res.status(400).json({ message: "Invalid OTP request" });
    }

    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ────────────────────────────────────────────── */
/* Register Controller */
/* ────────────────────────────────────────────── */

export const register = async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password, name } = req.body;

    const { user, token } = await authService.registerUser(
      email,
      password,
      name,
    );

    authService.setAuthCookie(res, token);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.message === "OTP verification required") {
      return res.status(400).json({ message: "OTP verification required" });
    }
    if (error.message === "User already registered") {
      return res.status(400).json({ message: "User already registered" });
    }

    res.status(500).json({ message: "Registration failed" });
  }
};

/* ────────────────────────────────────────────── */
/* Login Controller */
/* ────────────────────────────────────────────── */

export const login = async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    const { user, token } = await authService.loginUser(email, password);

    authService.setAuthCookie(res, token);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);

    if (error.message === "Invalid credentials") {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (error.message === "Account disabled") {
      return res.status(403).json({ message: "Account disabled" });
    }

    res.status(500).json({ message: "Login failed" });
  }
};

/* ────────────────────────────────────────────── */
/* Get Current User Controller */
/* ────────────────────────────────────────────── */

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await authService.getCurrentUser(token);

    if (!user) {
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
};

/* ────────────────────────────────────────────── */
/* Logout Controller */
/* ────────────────────────────────────────────── */

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp, password } = req.body;
    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ message: "Email, OTP and Password required" });
    }
    await authService.resetPassword(email, otp, password);

    return res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);

    if (error.message === "OTP expired") {
      return res.status(400).json({ message: "OTP expired" });
    }
    if (error.message === "Incorrect OTP") {
      return res.status(400).json({ message: "Incorrect OTP" });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(500).json({ message: "Password reset failed" });
  }
};

/* ────────────────────────────────────────────── */
/* Failed Auth Controller */
/* ────────────────────────────────────────────── */

export const authFailed = (_req: Request, res: Response) => {
  res.status(401).json({
    success: false,
    message: "Microsoft login failed",
  });
};
