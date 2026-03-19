import express from "express";

import { ProfileController } from "./profile.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import { profileRateLimiters } from "../../middlewares/rateLimiter.middleware.js";
import { uploadAvatar } from "../../middlewares/upload.middleware.js";

const router = express.Router();
const profileController = new ProfileController();

// Apply auth to all profile routes
router.use(requireAuth);

// GET /api/profile — Get user profile
router.get("/", profileController.getProfile);

// PUT /api/profile — Update profile
router.put("/", profileRateLimiters.update, profileController.updateProfile);

// POST /api/profile — Update profile (alias)
router.post("/", profileRateLimiters.update, profileController.updateProfile);

// POST /api/profile/avatar — Upload avatar
router.post(
  "/avatar",
  profileRateLimiters.avatar,
  uploadAvatar.single("avatar"),
  profileController.uploadAvatar,
);

export default router;
