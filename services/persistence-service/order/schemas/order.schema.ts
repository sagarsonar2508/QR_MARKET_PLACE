import { Schema, model } from "mongoose";
import { OrderStatus, PaymentStatus } from "../../../dto-service/modules.export";

export interface OrderDetails {
  _id?: string;
  userId: string;
  productId: string;
  qrCodeId: string;
  shirtColor?: string; // Shirt color code
  shirtSize?: string; // XS, S, M, L, XL, XXL
  shirtMockupUrl?: string; // URL to shirt with QR design
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  amount: number;
  quantity: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  // Shopify Integration
  shopifyOrderId?: string;
  shopifyCustomerId?: string;
  // Qikink Integration
  qikinkOrderId?: string;
  qikinkStatus?: string;
  // Fulfillment Info
  trackingUrl?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDeliveryDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

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
    shirtColor: {
      type: String,
      required: false,
    },
    shirtSize: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      required: false,
    },
    shirtMockupUrl: {
      type: String,
      required: false,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
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
    // Shopify Integration
    shopifyOrderId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    shopifyCustomerId: {
      type: String,
      required: false,
    },
    // Qikink Integration
    qikinkOrderId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    qikinkStatus: {
      type: String,
      required: false,
      enum: ["received", "processing", "manufacturing", "quality_check", "dispatched", "shipped", "delivered", "cancelled"],
    },
    // Fulfillment Info
    trackingUrl: {
      type: String,
      required: false,
    },
    trackingNumber: {
      type: String,
      required: false,
    },
    shippingCarrier: {
      type: String,
      required: false,
    },
    estimatedDeliveryDate: {
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
