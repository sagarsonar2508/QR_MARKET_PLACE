import { Schema, model } from "mongoose";
import { OrderStatus, PaymentStatus } from "../../../dto-service/modules.export";

export interface OrderDetails {
  _id?: string;
  userId: string;
  productId: string;
  qrCodeId: string;
  amount: number;
  quantity: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  printProviderOrderId?: string;
  trackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<OrderDetails>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    productId: {
      type: String,
      required: true,
      ref: "Product",
    },
    qrCodeId: {
      type: String,
      required: true,
      ref: "QRCode",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      default: PaymentStatus.PENDING,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
      default: OrderStatus.CREATED,
    },
    printProviderOrderId: {
      type: String,
      required: false,
    },
    trackingUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });

export const OrderModel = model<OrderDetails>("Order", orderSchema);
