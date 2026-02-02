import mongoose, { Schema, type Types, type Document } from "mongoose";

export interface UserSchemaType {
  email: string;
  name: string;
  role: "HR" | "EMPLOYEE";
  provider: "microsoft";
  providerId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  
  // Profile fields
  phone: string;
  location: string;
  department: string;
  position: string;
  joinDate: string;
  website: string;
  bio: string;
  avatarUrl: string;
  
  // Profile status
  isProfileComplete: boolean;
}

export interface UserDocument extends UserSchemaType, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["HR", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
    provider: {
      type: String,
      enum: ["microsoft"],
      required: true,
    },
    providerId: { type: String, required: true },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true },
    
    // Profile fields
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    department: { type: String, default: "" },
    position: { type: String, default: "" },
    joinDate: { type: String, default: "" },
    website: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    
    // Profile completion status
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// Virtual for checking profile completeness
userSchema.virtual("checkProfileComplete").get(function (this: UserDocument) {
  const requiredFields = ['phone', 'location', 'department', 'position'] as const;
  return requiredFields.every(field => {
    const value = this[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
});

// Type for the pre-save middleware
type UserDocumentWithMethods = UserDocument & {
  isModified(path?: string | string[]): boolean;
};

// Middleware to update isProfileComplete before save
userSchema.pre('save', function () {
  const requiredFields = ['phone', 'location', 'department', 'position'] as const;

  const profileFieldsModified = requiredFields.some(field =>
    this.isModified(field)
  );

  if (profileFieldsModified) {
    const isComplete = requiredFields.every(field => {
      const value = this[field];
      return typeof value === 'string' && value.trim().length > 0;
    });

    this.isProfileComplete = isComplete;
  }
});


// Method to check profile completeness
userSchema.methods.checkProfileCompleteness = function(): boolean {
  const requiredFields = ['phone', 'location', 'department', 'position'] as const;
  return requiredFields.every(field => {
    const value = this[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

export const User = mongoose.model<UserDocument>("User", userSchema);