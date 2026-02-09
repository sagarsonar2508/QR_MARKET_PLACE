// Shopify Headless integration service
import { AppError } from "./AppError";

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  variants: ShopifyVariant[];
  images: { src: string }[];
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: number;
  sku: string;
  inventory_quantity: number;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface ShopifyLineItem {
  variant_id: string;
  quantity: number;
  custom_attributes?: { key: string; value: string }[];
}

export interface ShopifyCheckout {
  token: string;
  webUrl: string;
  cart_url: string;
}

export interface ShopifyOrder {
  id: string;
  order_number: number;
  email: string;
  status: string;
  fulfillment_status: string;
  financial_status: string;
  total_price: number;
  currency: string;
  line_items: any[];
  shipping_address: any;
  subtotal_price: number;
  tax_lines: any[];
  shipping_lines: any[];
}

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || "";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-04";

const getShopifyHeaders = () => ({
  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
  "Content-Type": "application/json",
});

/**
 * Get product from Shopify by handle
 * @param handle - Product handle (URL-friendly slug)
 * @returns Product details
 */
export const getShopifyProduct = async (handle: string): Promise<ShopifyProduct> => {
  try {
    if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
      throw new AppError("Shopify configuration missing", 500);
    }

    const response = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/products.json?handle=${handle}`,
      {
        method: "GET",
        headers: getShopifyHeaders(),
      }
    );

    if (!response.ok) {
      throw new AppError(`Shopify API error: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    if (!data.products || data.products.length === 0) {
      throw new AppError("Product not found in Shopify", 404);
    }

    return data.products[0];
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error fetching Shopify product:", error);
    throw new AppError("Failed to fetch product details", 500);
  }
};

/**
 * Get or create Shopify customer
 * @param email - Customer email
 * @param firstName - First name
 * @param lastName - Last name
 * @param phone - Phone number
 * @returns Customer details
 */
export const createOrGetShopifyCustomer = async (
  email: string,
  firstName: string,
  lastName: string,
  phone?: string
): Promise<ShopifyCustomer> => {
  try {
    if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
      throw new AppError("Shopify configuration missing", 500);
    }

    // First, try to find existing customer
    const searchResponse = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/customers/search.json?query=email:${encodeURIComponent(
        email
      )}`,
      {
        method: "GET",
        headers: getShopifyHeaders(),
      }
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.customers && searchData.customers.length > 0) {
        return searchData.customers[0];
      }
    }

    // Create new customer if not found
    const createResponse = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/customers.json`,
      {
        method: "POST",
        headers: getShopifyHeaders(),
        body: JSON.stringify({
          customer: {
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phone || "",
          },
        }),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new AppError(`Shopify API error: ${errorData.errors.message || "Failed to create customer"}`, createResponse.status);
    }

    const createData = await createResponse.json();
    return createData.customer;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error creating/getting Shopify customer:", error);
    throw new AppError("Failed to manage customer", 500);
  }
};

/**
 * Create Shopify checkout (Draft Order + Checkout)
 * @param variantIds - Array of Shopify variant IDs
 * @param quantities - Array of quantities matching variants
 * @param customerId - Shopify customer ID
 * @returns Checkout details with checkout URL
 */
export const createShopifyCheckout = async (
  variantIds: string[],
  quantities: number[],
  customerId: string
): Promise<ShopifyCheckout> => {
  try {
    if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
      throw new AppError("Shopify configuration missing", 500);
    }

    // Create draft order
    const lineItems = variantIds.map((variantId, index) => ({
      variant_id: variantId,
      quantity: quantities[index] || 1,
    }));

    const draftOrderResponse = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/draft_orders.json`,
      {
        method: "POST",
        headers: getShopifyHeaders(),
        body: JSON.stringify({
          draft_order: {
            line_items: lineItems,
            customer: {
              id: customerId,
            },
            use_customer_default_address: true,
          },
        }),
      }
    );

    if (!draftOrderResponse.ok) {
      const errorData = await draftOrderResponse.json();
      throw new AppError(`Shopify API error: ${errorData.errors.message || "Failed to create draft order"}`, draftOrderResponse.status);
    }

    const draftOrderData = await draftOrderResponse.json();
    const draftOrder = draftOrderData.draft_order;

    // Complete the draft order to get checkout
    const completeResponse = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/draft_orders/${draftOrder.id}/complete.json`,
      {
        method: "PUT",
        headers: getShopifyHeaders(),
        body: JSON.stringify({
          payment_pending: true,
        }),
      }
    );

    if (!completeResponse.ok) {
      const errorData = await completeResponse.json();
      throw new AppError(`Shopify API error: Failed to complete draft order`, completeResponse.status);
    }

    const completeData = await completeResponse.json();
    const order = completeData.draft_order;

    return {
      token: order.order_id?.toString() || draftOrder.id,
      webUrl: order.invoice_url || draftOrder.invoice_url || `${SHOPIFY_STORE_URL}/cart`,
      cart_url: `${SHOPIFY_STORE_URL}/cart`,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error creating Shopify checkout:", error);
    throw new AppError("Failed to create checkout", 500);
  }
};

