import type { OrderStatus, PaymentStatus } from "./order.enum";

export interface CreateOrderRequestData {
  productId: string;
  qrCodeId: string;
  cafeId: string;
  quantity?: number;
}

export interface OrderResponseData {
  _id: string;
  userId: string;
  cafeId: string;
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
