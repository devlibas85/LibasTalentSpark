import type { Request, Response } from "express";
import { ReferralService } from "./referral.service.js";
import type {
  CreateReferralDTO,
  UpdateReferralStatusDTO,
} from "./referral.interface.js";

export class ReferralController {
  private service: ReferralService;

  constructor() {
    this.service = new ReferralService();
  }

  createReferral = async (req: any, res: Response): Promise<void> => {
    try {
      const {
        candidateName,
        candidateEmail,
        candidatePhone,
        relationship,
        notes,
        jobId,
      } = req.body;

      if (!req.file) {
        res.status(400).json({ error: "Resume file is required" });
        return;
      }

      const referralData: CreateReferralDTO = {
        candidateName,
        candidateEmail,
        candidatePhone,
        relationship,
        notes,
        jobId,
        userId: req.user._id,
        resumePath: `uploads/resumes/${req.file.filename}`,
      };

      const referral = await this.service.createReferral(referralData);
      res.status(201).json(referral);
    } catch (error: any) {
      console.error("❌ Failed to create referral:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create referral" });
    }
  };

  getAllReferrals = async (req: Request, res: Response): Promise<void> => {
    try {
      const referrals = await this.service.getAllReferrals();
      res.json(referrals);
    } catch (error: any) {
      console.error("❌ Failed to fetch all referrals:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch referrals" });
    }
  };

  getMyReferrals = async (req: any, res: Response): Promise<void> => {
    try {
      const referrals = await this.service.getMyReferrals(req.user._id);
      res.json(referrals);
    } catch (error: any) {
      console.error("❌ Failed to fetch user referrals:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch referrals" });
    }
  };

  updateReferralStatus = async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, remarks } = req.body;

      // Validate action
      const validActions = [
        "reviewed",
        "interview_scheduled",
        "rejected",
        "hired",
      ];

      if (!validActions.includes(action)) {
        res.status(400).json({ error: "Invalid action" });
        return;
      }

      const updateData: UpdateReferralStatusDTO = {
        action,
        remarks,
        userId: req.user._id,
      };

      const updatedReferral = await this.service.updateReferralStatus(
        id,
        updateData,
      );
      res.json(updatedReferral);
    } catch (error: any) {
      console.error("❌ Failed to update referral:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to update referral" });
    }
  };
}
