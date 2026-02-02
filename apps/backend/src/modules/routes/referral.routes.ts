import express, { type Request } from "express";
import { Referral } from "../models/referral.Models.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { uploadResume } from "../middlewares/upload.middleware.js";
import { triggerAIAsync } from "../middlewares/aiServices.js";

const router = express.Router();

/**
 * POST /api/referrals
 * Employee submits referral
 */
router.post(
  "/",
  requireAuth,
  uploadResume.single("resume"),
  async (req: any, res) => {
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      relationship,
      notes,
      jobId,
    } = req.body;

    //  Create referral immediately
    const referral = await Referral.create({
      candidateName,
      candidateEmail,
      candidatePhone,
      relationship,
      notes,
      job: jobId,
      referredBy: req.user._id,
      resume: req.file.path,
      actionHistory: [
        {
          action: "submitted",
          actionBy: req.user._id,
        },
      ],
    });

    
    res.status(201).json(referral);

    //   AI call runs AFTER response
    setImmediate(() => {
  triggerAIAsync({
    referralId: referral._id.toString(),
    jobId,
    resumePath: req.file.path,
  });
});

  }
);


/**
 * GET /api/referrals
 * Get ALL referrals (for HR/Admin dashboard)
 * This is what your frontend is calling with useGetAllReferralsQuery()
 */
router.get("/", requireAuth, async (req: Request, res) => {
  try {
    // Optional: Add role check if only HR/Admin should see all referrals
    // if (req.user.role !== "admin" && req.user.role !== "hr") {
    //   return res.status(403).json({ error: "Forbidden" });
    // }
    
    const referrals = await Referral.find({ deleted: false })
      .populate("job", "title location")
      .populate("referredBy", "name email")
       .populate("actionHistory.actionBy", "name email")
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (error) {
    console.error("❌ Failed to fetch all referrals:", error);
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
});

/**
 * GET /api/referrals/my-referrals
 * Employee dashboard - get current user's referrals
 */
router.get("/my-referrals", requireAuth, async (req: Request, res) => {
  try {
    const referrals = await Referral.find({
      referredBy: req.user!._id,
      deleted: false,
    })
      .populate("job", "title department location")
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (error) {
    console.error("❌ Failed to fetch user referrals:", error);
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
}

);
// Add action to referral (HR actions)
router.post("/:id/actions", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;
    const userId = req.user._id;

    // Validate action
    const validActions = [
      "reviewed",
      "interview_scheduled", 
      "rejected",
      "hired",
    ];

    if (!validActions.includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ error: "Referral not found" });
    }

    // Determine new status based on action
    let newStatus = referral.status;
    switch (action) {
      case "reviewed":
        newStatus = "under_review";
        break;
      case "interview_scheduled":
        newStatus = "interview_scheduled";
        break;
      case "rejected":
        newStatus = "rejected";
        break;
      case "hired":
        newStatus = "hired";
        break;
    }

    // Update referral
    referral.status = newStatus;
    referral.actionHistory.push({
      action,
      actionBy: userId,
      actionAt: new Date(),
      remarks,
    });

    await referral.save();

    // Populate for response
    const updatedReferral = await Referral.findById(id)
      .populate("job", "title location department")
      .populate("referredBy", "name email")
      .populate("actionHistory.actionBy", "name email");

    res.json(updatedReferral);
  } catch (error) {
    console.error("❌ Failed to update referral:", error);
    res.status(500).json({ error: "Failed to update referral" });
  }
});

export default router;