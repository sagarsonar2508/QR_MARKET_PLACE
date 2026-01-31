import { Schema, model } from "mongoose";
import { UserStatus } from "../../../dto-service/modules.export";

export type AuthProvider = "EMAIL" | "GOOGLE";

export interface UserDetails {
  _id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  platform: string;
  authProvider: AuthProvider;
  googleId?: string;
  isEmailVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  createdBy?: number;
  createdAt: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<UserDetails>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      required: true,
      default: UserStatus.ACTIVE,
    },
    platform: {
      type: String,
      required: true,
      lowercase: true,
    },
    authProvider: {
      type: String,
      enum: ["EMAIL", "GOOGLE"],
      required: true,
      default: "EMAIL",
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    otp: {
      type: String,
      required: false,
    },
    otpExpiry: {
      type: Date,
      required: false,
    },
    createdBy: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

// Compound indexes
userSchema.index({ email: 1, platform: 1 }, { unique: true });
userSchema.index({ otp: 1 }, { sparse: true });
userSchema.index({ status: 1 });

export const UserModel = model<UserDetails>("User", userSchema);