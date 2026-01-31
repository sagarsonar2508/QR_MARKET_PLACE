import type { PaymentProvider, PaymentStatus } from "./payment.enum";

export interface CreatePaymentRequestData {
  orderId: string;
  amount: number;
  provider: PaymentProvider;
}

export interface VerifyPaymentRequestData {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface PaymentWebhookData {
  event: string;
  payment_id?: string;
  order_id?: string;
  amount?: number;
  status?: string;
}

export interface PaymentResponseData {
  _id: string;
  orderId: string;
  provider: PaymentProvider;
  amount: number;
  status: PaymentStatus;
  providerPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
