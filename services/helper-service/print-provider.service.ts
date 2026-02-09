// DEPRECATED: This file is deprecated. Use shopify.service.ts and qikink.service.ts instead.
// This file is kept for backward compatibility only.
// New implementations should use:
// - shopify.service.ts for order creation and checkout
// - qikink.service.ts for fulfillment
// - shopify-webhook.handler.ts for Shopify webhooks
// - qikink-webhook.handler.ts for Qikink webhooks

import { AppError } from "./AppError";

export interface PrintifyShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PrintifyLineItem {
  productId: number; // Printify product ID
  variantId: number; // Printify variant ID (for color/size)
  quantity: number;
  fileUrl: string; // URL to QR code or design
}

export interface PrintOrder {
  id: string;
  externalId: string;
  printifyOrderId?: string;
  productId: number;
  quantity: number;
  status: string;
  trackingUrl?: string;
  shippingAddress?: PrintifyShippingAddress;
}

const PRINTIFY_API_BASE = "https://api.printify.com/v1";
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;

const getPrintifyHeaders = () => ({
  Authorization: `Bearer ${PRINTIFY_API_KEY}`,
  "Content-Type": "application/json",
});

/**
 * Create a print order with Printify
 * @param orderId - Database order ID
 * @param lineItems - Items to print (with variants for color/size)
 * @param shippingAddress - Delivery address
 * @returns Print order details
 */
export const createPrintifyOrder = async (
  orderId: string,
  lineItems: PrintifyLineItem[],
  shippingAddress: PrintifyShippingAddress
): Promise<PrintOrder> => {
  try {
    if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
      throw new AppError("Printify configuration missing", 500);
    }

    const requestBody = {
      external_order_id: orderId,
      line_items: lineItems.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        files: [
          {
            type: "design",
            url: item.fileUrl,
          },
        ],
      })),
      shipping_address: {
        first_name: shippingAddress.fullName.split(" ")[0],
        last_name: shippingAddress.fullName.split(" ").slice(1).join(" "),
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address1: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      shipping_method: 1, // Standard shipping
      send_shipping_notification: true,
    };

    const response = await fetch(
      `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/orders`,
      {
        method: "POST",
        headers: getPrintifyHeaders(),
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(`Printify API error: ${errorData.message}`, response.status);
    }

    const data = await response.json();

    return {
      id: `print-${Date.now()}`,
      externalId: orderId,
      printifyOrderId: data.id,
      productId: lineItems[0]?.productId || 0,
      quantity: lineItems.reduce((sum, item) => sum + item.quantity, 0),
      status: data.status || "pending",
      trackingUrl: data.shipments?.[0]?.tracking_url,
      shippingAddress,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error creating Printify order:", error);
    throw new AppError("Failed to create print order", 500);
  }
};

/**
 * Get Printify order status
 * @param printifyOrderId - Printify order ID
 * @returns Print order status
 */
export const getPrintifyOrderStatus = async (printifyOrderId: string): Promise<PrintOrder> => {
  try {
    if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
      throw new AppError("Printify configuration missing", 500);
    }

    const response = await fetch(
      `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/orders/${printifyOrderId}`,
      {
        method: "GET",
        headers: getPrintifyHeaders(),
      }
    );

    if (!response.ok) {
      throw new AppError(`Printify API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    return {
      id: data.id,
      externalId: data.external_order_id,
      printifyOrderId: data.id,
      productId: data.line_items?.[0]?.product_id || 0,
      quantity: data.line_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
      status: data.status || "pending",
      trackingUrl: data.shipments?.[0]?.tracking_url,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error getting Printify order status:", error);
    throw new AppError("Failed to fetch order status", 500);
  }
};

/**
 * Cancel a Printify order
 * @param printifyOrderId - Printify order ID
 */
export const cancelPrintifyOrder = async (printifyOrderId: string): Promise<void> => {
  try {
    if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
      throw new AppError("Printify configuration missing", 500);
    }

    const response = await fetch(
      `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/orders/${printifyOrderId}/cancel`,
      {
        method: "POST",
        headers: getPrintifyHeaders(),
      }
    );

    if (!response.ok) {
      throw new AppError(`Printify API error: ${response.statusText}`, response.status);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error canceling Printify order:", error);
    throw new AppError("Failed to cancel order", 500);
  }
};

/**
 * Get available Printify products and variants
 */
export const getPrintifyProducts = async () => {
  try {
    if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
      throw new AppError("Printify configuration missing", 500);
    }

    const response = await fetch(
      `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products`,
      {
        method: "GET",
        headers: getPrintifyHeaders(),
      }
    );

    if (!response.ok) {
      throw new AppError(`Printify API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error fetching Printify products:", error);
    throw new AppError("Failed to fetch products", 500);
  }
};

