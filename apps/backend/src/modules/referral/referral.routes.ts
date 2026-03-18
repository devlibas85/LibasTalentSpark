import express from "express";
import { ReferralController } from "./referral.controller.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { uploadResume } from "../middlewares/upload.middleware.js";

const router = express.Router();
const referralController = new ReferralController();

/**
 * POST /api/referrals
 * Employee submits referral
 */
router.post(
  "/",
  requireAuth,
  uploadResume.single("resume"),
  referralController.createReferral,
);

/**
 * GET /api/referrals
 * Get ALL referrals (for HR/Admin dashboard)
 */
router.get("/", requireAuth, referralController.getAllReferrals);

/**
 * GET /api/referrals/my-referrals
 * Employee dashboard - get current user's referrals
 */
router.get("/my-referrals", requireAuth, referralController.getMyReferrals);

/**
 * GET /api/referrals/:id
 * Get single referral by ID
 */
router.get("/:id", requireAuth, referralController.getReferralById);

/**
 * POST /api/referrals/:id/actions
 * Add action to referral (HR actions)
 */
router.post(
  "/:id/actions",
  requireAuth,
  referralController.updateReferralStatus,
);

export default router;
