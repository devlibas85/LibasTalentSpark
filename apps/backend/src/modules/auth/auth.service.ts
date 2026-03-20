import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Response } from "express";

import { env } from "../../config/env.js";
import { type UserDocument } from "../../database/models/user.Models.js";
import { AuthRepository } from "./auth.repository.js";
import { sendEmail } from "../../config/sendEmail.js";
import {
  forgotOtpTemplate,
  signupOtpTemplate,
} from "../../config/email.templates.js";

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /* ────────────────────────────────────────────── */
  /* Utility Methods */
  /* ────────────────────────────────────────────── */

  generateToken(user: UserDocument): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: "8h" },
    );
  }

  setAuthCookie(res: Response, token: string): void {
    res.cookie("token", token, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });
  }

  verifyToken(token: string): { id: string; email: string; role: string } {
    return jwt.verify(token, env.jwtSecret) as {
      id: string;
      email: string;
      role: string;
    };
  }

  /* ────────────────────────────────────────────── */
  /* Microsoft SSO Methods */
  /* ────────────────────────────────────────────── */

  async handleMicrosoftAuth(
    profile: any,
  ): Promise<{ user: UserDocument; token: string }> {
    const raw = profile._json || profile;
    const email =
      raw.preferred_username || raw.email || raw.upn || raw.unique_name;
    const name = raw.name || raw.displayName || "Unknown User";
    const providerId = raw.oid || raw.sub || profile.id || email;

    if (!email) {
      throw new Error("Email not found in Microsoft profile");
    }

    const user = await this.authRepository.createOrUpdateUser(email, {
      email,
      name,
      provider: "microsoft",
      providerId,
      lastLoginAt: new Date(),
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  /* ────────────────────────────────────────────── */
  /* OTP Methods */
  /* ────────────────────────────────────────────── */
  private getNameFromEmail(email: string): string {
    const [username = ""] = email.split("@");

    const cleaned = username
      .replace(/[0-9]/g, "")
      .replace(/[._-]/g, " ")
      .trim();

    if (!cleaned) return "User";

    return cleaned
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  async generateAndSendOtp(
    email: string,
    purpose: "signup" | "forgot",
  ): Promise<void> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.authRepository.createOrUpdateUser(email, {
      email,
      provider: "email",
      otp: hashedOtp,
      otpExpiresAt: expiry,
      otpAttempts: 0,
      isOtpVerified: false,
    });

    if (purpose === "signup") {
      const name = this.getNameFromEmail(email);
      await sendEmail(
        email,
        "Signup OTP - Libas TalentSpark",
        signupOtpTemplate(name, otp, OTP_EXPIRY_MINUTES),
      );
    }

    if (purpose === "forgot") {
      await sendEmail(
        email,
        "Reset Password OTP - Libas TalentSpark",
        forgotOtpTemplate(otp, OTP_EXPIRY_MINUTES),
      );
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || !user.otp) {
      throw new Error("Invalid OTP request");
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new Error("OTP expired");
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      throw new Error("Too many failed attempts. Request new OTP.");
    }

    const isValid = await bcrypt.compare(otp, user.otp);

    if (!isValid) {
      await this.authRepository.incrementOtpAttempts(user._id.toString());
      throw new Error("Incorrect OTP");
    }

    await this.authRepository.verifyOtpAndClear(user._id.toString());
    return true;
  }

  /* ────────────────────────────────────────────── */
  /* Registration Method */
  /* ────────────────────────────────────────────── */

  async registerUser(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: UserDocument; token: string }> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || !user.isOtpVerified) {
      throw new Error("OTP verification required");
    }

    if (user.password) {
      throw new Error("User already registered");
    }

    user.password = password;
    user.name = name || "User";
    user.provider = "email";
    user.isOtpVerified = false;
    user.lastLoginAt = new Date();

    const savedUser = await this.authRepository.saveUser(user);
    const token = this.generateToken(savedUser);

    return { user: savedUser, token };
  }

  /* ────────────────────────────────────────────── */
  /* Login Method */
  /* ────────────────────────────────────────────── */

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ user: UserDocument; token: string }> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || user.provider !== "email") {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account disabled");
    }

    user.lastLoginAt = new Date();
    const updatedUser = await this.authRepository.saveUser(user);
    const token = this.generateToken(updatedUser);

    return { user: updatedUser, token };
  }

  /* ────────────────────────────────────────────── */
  /* Session Methods */
  /* ────────────────────────────────────────────── */

  async getCurrentUser(token: string): Promise<UserDocument | null> {
    const decoded = this.verifyToken(token);
    const user = await this.authRepository.findUserById(decoded.id);

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }
  /* ────────────────────────────────────────────── */
  /* Reset Password Method */
  /* ────────────────────────────────────────────── */

  async resetPassword(
    email: string,
    otp: string,
    password: string,
  ): Promise<void> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || !user.otp) {
      throw new Error("Invalid OTP request");
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new Error("OTP expired");
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      throw new Error("Too many failed attempts. Request new OTP.");
    }

    const isValid = await bcrypt.compare(otp, user.otp);

    if (!isValid) {
      await this.authRepository.incrementOtpAttempts(user._id.toString());
      throw new Error("Incorrect OTP");
    }

    // OTP is valid — update password and clear OTP fields
    user.password = password;
    user.isOtpVerified = false;
    user.otpAttempts = 0;
    delete user.otp;
    delete user.otpExpiresAt;

    await this.authRepository.saveUser(user);
  }
}
