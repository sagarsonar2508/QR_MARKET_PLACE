import { Schema, model } from "mongoose";
import { QRCodeType } from "../../../dto-service/modules.export";

export interface QRCodeDetails {
  _id?: string;
  userId: string;
  slug: string;
  type: QRCodeType;
  destinationUrl: string;
  isActive: boolean;
  expiresAt: Date | null;
  qrCodeImageUrl?: string;
  scanCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const qrcodeSchema = new Schema<QRCodeDetails>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(QRCodeType),
      required: true,
    },
    destinationUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: false,
      default: null,
    },
    qrCodeImageUrl: {
      type: String,
      required: false,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
qrcodeSchema.index({ userId: 1 });
qrcodeSchema.index({ slug: 1 });
qrcodeSchema.index({ isActive: 1 });
qrcodeSchema.index({ userId: 1, isActive: 1 });
qrcodeSchema.index({ expiresAt: 1 }, { sparse: true });

export const QRCodeModel = model<QRCodeDetails>("QRCode", qrcodeSchema);
