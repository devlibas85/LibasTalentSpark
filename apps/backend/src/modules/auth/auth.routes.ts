import express, { type Request, type Response, type NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

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
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "azuread-openidconnect",
      (err: unknown, user: Express.User | false | undefined) => {
        console.log("AUTH ERROR:", err);
        console.log("AUTH USER:", user);

        if (err || !user) {
          return res.redirect("/auth/failed");
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  },
  (req: Request, res: Response) => {
    const user = req.user as {
      email: string;
      name?: string;
      role: string;
    };

    const token = jwt.sign(user, env.jwtSecret, {
      expiresIn: "8h",
    });

    res.redirect(
      `${env.frontendUrl}/auth/success?token=${token}`
    );
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
