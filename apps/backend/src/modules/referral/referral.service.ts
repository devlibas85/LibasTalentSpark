import { ReferralRepository } from "./referral.repository.js";
import type {
  CreateReferralDTO,
  UpdateReferralStatusDTO,
  IReferral,
  ReferralQueryParams,
} from "./referral.interface.js";
import { triggerAIAsync } from "../../middlewares/aiServices.js";
import { sendEmail } from "../../config/sendEmail.js";
import {
  interviewReferrerTemplate,
  interviewScheduledTemplate,
  rejectionTemplate,
} from "../../config/email.templates.js";

export class ReferralService {
  private repository: ReferralRepository;

  constructor() {
    this.repository = new ReferralRepository();
  }

  async createReferral(data: CreateReferralDTO): Promise<IReferral> {
    try {
      const referral = await this.repository.create(data);

      // Trigger AI evaluation asynchronously
      setImmediate(() => {
        triggerAIAsync({
          referralId: referral._id.toString(),
          jobId: data.jobId,
          resumePath: data.resumePath,
        });
      });

      return referral;
    } catch (error: any) {
      throw new Error(`Failed to create referral: ${error.message}`);
    }
  }

  async getAllReferrals(
    userRole?: string,
    userId?: string,
    queryParams?: ReferralQueryParams,
  ): Promise<IReferral[]> {
    try {
      // If not HR, only return the user's own referrals
      if (userRole && !["HR", "ADMIN"].includes(userRole) && userId) {
        return await this.repository.findByUser(userId);
      }
      return await this.repository.findAll(queryParams);
    } catch (error: any) {
      throw new Error(`Failed to fetch referrals: ${error.message}`);
    }
  }

  async getMyReferrals(userId: string): Promise<IReferral[]> {
    try {
      return await this.repository.findByUser(userId);
    } catch (error: any) {
      throw new Error(`Failed to fetch user referrals: ${error.message}`);
    }
  }

  async updateReferralStatus(
    id: string,
    updateData: UpdateReferralStatusDTO,
  ): Promise<IReferral> {
    try {
      const referral = await this.repository.updateStatus(id, updateData);

      if (!referral) {
        throw new Error("Referral not found");
      }

      if (updateData.action === "interview_scheduled") {
        const completeReferral = await this.repository.findByIdWithPopulate(id);

        if (completeReferral) {
          setImmediate(() => {
            (async () => {
              try {
                const candidateEmail = completeReferral.candidateEmail;
                const candidateName = completeReferral.candidateName;
                const referrerEmail =
                  (completeReferral.referredBy as any)?.email ?? null;
                const jobTitle =
                  (completeReferral.job as any)?.title ?? "the position";
                const interviewDate = completeReferral.interviewDate
                  ? new Date(completeReferral.interviewDate).toLocaleString()
                  : undefined;

                // Send candidate email
                await sendEmail(
                  candidateEmail,
                  "Interview Scheduled – Libas TalentSpark",
                  interviewScheduledTemplate(
                    candidateName,
                    jobTitle,
                    interviewDate,
                  ),
                );

                // Send referrer email if available
                if (referrerEmail) {
                  await sendEmail(
                    referrerEmail,
                    "Candidate Interview Scheduled – Libas TalentSpark",
                    interviewReferrerTemplate(
                      candidateName,
                      jobTitle,
                      interviewDate,
                    ),
                  );
                }

                console.log("✅ Interview scheduled emails sent successfully");
              } catch (err) {
                console.error("❌ Interview email failed:", err);
              }
            })();
          });
        } else {
          console.error(
            "Could not fetch complete referral details for ID:",
            id,
          );
        }
      }

      if (updateData.action === "rejected") {
        const completeReferral = await this.repository.findByIdWithPopulate(id);

        if (completeReferral) {
          setImmediate(() => {
            (async () => {
              try {
                const candidateEmail = completeReferral.candidateEmail;
                const candidateName = completeReferral.candidateName;

                // Validate email exists
                if (!candidateEmail) {
                  console.error(
                    "❌ No candidate email found for referral:",
                    id,
                  );
                  return;
                }

                let jobTitle = "the position";
                if (
                  completeReferral.job &&
                  typeof completeReferral.job === "object" &&
                  "title" in completeReferral.job
                ) {
                  jobTitle = completeReferral.job.title as string;
                }

                const emailHtml = rejectionTemplate(candidateName, jobTitle);

                await sendEmail(
                  candidateEmail,
                  "Application Update – Libas TalentSpark",
                  emailHtml,
                );
              } catch (err) {
                console.error("❌ Rejection email failed with error:", err);
                if (err instanceof Error) {
                  console.error("Error message:", err.message);
                  console.error("Error stack:", err.stack);
                }
              }
            })();
          });
        } else {
          console.error("❌ Complete referral NOT found for ID:", id);
        }
      }
      return referral;
    } catch (error: any) {
      throw new Error(`Failed to update referral status: ${error.message}`);
    }
  }

  async getReferralById(id: string): Promise<IReferral> {
    try {
      const referral = await this.repository.findById(id);
      if (!referral) {
        throw new Error("Referral not found");
      }
      return referral;
    } catch (error: any) {
      throw new Error(`Failed to fetch referral: ${error.message}`);
    }
  }
}
