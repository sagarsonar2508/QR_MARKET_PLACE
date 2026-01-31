import { PaymentModel } from "./schemas/modules.export";
import type { PaymentDetails } from "./schemas/modules.export";
import type { CreatePaymentRequestData } from "../../dto-service/modules.export";
import { PaymentStatus } from "../../dto-service/modules.export";

export const createPayment = async (data: CreatePaymentRequestData): Promise<PaymentDetails> => {
  const payment = new PaymentModel({
    ...data,
    status: PaymentStatus.PENDING,
  });
  return await payment.save();
};

export const getPaymentById = async (paymentId: string): Promise<PaymentDetails | null> => {
  return await PaymentModel.findById(paymentId);
};

export const getPaymentByOrderId = async (orderId: string): Promise<PaymentDetails | null> => {
  return await PaymentModel.findOne({ orderId });
};

export const getPaymentByProviderPaymentId = async (
  providerPaymentId: string
): Promise<PaymentDetails | null> => {
  return await PaymentModel.findOne({ providerPaymentId });
};

export const updatePayment = async (
  paymentId: string,
  updates: Partial<PaymentDetails>
): Promise<PaymentDetails | null> => {
  return await PaymentModel.findByIdAndUpdate(paymentId, updates, { new: true });
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus
): Promise<PaymentDetails | null> => {
  return await PaymentModel.findByIdAndUpdate(paymentId, { status }, { new: true });
};

export const updatePaymentByOrderId = async (
  orderId: string,
  updates: Partial<PaymentDetails>
): Promise<PaymentDetails | null> => {
  return await PaymentModel.findOneAndUpdate({ orderId }, updates, { new: true });
};
