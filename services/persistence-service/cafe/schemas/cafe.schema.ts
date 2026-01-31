import { Schema, model } from "mongoose";
import { CafeStatus } from "../../../dto-service/modules.export";

export interface CafeDetails {
  _id?: string;
  ownerId: string;
  name: string;
  address: string;
  city: string;
  googleReviewLink?: string;
  status: CafeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const cafeSchema = new Schema<CafeDetails>(
  {
    ownerId: {
      type: String,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    googleReviewLink: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CafeStatus),
      required: true,
      default: CafeStatus.ACTIVE,
    },
  },
  { timestamps: true }
);

// Indexes
cafeSchema.index({ ownerId: 1 });
cafeSchema.index({ status: 1 });
cafeSchema.index({ city: 1 });
cafeSchema.index({ ownerId: 1, status: 1 });

export const CafeModel = model<CafeDetails>("Cafe", cafeSchema);
