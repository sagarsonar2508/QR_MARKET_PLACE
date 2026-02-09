import { getOrderById, updateOrder, updateOrderStatus, getOrderByQikinkOrderId } from "../persistence-service/order/modules.export";
import { sendShippingNotificationEmail } from "./notification.service";
import { getUserById } from "../persistence-service/user/user.persistence.service";
import { OrderStatus } from "../dto-service/modules.export";

/**
 * Handle Qikink fulfillment webhooks
 * Qikink sends webhooks for order status updates:
 * - order.received: Order received by Qikink
 * - order.processing: Processing order
 * - order.manufacturing: Manufacturing in progress
 * - order.quality_check: Quality check
 * - order.dispatched: Ready to ship
 * - order.shipped: Order shipped with tracking
 * - order.delivered: Order delivered
 * - order.cancelled: Order cancelled
 */
export const handleQikinkWebhook = async (data: any): Promise<void> => {
  const event = data.event || data.status;
  const qikinkOrderId = data.id;
  const shopifyOrderId = data.external_reference_id || data.shopify_order_id;

  try {
    // First try to find by Qikink order ID
    let order = await getOrderByQikinkOrderId(qikinkOrderId);
    
    // If not found but have Shopify order ID, we can look it up
    // However, we need to implement getOrderByShopifyOrderId in persistence service
    // For now, we'll just log and return

    if (!order && shopifyOrderId) {
      // TODO: Find by Shopify order ID if needed
      // This requires the getOrderByShopifyOrderId method in persistence service
      console.warn(`Order not found for Qikink order: ${qikinkOrderId}`);
      return;
    }

    if (!order) {
      console.warn(`Could not find order in database for Qikink order: ${qikinkOrderId}`);
      return;
    }

    // Update order with Qikink details
    const updates: any = {
      qikinkOrderId,
      qikinkStatus: event,
    };

    // Handle different Qikink events
    switch (event) {
      case "order.received":
        updates.orderStatus = OrderStatus.PROCESSING;
        break;

      case "order.processing":
        updates.orderStatus = OrderStatus.PROCESSING;
        break;

      case "order.manufacturing":
        updates.orderStatus = OrderStatus.PRINTING;
        break;

      case "order.quality_check":
        updates.orderStatus = OrderStatus.PRINTING;
        break;

      case "order.dispatched":
        updates.orderStatus = OrderStatus.READY_TO_SHIP;
        break;

      case "order.shipped":
        updates.orderStatus = OrderStatus.SHIPPED;
        updates.trackingNumber = data.tracking_number;
        updates.shippingCarrier = data.shipping_carrier;
        updates.trackingUrl = data.tracking_url;
        updates.estimatedDeliveryDate = data.estimated_delivery_date;

        // Send shipping notification email
        const user = await getUserById(order.userId);
        if (user?.email) {
          await sendShippingNotificationEmail(user.email, {
            orderId: order._id!,
            trackingUrl: data.tracking_url || "",
            trackingNumber: data.tracking_number,
          });
        }
        break;

      case "order.delivered":
        updates.orderStatus = OrderStatus.DELIVERED;
        break;

      case "order.cancelled":
        updates.orderStatus = OrderStatus.CANCELLED;
        break;

      default:
        console.log(`Unhandled Qikink event: ${event}`);
    }

    // Update order with new status and tracking info
    if (Object.keys(updates).length > 0) {
      await updateOrder(order._id!, updates);
    }
  } catch (error) {
    console.error("Error handling Qikink webhook:", error);
    throw error;
  }
};

/**
 * Verify Qikink webhook signature
 * @param payload - Raw request body
 * @param signature - X-Qikink-Signature header
 * @returns Boolean indicating if signature is valid
 */
export const verifyQikinkWebhookSignature = (payload: string, signature: string): boolean => {
  try {
    const crypto = require("crypto");
    const secret = process.env.QIKINK_WEBHOOK_SECRET || "";

    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");

    return hash === signature;
  } catch (error) {
    console.error("Error verifying Qikink webhook signature:", error);
    return false;
  }
};
