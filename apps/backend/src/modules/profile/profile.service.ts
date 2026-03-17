import { UserRepository } from "./user.repository.js";
import type { UserDocument } from "../models/user.Models.js";
import type { IUpdateProfileData } from "./profile.types.js";

export class ProfileService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getProfile(userId: string): Promise<{
    user: UserDocument | null;
    isProfileComplete: boolean;
  }> {
    const user = await this.userRepository.findById(userId, "-providerId");

    if (!user) {
      return { user: null, isProfileComplete: false };
    }

    // Use the virtual from the model
    const isProfileComplete = user.isProfileComplete;

    return { user, isProfileComplete };
  }

  async updateProfile(
    userId: string,
    profileData: IUpdateProfileData,
    currentUser?: UserDocument,
  ): Promise<{
    user: UserDocument | null;
    isProfileComplete: boolean;
  }> {
    const {
      name,
      phone,
      location,
      department,
      position,
      joinDate,
      website,
      bio,
    } = profileData;

    // Create a properly typed update object
    const updateData: {
      name?: string;
      phone?: string;
      location?: string;
      department?: string;
      position?: string;
      website?: string;
      bio?: string;
      joinDate?: Date;
    } = {};

    // Only add fields that are provided and valid
    if (name !== undefined) {
      updateData.name = name.trim();
    }

    // Required fields (always provided from validation)
    updateData.phone = phone.trim();
    updateData.location = location.trim();
    updateData.department = department.trim();
    updateData.position = position.trim();

    // Optional fields
    if (website !== undefined) {
      updateData.website = website.trim();
    }

    if (bio !== undefined) {
      updateData.bio = bio.trim();
    }

    // Only add joinDate if it's provided and valid
    if (joinDate && typeof joinDate === "string") {
      const parsedDate = new Date(joinDate);
      if (!isNaN(parsedDate.getTime())) {
        updateData.joinDate = parsedDate;
      }
    }

    const updatedUser = await this.userRepository.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return { user: null, isProfileComplete: false };
    }

    // Use the virtual from the model
    const isProfileComplete = updatedUser.isProfileComplete;

    return { user: updatedUser, isProfileComplete };
  }

  async updateAvatar(
    userId: string,
    filename: string,
  ): Promise<UserDocument | null> {
    const avatarUrl = `/uploads/avatars/${filename}`;

    return await this.userRepository.updateAvatar(userId, avatarUrl);
  }
}
