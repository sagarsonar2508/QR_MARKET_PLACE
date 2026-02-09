import type { OrderStatus, PaymentStatus } from "./order.enum";

export interface CreateOrderRequestData {
  productId: string;
  qrCodeId: string;
  quantity?: number;
}

export interface OrderResponseData {
  _id: string;
  userId: string;
  productId: string;
  qrCodeId: string;
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

export interface CreatePaymentRequestData {
  orderId: string;
  amount: number;
  provider: "RAZORPAY" | "STRIPE";
}

export interface VerifyPaymentRequestData {
  orderId: string;
  paymentId: string;
  signature: string;
}
