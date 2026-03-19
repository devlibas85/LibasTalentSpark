import express from "express";

import { ReferralController } from "./referral.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import {
  requireHR,
  requireEmployee,
  requireHRorEmployee,
} from "../../middlewares/role.middlewares.js";
import { referralRateLimiters } from "../../middlewares/rateLimiter.middleware.js";
import { uploadResume } from "../../middlewares/upload.middleware.js";

const router = express.Router();
const controller = new ReferralController();

// POST /api/referrals — Employee submits referral
router.post(
  "/",
  requireAuth,
  requireHRorEmployee,
  referralRateLimiters.create,
  uploadResume.single("resume"),
  controller.createReferral,
);

// GET /api/referrals/my-referrals — Employee's own referrals

router.get(
  "/my-referrals",
  requireAuth,
  requireHRorEmployee,
  controller.getMyReferrals,
);

// GET /api/referrals — All referrals (HR only)
router.get("/", requireAuth, requireHR, controller.getAllReferrals);

// GET /api/referrals/:id — Single referral
router.get("/:id", requireAuth, controller.getReferralById);

// POST /api/referrals/:id/actions — HR updates referral status
router.post(
  "/:id/actions",
  requireAuth,
  requireHR,
  controller.updateReferralStatus,
);

export default router;
