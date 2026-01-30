import { Schema, model } from "mongoose";
import { UserStatus } from "../../../dto-service/modules.export";

export interface UserDetails {
  _id?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  status: UserStatus;
  mobile?: string;
  platform: string;
  createdBy?: number;
  createdAt: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<UserDetails>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      required: true,
      default: UserStatus.ACTIVE,
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
    },
    platform: {
      type: String,
      required: true,
      lowercase: true,
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
userSchema.index({ mobile: 1, platform: 1 }, { sparse: true, unique: true });
userSchema.index({ status: 1 });

export const UserModel = model<UserDetails>("User", userSchema);