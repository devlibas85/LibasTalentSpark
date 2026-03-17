export interface IProfileResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  department?: string;
  position?: string;
  joinDate?: Date;
  website?: string;
  bio?: string;
  avatarUrl?: string;
  isProfileComplete: boolean;
  isActive?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdateProfileData {
  name?: string;
  phone: string;
  location: string;
  department: string;
  position: string;
  joinDate?: string;
  website?: string;
  bio?: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
