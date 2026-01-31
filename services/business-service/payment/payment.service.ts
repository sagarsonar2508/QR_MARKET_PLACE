import crypto from "crypto";
import type { CreatePaymentRequestData, VerifyPaymentRequestData } from "../../dto-service/modules.export";
import { PaymentStatus } from "../../dto-service/order/modules.export";
import {
  createPayment,
  getPaymentByOrderId,
  updatePaymentStatus,
  updatePaymentByOrderId,
} from "../../persistence-service/payment/modules.export";
import { getOrderById, updatePaymentStatus as updateOrderPaymentStatus } from "../../persistence-service/order/modules.export";
import { AppError } from "../../helper-service/AppError";

export const initiatePaymentService = async (data: CreatePaymentRequestData) => {
  // Verify order exists
  const order = await getOrderById(data.orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Create payment record
  const payment = await createPayment(data);
  
  // In production, you would integrate with actual payment provider here
  // For now, return the payment object
  return {
    paymentId: payment._id,
    orderId: payment.orderId,
    amount: payment.amount,
    provider: payment.provider,
    // For Razorpay, you'd return order_id from Razorpay API
    // For Stripe, you'd return client_secret
  };
};

export const verifyPaymentService = async (data: VerifyPaymentRequestData) => {
  const payment = await getPaymentByOrderId(data.orderId);
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  // In production, verify with payment provider
  // For now, just update status
  if (payment.provider === "RAZORPAY" && data.signature) {
    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "")
      .update(`${data.orderId}|${data.paymentId}`)
      .digest("hex");

    if (expectedSignature !== data.signature) {
      throw new AppError("Invalid payment signature", 400);
    }
  }

  // Update payment status
  await updatePaymentStatus(payment._id!, PaymentStatus.SUCCESS);
  await updateOrderPaymentStatus(data.orderId, PaymentStatus.SUCCESS);

  return { message: "Payment verified successfully" };
};

export const handlePaymentWebhookService = async (data: any) => {
  // Handle Razorpay webhook
  if (data.event === "payment.authorized" || data.event === "payment.captured") {
    const providerPaymentId = data.payload?.payment?.entity?.id;
    const amount = data.payload?.payment?.entity?.amount;
    
    // Find order from provider payment ID
    // This is a simplified version - in production you'd look up by order reference
    const orderId = data.payload?.order?.entity?.receipt;
    
    if (orderId) {
      await updatePaymentByOrderId(orderId, {
        status: PaymentStatus.SUCCESS,
        providerPaymentId,
      });
      
      await updateOrderPaymentStatus(orderId, PaymentStatus.SUCCESS);
    }
  } else if (data.event === "payment.failed") {
    const orderId = data.payload?.order?.entity?.receipt;
    
    if (orderId) {
      await updatePaymentByOrderId(orderId, {
        status: PaymentStatus.FAILED,
      });
      
      await updateOrderPaymentStatus(orderId, PaymentStatus.FAILED);
    }
  }

  return { message: "Webhook processed successfully" };
};
