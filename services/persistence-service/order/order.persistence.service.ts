import { OrderModel } from "./schemas/modules.export";
import type { OrderDetails } from "./schemas/modules.export";
import type { CreateOrderRequestData } from "../../dto-service/modules.export";
import { PaymentStatus, OrderStatus } from "../../dto-service/modules.export";

export const createOrder = async (
  data: CreateOrderRequestData & { userId: string; amount: number; quantity: number }
): Promise<OrderDetails> => {
  const order = new OrderModel({
    ...data,
    paymentStatus: PaymentStatus.PENDING,
    orderStatus: OrderStatus.CREATED,
  });
  return await order.save();
};

export const getOrderById = async (orderId: string): Promise<OrderDetails | null> => {
  return await OrderModel.findById(orderId);
};

export const getOrdersByUserId = async (userId: string): Promise<OrderDetails[]> => {
  return await OrderModel.find({ userId }).sort({ createdAt: -1 });
};

export const getOrdersByCafeId = async (cafeId: string): Promise<OrderDetails[]> => {
  return await OrderModel.find({ cafeId }).sort({ createdAt: -1 });
};

export const updateOrder = async (
  orderId: string,
  updates: Partial<OrderDetails>
): Promise<OrderDetails | null> => {
  return await OrderModel.findByIdAndUpdate(orderId, updates, { new: true });
};

export const updateOrderStatus = async (
  orderId: string,
  orderStatus: OrderStatus
): Promise<OrderDetails | null> => {
  return await OrderModel.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<OrderDetails | null> => {
  return await OrderModel.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });
};
