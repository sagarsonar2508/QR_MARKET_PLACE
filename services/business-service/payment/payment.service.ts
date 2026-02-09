import crypto from "crypto";
import type { CreatePaymentRequestData, VerifyPaymentRequestData } from "../../dto-service/modules.export";
import { PaymentStatus } from "../../dto-service/order/modules.export";
import {
  createPayment,
  getPaymentByOrderId,
  updatePaymentStatus,
  updatePaymentByOrderId,
} from "../../persistence-service/payment/modules.export";
import { getOrderById, updatePaymentStatus as updateOrderPaymentStatus, updateOrder } from "../../persistence-service/order/modules.export";
import { createOrGetShopifyCustomer, createShopifyCheckout } from "../../helper-service/shopify.service";
import { AppError } from "../../helper-service/AppError";

export const initiatePaymentService = async (data: CreatePaymentRequestData) => {
  // Verify order exists
  const order = await getOrderById(data.orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  try {
    // Create or get Shopify customer
    const shippingAddress = order.shippingAddress;
    const nameParts = shippingAddress.fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const customer = await createOrGetShopifyCustomer(
      shippingAddress.email,
      firstName,
      lastName,
      shippingAddress.phone
    );

    // Create Shopify checkout
    // For now, using a placeholder variant ID - in production, map from your products to Shopify
    const variantId = process.env.SHOPIFY_PRODUCT_VARIANT_ID || "default_variant";
    const checkout = await createShopifyCheckout([variantId], [order.quantity || 1], customer.id);

    // Create or update payment record
    let payment = await getPaymentByOrderId(data.orderId);
    if (!payment) {
      payment = await createPayment(data);
    }

    // Update order with Shopify customer ID
    await updateOrder(data.orderId, {
      shopifyCustomerId: customer.id,
    });

    return {
      paymentId: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      provider: payment.provider,
      shopifyCheckoutUrl: checkout.webUrl,
      shopifyCheckoutToken: checkout.token,
      // Return the checkout URL to redirect the user
      redirectUrl: checkout.webUrl,
    };
  } catch (error) {
    console.error("Error initiating Shopify payment:", error);
    throw error;
  }
};

export const verifyPaymentService = async (data: VerifyPaymentRequestData) => {
  const payment = await getPaymentByOrderId(data.orderId);
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  // In production, verify with Shopify webhook signature
  // For now, verify with Razorpay if using hybrid approach
  if (payment.provider === "RAZORPAY" && data.signature) {
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
  // Handle Razorpay webhook for non-Shopify payments
  if (data.event === "payment.authorized" || data.event === "payment.captured") {
    const providerPaymentId = data.payload?.payment?.entity?.id;
    const amount = data.payload?.payment?.entity?.amount;
    
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
