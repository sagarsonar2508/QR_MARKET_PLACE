import { Schema, model } from "mongoose";
import { PaymentProvider } from "../../../dto-service/payment/modules.export";
import { PaymentStatus } from "../../../dto-service/order/modules.export";

export interface PaymentDetails {
  _id?: string;
  orderId: string;
  provider: PaymentProvider;
  amount: number;
  status: PaymentStatus;
  providerPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDetails>(
  {
    orderId: {
      type: String,
      required: true,
      ref: "Order",
      unique: true,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      default: PaymentStatus.PENDING,
    },
    providerPaymentId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ status: 1 });
paymentSchema.index({ provider: 1 });

export const PaymentModel = model<PaymentDetails>("Payment", paymentSchema);
