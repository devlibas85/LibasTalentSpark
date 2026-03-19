import express from "express";
import { ProfileController } from "./profile.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import { uploadAvatar } from "../../middlewares/upload.middleware.js";

const router = express.Router();
const profileController = new ProfileController();

// Apply authentication middleware to all routes
router.use(requireAuth);

/**
 * Get user profile
 * GET /api/profile
 */
router.get("/", profileController.getProfile);

/**
 * Update profile
 * PUT /api/profile
 */
router.put("/", profileController.updateProfile);

/**
 * Update profile (alias)
 * POST /api/profile
 */
router.post("/", profileController.updateProfile);

/**
 * Upload avatar
 * POST /api/profile/avatar
 */
router.post(
  "/avatar",
  uploadAvatar.single("avatar"),
  profileController.uploadAvatar,
);

export default router;
