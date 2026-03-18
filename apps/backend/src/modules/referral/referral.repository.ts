import { Referral } from "../models/referral.Models.js";
import { Types } from "mongoose";
import type {
  IReferral,
  CreateReferralDTO,
  UpdateReferralStatusDTO,
  ReferralQueryParams,
} from "./referral.interface.js";

export class ReferralRepository {
  async create(referralData: CreateReferralDTO): Promise<IReferral> {
    console.log("🔍 referralData:", {
      jobId: referralData.jobId,
      userId: referralData.userId,
      jobIdType: typeof referralData.jobId,
      userIdType: typeof referralData.userId,
    });
    const referral = await Referral.create({
      candidateName: referralData.candidateName,
      candidateEmail: referralData.candidateEmail,
      candidatePhone: referralData.candidatePhone,
      relationship: referralData.relationship,
      notes: referralData.notes || null,
      job: new Types.ObjectId(referralData.jobId.toString()),
      referredBy: new Types.ObjectId(referralData.userId.toString()),
      resume: referralData.resumePath,
      actionHistory: [
        {
          action: "submitted",
          actionBy: new Types.ObjectId(referralData.userId),
        },
      ],
    });
    return referral as unknown as IReferral; // Type assertion
  }

  async findById(id: string): Promise<IReferral | null> {
    const referral = await Referral.findById(id);
    return referral as unknown as IReferral | null;
  }

  async findAll(queryParams: ReferralQueryParams = {}): Promise<IReferral[]> {
    const query: any = { deleted: queryParams.deleted ?? false };

    if (queryParams.referredBy) {
      query.referredBy = new Types.ObjectId(queryParams.referredBy);
    }
    if (queryParams.job) {
      query.job = new Types.ObjectId(queryParams.job);
    }
    if (queryParams.status) {
      query.status = queryParams.status;
    }

    const referrals = await Referral.find(query)
      .populate("job", "title location")
      .populate("referredBy", "name email")
      .populate("actionHistory.actionBy", "name email")
      .sort({ createdAt: -1 });

    return referrals as unknown as IReferral[];
  }

  async findByUser(userId: string): Promise<IReferral[]> {
    const referrals = await Referral.find({
      referredBy: new Types.ObjectId(userId),
      deleted: false,
    })
      .populate("job", "title  location")
      .sort({ createdAt: -1 });

    return referrals as unknown as IReferral[];
  }

  async updateStatus(
    id: string,
    updateData: UpdateReferralStatusDTO,
  ): Promise<IReferral | null> {
    const referral = await Referral.findById(id);
    if (!referral) return null;

    let newStatus = referral.status;
    switch (updateData.action) {
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

    referral.status = newStatus;
    referral.actionHistory.push({
      action: updateData.action,
      actionBy: new Types.ObjectId(updateData.userId),
      actionAt: new Date(),
      remarks: updateData.remarks || null,
    });

    await referral.save();

    const updatedReferral = await Referral.findById(id)
      .populate("job", "title  department")
      .populate("referredBy", "name email")
      .populate("actionHistory.actionBy", "name email");

    return updatedReferral as unknown as IReferral | null;
  }

  async updateAIEvaluation(
    id: string,
    aiEvaluation: any,
  ): Promise<IReferral | null> {
    const referral = await Referral.findByIdAndUpdate(
      id,
      {
        aiEvaluation: {
          ...aiEvaluation,
          evaluatedAt: new Date(),
        },
      },
      { new: true },
    );
    return referral as unknown as IReferral | null;
  }

  async softDelete(id: string, deletedBy: string): Promise<IReferral | null> {
    const referral = await Referral.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: new Types.ObjectId(deletedBy),
      },
      { new: true },
    );
    return referral as unknown as IReferral | null;
  }
}
