import mongoose, {
  Schema,
  type Types,
  type Document,
} from "mongoose";
import bcrypt from "bcryptjs";

/* ────────────────────────────────────────────── */
/* Types */
/* ────────────────────────────────────────────── */

export interface UserSchemaType {
  email: string;
  name: string;
  role: "HR" | "EMPLOYEE";

  provider: "microsoft" | "email";
  providerId?: string;
  password?: string;

  otp?: string;
  otpExpiresAt?: Date;
  otpAttempts: number;
  isOtpVerified: boolean;

  isActive: boolean;
  lastLoginAt?: Date;

  phone: string;
  location: string;
  department: string;
  position: string;
  joinDate?: Date;
  website: string;
  bio: string;
  avatarUrl: string;

  isProfileComplete: boolean;
}

export interface UserDocument
  extends UserSchemaType,
    Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(password: string): Promise<boolean>;
}

/* ────────────────────────────────────────────── */
/* Schema */
/* ────────────────────────────────────────────── */

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    name: { type: String, required: true },

    role: {
      type: String,
      enum: ["HR", "EMPLOYEE"],
      default: "EMPLOYEE",
    },

    /* ───── AUTH FIELDS ───── */

    provider: {
      type: String,
      enum: ["microsoft", "email"],
      required: true,
    },

    providerId: {
      type: String,
      required: false, // required only for microsoft
    },

    password: {
      type: String,
      required: false, // required only for email auth
    },

    otp: { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    isOtpVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },


    /* ───── PROFILE FIELDS ───── */

    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    department: { type: String, default: "" },
    position: { type: String, default: "" },
    joinDate: { type: Date },
    website: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },

    isProfileComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ────────────────────────────────────────────── */
/* Password Hashing */
/* ────────────────────────────────────────────── */

userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ────────────────────────────────────────────── */
/* Compare Password Method */
/* ────────────────────────────────────────────── */

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/* ────────────────────────────────────────────── */
/* Hide Sensitive Fields */
/* ────────────────────────────────────────────── */

userSchema.set("toJSON", {
  transform: function (_doc, ret) {
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpiresAt;
    return ret;
  },
});

/* ────────────────────────────────────────────── */
/* Profile Completion Logic */
/* ────────────────────────────────────────────── */

userSchema.virtual("checkProfileComplete").get(function (
  this: UserDocument
) {
  const requiredFields = [
    "phone",
    "location",
    "department",
    "position",
  ] as const;

  return requiredFields.every((field) => {
    const value = this[field];
    return typeof value === "string" && value.trim().length > 0;
  });
});

userSchema.pre("save", function () {
  const requiredFields = [
    "phone",
    "location",
    "department",
    "position",
  ] as const;

  const profileFieldsModified = requiredFields.some((field) =>
    this.isModified(field)
  );

  if (profileFieldsModified) {
    const isComplete = requiredFields.every((field) => {
      const value = this[field];
      return typeof value === "string" && value.trim().length > 0;
    });

    this.isProfileComplete = isComplete;
  }
});

/* ────────────────────────────────────────────── */

export const User = mongoose.model<UserDocument>(
  "User",
  userSchema
);