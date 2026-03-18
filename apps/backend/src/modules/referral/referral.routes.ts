import express from "express";
import { ReferralController } from "./referrral.controller.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { uploadResume } from "../middlewares/upload.middleware.js";

const router = express.Router();
const controller = new ReferralController();

// POST /api/referrals — Employee submits referral
router.post(
  "/",
  requireAuth,
  uploadResume.single("resume"),
  controller.createReferral,
);

// GET /api/referrals — All referrals (HR/Admin dashboard)
router.get("/", requireAuth, controller.getAllReferrals);

// GET /api/referrals/my-referrals — Current user's referrals
// ⚠️ Must be ABOVE /:id routes or Express will treat "my-referrals" as an id
router.get("/my-referrals", requireAuth, controller.getMyReferrals);

// POST /api/referrals/:id/actions — HR actions
router.post("/:id/actions", requireAuth, controller.updateReferralStatus);

export default router;
