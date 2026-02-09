// Qikink fulfillment integration service
// Qikink is integrated with Shopify for fulfillment and shipping
import { AppError } from "./AppError";

export interface QikinkOrder {
  id: string;
  shopifyOrderId: string;
  status: "received" | "processing" | "manufacturing" | "quality_check" | "dispatched" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  shippingCarrier?: string;
}

export interface QikinkProduct {
  sku: string;
  name: string;
  quantity: number;
  customizations?: Record<string, string>;
}

export interface QikinkShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const QIKINK_API_BASE = process.env.QIKINK_API_BASE || "https://api.qikink.com/v1";
const QIKINK_API_KEY = process.env.QIKINK_API_KEY || "";
const QIKINK_MERCHANT_ID = process.env.QIKINK_MERCHANT_ID || "";

const getQikinkHeaders = () => ({
  Authorization: `Bearer ${QIKINK_API_KEY}`,
  "Content-Type": "application/json",
  "X-Merchant-ID": QIKINK_MERCHANT_ID,
});

/**
 * Verify Qikink webhook signature
 * @param payload - Webhook payload
 * @param signature - Webhook signature header
 * @returns Boolean indicating if signature is valid
 */
export const verifyQikinkWebhookSignature = (payload: string, signature: string): boolean => {
  try {
    if (!QIKINK_API_KEY) {
      console.warn("QIKINK_API_KEY not configured");
      return false;
    }

    // Qikink uses HMAC-SHA256 signature verification
    // This is a placeholder implementation - check Qikink docs for actual method
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", QIKINK_API_KEY)
      .update(payload)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Error verifying Qikink webhook signature:", error);
    return false;
  }
};

/**
 * Get order status from Qikink
 * @param qikinkOrderId - Qikink order ID
 * @returns Order status and details
 */
export const getQikinkOrderStatus = async (qikinkOrderId: string): Promise<QikinkOrder> => {
  try {
    if (!QIKINK_API_KEY || !QIKINK_MERCHANT_ID) {
      throw new AppError("Qikink configuration missing", 500);
    }

    const response = await fetch(`${QIKINK_API_BASE}/orders/${qikinkOrderId}`, {
      method: "GET",
      headers: getQikinkHeaders(),
    });

    if (!response.ok) {
      throw new AppError(`Qikink API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      id: data.id,
      shopifyOrderId: data.external_reference_id || data.shopify_order_id,
      status: data.status,
      trackingNumber: data.tracking_number,
      estimatedDeliveryDate: data.estimated_delivery_date,
      shippingCarrier: data.shipping_carrier,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error fetching Qikink order status:", error);
    throw new AppError("Failed to fetch Qikink order status", 500);
  }
};

/**
 * Create an order with Qikink
 * Note: When using Shopify + Qikink integration, orders are created automatically
 * This function is for direct Qikink orders or force-syncing
 * @param shopifyOrderId - Shopify order ID
 * @param products - Products to be manufactured
 * @param shippingAddress - Shipping address
 * @returns Qikink order details
 */
export const createQikinkOrder = async (
  shopifyOrderId: string,
  products: QikinkProduct[],
  shippingAddress: QikinkShippingAddress
): Promise<QikinkOrder> => {
  try {
    if (!QIKINK_API_KEY || !QIKINK_MERCHANT_ID) {
      throw new AppError("Qikink configuration missing", 500);
    }

    const requestBody = {
      external_reference_id: shopifyOrderId,
      shopify_order_id: shopifyOrderId,
      products: products.map((p) => ({
        sku: p.sku,
        name: p.name,
        quantity: p.quantity,
        customizations: p.customizations,
      })),
      shipping_address: {
        full_name: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        street_address: shippingAddress.street,
        apartment: shippingAddress.apartment,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      notifications: {
        order_created: true,
        order_processing: true,
        order_manufacturing: true,
        order_shipping: true,
        order_delivered: true,
      },
    };

    const response = await fetch(`${QIKINK_API_BASE}/orders`, {
      method: "POST",
      headers: getQikinkHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(`Qikink API error: ${errorData.message || "Failed to create order"}`, response.status);
    }

    const data = await response.json();

    return {
      id: data.id,
      shopifyOrderId: data.external_reference_id,
      status: data.status,
      trackingNumber: data.tracking_number,
      estimatedDeliveryDate: data.estimated_delivery_date,
      shippingCarrier: data.shipping_carrier,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error creating Qikink order:", error);
    throw new AppError("Failed to create Qikink order", 500);
  }
};

/**
 * Cancel a Qikink order
 * @param qikinkOrderId - Qikink order ID
 * @param reason - Cancellation reason
 */
export const cancelQikinkOrder = async (
  qikinkOrderId: string,
  reason: string = "Customer request"
): Promise<void> => {
  try {
    if (!QIKINK_API_KEY || !QIKINK_MERCHANT_ID) {
      throw new AppError("Qikink configuration missing", 500);
    }

    const response = await fetch(`${QIKINK_API_BASE}/orders/${qikinkOrderId}/cancel`, {
      method: "POST",
      headers: getQikinkHeaders(),
      body: JSON.stringify({
        reason,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(`Qikink API error: ${errorData.message || "Failed to cancel order"}`, response.status);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error canceling Qikink order:", error);
    throw new AppError("Failed to cancel Qikink order", 500);
  }
};

/**
 * Get available Qikink products and SKUs
 */
export const getQikinkProducts = async () => {
  try {
    if (!QIKINK_API_KEY || !QIKINK_MERCHANT_ID) {
      throw new AppError("Qikink configuration missing", 500);
    }

    const response = await fetch(`${QIKINK_API_BASE}/products`, {
      method: "GET",
      headers: getQikinkHeaders(),
    });

    if (!response.ok) {
      throw new AppError(`Qikink API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error fetching Qikink products:", error);
    throw new AppError("Failed to fetch Qikink products", 500);
  }
};

/**
 * Map Shopify order to Qikink format and create order
 * This is called when Shopify order is confirmed
 * @param shopifyOrder - Order data from Shopify webhook
 */
export const syncShopifyOrderToQikink = async (shopifyOrder: any): Promise<QikinkOrder | null> => {
  try {
    // Extract products
    const products: QikinkProduct[] = shopifyOrder.line_items.map((item: any) => ({
      sku: item.sku || item.variant_id,
      name: item.title,
      quantity: item.quantity,
      customizations: item.properties ? Object.fromEntries(item.properties.map((p: any) => [p.name, p.value])) : undefined,
    }));

    // Extract shipping address
    const address = shopifyOrder.shipping_address || shopifyOrder.billing_address;
    const shippingAddress: QikinkShippingAddress = {
      fullName: `${address.first_name || ""} ${address.last_name || ""}`.trim(),
      email: shopifyOrder.email,
      phone: address.phone || "",
      street: address.address1 || "",
      apartment: address.address2,
      city: address.city || "",
      state: address.province || "",
      postalCode: address.zip || "",
      country: address.country_code || "IN",
    };

    // Create order in Qikink
    return await createQikinkOrder(shopifyOrder.id, products, shippingAddress);
  } catch (error) {
    console.error("Error syncing Shopify order to Qikink:", error);
    return null;
  }
};
