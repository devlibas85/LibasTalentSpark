import { User, type UserDocument } from "../models/user.Models.js";

export class UserRepository {
  async findById(
    userId: string,
    select?: string,
  ): Promise<UserDocument | null> {
    return await User.findById(userId).select(select || "");
  }

  async findByIdAndUpdate(
    userId: string,
    updateData: Partial<UserDocument>,
    options: { new?: boolean; runValidators?: boolean } = {},
  ): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async updateAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
  }
}
