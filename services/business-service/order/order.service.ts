import type { CreateOrderRequestData } from "../../dto-service/modules.export";
import { PaymentStatus } from "../../dto-service/modules.export";
import {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  updateOrder,
  updatePaymentStatus,
} from "../../persistence-service/order/modules.export";
import { getProductById } from "../../persistence-service/product/modules.export";
import { getQRCodeById } from "../../persistence-service/qrcode/modules.export";
import { AppError } from "../../helper-service/AppError";

export const createOrderService = async (
  data: CreateOrderRequestData,
  userId: string
) => {
  // Verify product exists
  const product = await getProductById(data.productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Verify QR code exists
  const qrcode = await getQRCodeById(data.qrCodeId);
  if (!qrcode) {
    throw new AppError("QR Code not found", 404);
  }

  const quantity = data.quantity || 1;
  const amount = product.basePrice * quantity;

  return await createOrder({
    ...data,
    userId,
    amount,
    quantity,
  });
};

export const getOrderByIdService = async (orderId: string, userId: string) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  if (order.userId !== userId) {
    throw new AppError("Unauthorized to view this order", 403);
  }
  return order;
};

export const getUserOrdersService = async (userId: string) => {
  return await getOrdersByUserId(userId);
};

export const updateOrderPaymentStatusService = async (
  orderId: string,
  paymentStatus: PaymentStatus
) => {
  return await updatePaymentStatus(orderId, paymentStatus);
};
