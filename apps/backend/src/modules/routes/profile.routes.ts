import express, { type Request, type Response } from "express";
import { User } from "../models/user.Models.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { uploadAvatar } from "../../modules/middlewares/upload.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

/**
 * Get user profile
 * GET /api/profile
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found",
      });
    }

    const user = await User.findById(userId).select("-providerId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requiredFields = ["phone", "location", "department", "position"] as const;
    const isProfileComplete = requiredFields.every((field) => {
      const value = user[field];
      return typeof value === "string" && value.trim().length > 0;
    });

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
});

/**
 * Shared profile update handler
 * Used by PUT and POST
 */
const updateProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found",
      });
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

    const requiredFields = ["phone", "location", "department", "position"] as const;

    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return !value || typeof value !== "string" || value.trim().length === 0;
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const updateData = {
      name: typeof name === "string" ? name.trim() : req.user?.name,
      phone: phone.trim(),
      location: location.trim(),
      department: department.trim(),
      position: position.trim(),
      joinDate: typeof joinDate === "string" ? joinDate.trim() : "",
      website: typeof website === "string" ? website.trim() : "",
      bio: typeof bio === "string" ? bio.trim() : "",
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isProfileComplete = requiredFields.every((field) => {
      const value = updatedUser[field];
      return typeof value === "string" && value.trim().length > 0;
    });

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
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate key error",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update profile
 * PUT /api/profile
 */
router.put("/", updateProfileHandler);

/**
 * Update profile (alias)
 * POST /api/profile
 */
router.post("/", updateProfileHandler);

/**
 * Upload avatar
 * POST /api/profile/avatar
 */
router.post(
  "/avatar",
  uploadAvatar.single("avatar"),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user ID found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatarUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

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
  }
);

export default router;