/**
 * Get order from Shopify
 * @param orderId - Shopify order ID (e.g., "gid://shopify/Order/123")
 * @returns Order details
 */
export const getShopifyOrder = async (orderId: string): Promise<ShopifyOrder> => {
  try {
    if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
      throw new AppError("Shopify configuration missing", 500);
    }

    // Extract numeric ID if it's a gid
    let numericId = orderId;
    if (orderId.includes("gid://")) {
      numericId = orderId.split("/").pop() || orderId;
    }

    const response = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/orders/${numericId}.json`,
      {
        method: "GET",
        headers: getShopifyHeaders(),
      }
    );

    if (!response.ok) {
      throw new AppError(`Shopify API error: Order not found`, response.status);
    }

    const data = await response.json();
    return data.order;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error fetching Shopify order:", error);
    throw new AppError("Failed to fetch order from Shopify", 500);
  }
};

/**
 * Create a fulfillment request for Shopify order
 * Qikink will be triggered automatically via Shopify's fulfillment API
 * @param orderId - Shopify order ID
 * @param lineItemIds - Line item IDs to fulfill
 * @param trackingInfo - Tracking information
 */
export const createShopifyFulfillment = async (
  orderId: string,
  lineItemIds: string[],
  trackingInfo?: {
    number?: string;
    company?: string;
    url?: string;
  }
): Promise<any> => {
  try {
    if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
      throw new AppError("Shopify configuration missing", 500);
    }

    // Extract numeric ID if it's a gid
    let numericId = orderId;
    if (orderId.includes("gid://")) {
      numericId = orderId.split("/").pop() || orderId;
    }

    const fulfillmentResponse = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/orders/${numericId}/fulfillments.json`,
      {
        method: "POST",
        headers: getShopifyHeaders(),
        body: JSON.stringify({
          fulfillment: {
            line_items_by_fulfillment_order: [
              {
                fulfillment_order_line_items: lineItemIds.map((id) => ({
                  id,
                  quantity: 1,
                })),
              },
            ],
            tracking_info: trackingInfo || {},
          },
        }),
      }
    );

    if (!fulfillmentResponse.ok) {
      const errorData = await fulfillmentResponse.json();
      throw new AppError(`Shopify API error: ${errorData.errors.message || "Failed to create fulfillment"}`, fulfillmentResponse.status);
    }

    const fulfillmentData = await fulfillmentResponse.json();
    return fulfillmentData.fulfillment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error creating Shopify fulfillment:", error);
    throw new AppError("Failed to create fulfillment", 500);
  }
};

/**
 * Cancel a Shopify order
 * @param orderId - Shopify order ID
 * @param reason - Cancellation reason (customer_request, inventory, fraud, declined, other)
 */
export const cancelShopifyOrder = async (
  orderId: string,
  reason: string = "customer_request"
): Promise<void> => {
  try {
    if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
      throw new AppError("Shopify configuration missing", 500);
    }

    // Extract numeric ID if it's a gid
    let numericId = orderId;
    if (orderId.includes("gid://")) {
      numericId = orderId.split("/").pop() || orderId;
    }

    const response = await fetch(
      `${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/orders/${numericId}/cancel.json`,
      {
        method: "POST",
        headers: getShopifyHeaders(),
        body: JSON.stringify({
          cancel: {
            reason,
            restock: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(`Shopify API error: ${errorData.errors.message || "Failed to cancel order"}`, response.status);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error canceling Shopify order:", error);
    throw new AppError("Failed to cancel order", 500);
  }
};
