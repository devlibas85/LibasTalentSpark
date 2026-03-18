import { ReferralRepository } from "./referral.repository.js";
import type {
  CreateReferralDTO,
  UpdateReferralStatusDTO,
  IReferral,
  ReferralQueryParams,
} from "./referral.interface.js";
import { triggerAIAsync } from "../middlewares/aiServices.js";

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
      // If not admin/hr, only return user's own referrals
      if (userRole && !["admin", "hr"].includes(userRole) && userId) {
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
