import { type Request, type Response } from "express";
import { ProfileService } from "./profile.service.js";
import type { IUpdateProfileData } from "./profile.types.js";

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: No user ID found",
        });
        return;
      }

      const { user, isProfileComplete } =
        await this.profileService.getProfile(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id.toString(),
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          department: user.department,
          position: user.position,
          joinDate: user.joinDate,
          website: user.website,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          isProfileComplete,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: No user ID found",
        });
        return;
      }

      const {
        name,
        phone,
        location,
        department,
        position,
        joinDate,
        website,
        bio,
      } = req.body;

      const requiredFields = [
        "phone",
        "location",
        "department",
        "position",
      ] as const;

      const missingFields = requiredFields.filter((field) => {
        const value = req.body[field];
        return !value || typeof value !== "string" || value.trim().length === 0;
      });

      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
        return;
      }

      const profileData: IUpdateProfileData = {
        name,
        phone,
        location,
        department,
        position,
        joinDate,
        website,
        bio,
      };

      const { user: updatedUser, isProfileComplete } =
        await this.profileService.updateProfile(userId, profileData, req.user);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Profile saved successfully",
        data: {
          id: updatedUser._id.toString(),
          userId: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          location: updatedUser.location,
          department: updatedUser.department,
          position: updatedUser.position,
          joinDate: updatedUser.joinDate,
          website: updatedUser.website,
          bio: updatedUser.bio,
          avatarUrl: updatedUser.avatarUrl,
          isProfileComplete,
        },
      });
    } catch (error: any) {
      console.error("❌ Error saving profile:", error);

      if (error.name === "ValidationError") {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
        return;
      }

      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: "Duplicate key error",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: No user ID found",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      const updatedUser = await this.profileService.updateAvatar(
        userId,
        req.file.filename,
      );

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: { avatarUrl },
      });
    } catch (error) {
      console.error("❌ Error uploading avatar:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
