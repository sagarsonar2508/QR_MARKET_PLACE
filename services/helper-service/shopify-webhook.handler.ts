import { getOrderById, updateOrder, updateOrderStatus, getOrderByShopifyOrderId } from "../persistence-service/order/modules.export";
import { sendOrderConfirmationEmail, sendShippingNotificationEmail } from "./notification.service";
import { getUserById } from "../persistence-service/user/user.persistence.service";
import { OrderStatus, PaymentStatus } from "../dto-service/modules.export";
import { syncShopifyOrderToQikink } from "./qikink.service";

/**
 * Handle Shopify order webhooks
 * Shopify will send webhooks for:
 * - order/created: Order confirmed via Shopify checkout
 * - order/paid: Payment confirmed
 * - order/fulfilled: Order fulfilled (when Qikink ships)
 * - order/cancelled: Order cancelled
 */
export const handleShopifyWebhook = async (data: any): Promise<void> => {
  const event = data.type || data.event;
  const shopifyOrderId = data.id;

  try {
    // First try to find by Shopify order ID
    let order = await getOrderByShopifyOrderId(shopifyOrderId);
    
    // If not found, try to find by external reference or other identifiers
    if (!order && data.external_reference_id) {
      order = await getOrderById(data.external_reference_id);
    }

    if (!order) {
      console.warn(`Order not found for Shopify order: ${shopifyOrderId}`);
      return;
    }

    switch (event) {
      case "order/created":
        // Order confirmed via Shopify checkout
        await updateOrder(order._id!, {
          shopifyOrderId,
          paymentStatus: PaymentStatus.SUCCESS,
          orderStatus: OrderStatus.CONFIRMED,
        });

        // Sync order to Qikink for manufacturing
        const qikinkOrder = await syncShopifyOrderToQikink(data);
        if (qikinkOrder) {
          await updateOrder(order._id!, {
            qikinkOrderId: qikinkOrder.id,
            qikinkStatus: qikinkOrder.status,
          });
        }

        // Send confirmation email
        const user = await getUserById(order.userId);
        if (user?.email) {
          await sendOrderConfirmationEmail(user.email, {
            orderId: order._id!,
            amount: order.amount,
            productName: order.productId, // You may want to fetch product details for a better name
          });
        }
        break;

      case "order/paid":
        // Payment confirmed (redundant if integrated with checkout)
        await updateOrder(order._id!, {
          paymentStatus: PaymentStatus.SUCCESS,
        });
        break;

      case "order/fulfilled":
        // All line items fulfilled (shipped by Qikink)
        await updateOrderStatus(order._id!, OrderStatus.SHIPPED);

        const userForShipping = await getUserById(order.userId);
        if (userForShipping?.email) {
          await sendShippingNotificationEmail(userForShipping.email, {
            orderId: order._id!,
            trackingUrl: data.shipping_lines?.[0]?.tracking_url || "",
            trackingNumber: data.shipping_lines?.[0]?.tracking_number,
          });
        }
        break;

      case "order/cancelled":
        await updateOrderStatus(order._id!, OrderStatus.CANCELLED);
        break;

      case "order/refunded":
        await updateOrder(order._id!, {
          paymentStatus: PaymentStatus.REFUNDED,
          orderStatus: OrderStatus.CANCELLED,
        });
        break;

      default:
        console.log(`Unhandled Shopify event type: ${event}`);
    }
  } catch (error) {
    console.error("Error handling Shopify webhook:", error);
    throw error;
  }
};

/**
 * Verify Shopify webhook signature
 * @param payload - Raw request body
 * @param hmacHeader - X-Shopify-Hmac-SHA256 header
 * @returns Boolean indicating if signature is valid
 */
export const verifyShopifyWebhookSignature = (payload: string, hmacHeader: string): boolean => {
  try {
    const crypto = require("crypto");
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";

    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("base64");

    return hash === hmacHeader;
  } catch (error) {
    console.error("Error verifying Shopify webhook signature:", error);
    return false;
  }
};
