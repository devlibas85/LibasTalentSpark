import {
  User,
  type UserDocument,
} from ".././../database/models/user.Models.js";

export class AuthRepository {
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await User.findOne({ email });
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return await User.findById(id).select("_id name email role isActive");
  }

  async createOrUpdateUser(
    email: string,
    updateData: Partial<UserDocument>,
  ): Promise<UserDocument> {
    return await User.findOneAndUpdate(
      { email },
      { ...updateData, email },
      { upsert: true, new: true },
    );
  }

  async updateUserByEmail(
    email: string,
    updateData: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    return await User.findOneAndUpdate({ email }, updateData, { new: true });
  }

  async updateUserById(
    id: string,
    updateData: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async incrementOtpAttempts(userId: string): Promise<void> {
    await User.updateOne({ _id: userId }, { $inc: { otpAttempts: 1 } });
  }

  async verifyOtpAndClear(userId: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      {
        $unset: {
          otp: 1,
          otpExpiresAt: 1,
        },
        $set: {
          isOtpVerified: true,
          otpAttempts: 0,
        },
      },
    );
  }

  async saveUser(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }
}
