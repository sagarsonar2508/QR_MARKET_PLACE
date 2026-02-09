// DEPRECATED: This file is deprecated. Use shopify-webhook.handler.ts and qikink-webhook.handler.ts instead.
// This file is kept for backward compatibility only.

import { getOrderById, updateOrderStatus } from "../persistence-service/order/modules.export";
import { sendShippingNotificationEmail } from "./notification.service";
import { getUserById } from "../persistence-service/user/user.persistence.service";
import { OrderStatus } from "../dto-service/modules.export";

// Handle Printful/Printify webhooks
export const handlePrintProviderWebhook = async (data: any): Promise<void> => {
  const event = data.type;
  const printOrderId = data.data?.id;
  const externalId = data.data?.external_id; // This should be the order ID

  try {
    const order = await getOrderById(externalId);
    if (!order) {
      console.warn(`Order not found for external_id: ${externalId}`);
      return;
    }

    switch (event) {
      case "order_created":
        await updateOrderStatus(externalId, OrderStatus.PRINTING);
        break;

      case "order_shipped":
        await updateOrderStatus(externalId, OrderStatus.SHIPPED);
        
        // Send shipping notification
        const user = await getUserById(order.userId);
        if (user?.email) {
          await sendShippingNotificationEmail(user.email, {
            orderId: order._id!,
            trackingUrl: data.data?.tracking_url || "",
            trackingNumber: data.data?.tracking_number,
          });
        }
        break;

      case "order_delivered":
        await updateOrderStatus(externalId, OrderStatus.DELIVERED);
        break;

      case "order_failed":
      case "order_canceled":
        await updateOrderStatus(externalId, OrderStatus.CANCELLED);
        break;

      default:
        console.log(`Unknown event type: ${event}`);
    }
  } catch (error) {
    console.error("Error handling print provider webhook:", error);
    throw error;
  }
};
