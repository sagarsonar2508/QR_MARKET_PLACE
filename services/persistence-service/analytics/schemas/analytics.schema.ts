import { Schema, model } from "mongoose";

export interface AnalyticsDetails {
  _id?: string;
  qrCodeId: string;
  ip: string;
  userAgent: string;
  city: string;
  createdAt: Date;
}

const analyticsSchema = new Schema<AnalyticsDetails>(
  {
    qrCodeId: {
      type: String,
      required: true,
      ref: "QRCode",
      index: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      default: "unknown",
    },
  },
  { timestamps: true }
);

// Indexes
analyticsSchema.index({ qrCodeId: 1, createdAt: -1 });
analyticsSchema.index({ ip: 1 });
analyticsSchema.index({ city: 1 });

export const AnalyticsModel = model<AnalyticsDetails>("Analytics", analyticsSchema);
