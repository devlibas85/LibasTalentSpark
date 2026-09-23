import {
  User,
  type UserDocument,
} from "../../database/models/user.Models.js";

export class AuthRepository {
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await User.findOne({ email });
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return await User.findById(id).select("_id name email role isActive");
  }

  /**
   * Upsert by email. `insertOnly` fields are applied ONLY when the document is
   * created, which is how required schema paths (e.g. `name`) get seeded
   * without clobbering a real value on an existing user. findOneAndUpdate does
   * not run validators, so anything the schema requires must be set here or a
   * later document.save() will fail on it.
   */
  async createOrUpdateUser(
    email: string,
    updateData: Partial<UserDocument>,
    insertOnly: Partial<UserDocument> = {},
  ): Promise<UserDocument> {
    return await User.findOneAndUpdate(
      { email },
      { $set: { ...updateData, email }, $setOnInsert: insertOnly },
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
