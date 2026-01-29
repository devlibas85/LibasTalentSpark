import express, { type Request, type Response, type NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { User } from "../models/user.Models.js";

const router = express.Router();

/**
 * Start Microsoft login
 */
router.get(
  "/microsoft",
  passport.authenticate("azuread-openidconnect")
);

/**
 * Microsoft callback
 */
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
      }
    )(req, res, next);
  },
  async (req, res) => {
    try {
   const profile: any = req.user;
const raw = profile._json || profile;

const email =
  raw.preferred_username ||
  raw.email ||
  raw.upn ||
  raw.unique_name;

const name =
  raw.name ||
  raw.displayName ||
  "Unknown User";

// ✅ ACCEPT WHAT WE GET
const providerId =
  raw.oid ||
  raw.sub ||
  profile.id ||
  email;

if (!email) {
  console.error("❌ Missing email", raw);
  return res.redirect("/auth/failed");
}

const dbUser = await User.findOneAndUpdate(
  { email },
  {
    email,
    name,
    provider: "microsoft",
    providerId, // email for now
    lastLoginAt: new Date(),
  },
  { upsert: true, new: true }
);

const token = jwt.sign(
  {
    id: dbUser._id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  },
  env.jwtSecret,
  { expiresIn: "8h" }
);

res.redirect(`${env.frontendUrl}/auth/success?token=${token}`);

    } catch (error) {
      console.error("❌ Auth callback failed:", error);
      res.redirect("/auth/failed");
    }
  }
);


/**
 * Login failed
 */
router.get("/failed", (_req: Request, res: Response) => {
  res.status(401).json({
    success: false,
    message: "Microsoft login failed",
  });
});

export default router;
