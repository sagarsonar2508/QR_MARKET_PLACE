// Utility functions for Qikink + Shopify integration
import { OrderStatus } from "../dto-service/modules.export";

/**
 * Map Shopify order status to our internal OrderStatus
 */
export const mapShopifyStatusToOrderStatus = (shopifyStatus: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    "pending": OrderStatus.CREATED,
    "unconfirmed": OrderStatus.CREATED,
    "confirmed": OrderStatus.CONFIRMED,
    "processing": OrderStatus.PROCESSING,
    "shipped": OrderStatus.SHIPPED,
    "delivered": OrderStatus.DELIVERED,
    "cancelled": OrderStatus.CANCELLED,
    "refunded": OrderStatus.CANCELLED,
  };

  return statusMap[shopifyStatus.toLowerCase()] || OrderStatus.PROCESSING;
};

/**
 * Map Qikink order status to our internal OrderStatus
 */
export const mapQikinkStatusToOrderStatus = (qikinkStatus: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    "received": OrderStatus.PROCESSING,
    "processing": OrderStatus.PROCESSING,
    "manufacturing": OrderStatus.PRINTING,
    "quality_check": OrderStatus.PRINTING,
    "dispatched": OrderStatus.READY_TO_SHIP,
    "shipped": OrderStatus.SHIPPED,
    "delivered": OrderStatus.DELIVERED,
    "cancelled": OrderStatus.CANCELLED,
  };

  return statusMap[qikinkStatus.toLowerCase()] || OrderStatus.PROCESSING;
};

/**
 * Get status display text for frontend
 */
export const getOrderStatusDisplay = (status: OrderStatus): string => {
  const displayMap: Record<OrderStatus, string> = {
    [OrderStatus.CREATED]: "Order Created",
    [OrderStatus.CONFIRMED]: "Payment Confirmed",
    [OrderStatus.PROCESSING]: "Processing",
    [OrderStatus.PRINTING]: "Manufacturing",
    [OrderStatus.READY_TO_SHIP]: "Ready to Ship",
    [OrderStatus.SHIPPED]: "Shipped",
    [OrderStatus.DELIVERED]: "Delivered",
    [OrderStatus.CANCELLED]: "Cancelled",
  };

  return displayMap[status] || "Unknown Status";
};

/**
 * Get status color for UI
 */
export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    [OrderStatus.CREATED]: "gray",
    [OrderStatus.CONFIRMED]: "blue",
    [OrderStatus.PROCESSING]: "yellow",
    [OrderStatus.PRINTING]: "orange",
    [OrderStatus.READY_TO_SHIP]: "indigo",
    [OrderStatus.SHIPPED]: "green",
    [OrderStatus.DELIVERED]: "emerald",
    [OrderStatus.CANCELLED]: "red",
  };

  return colorMap[status] || "gray";
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  const cannotCancelStatuses = [
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  return !cannotCancelStatuses.includes(status);
};

/**
 * Get estimated delivery days based on status
 */
export const getEstimatedDeliveryDays = (status: OrderStatus): number | null => {
  const estimateMap: Record<OrderStatus, number> = {
    [OrderStatus.CREATED]: 10,
    [OrderStatus.CONFIRMED]: 10,
    [OrderStatus.PROCESSING]: 7,
    [OrderStatus.PRINTING]: 5,
    [OrderStatus.READY_TO_SHIP]: 3,
    [OrderStatus.SHIPPED]: 2,
    [OrderStatus.DELIVERED]: 0,
    [OrderStatus.CANCELLED]: null as any,
  };

  return estimateMap[status] || null;
};

/**
 * Format Qikink product data for API response
 */
export const formatQikinkProduct = (product: any) => {
  return {
    id: product.id || product.sku,
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images || [],
    colors: product.colors || [],
    sizes: product.sizes || ["XS", "S", "M", "L", "XL", "XXL"],
    material: product.material,
    manufacturing_time_days: product.manufacturing_time_days || 5,
  };
};

/**
 * Build Qikink order request from our order data
 */
export const buildQikinkOrderRequest = (order: any, lineItems: any[]) => {
  return {
    external_reference_id: order._id?.toString(),
    shopify_order_id: order.shopifyOrderId,
    products: lineItems.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      customizations: {
        qr_code_url: item.qr_code_url,
        design_url: item.mockup_url || item.design_url,
      },
    })),
    shipping_address: {
      full_name: order.shippingAddress.fullName,
      email: order.shippingAddress.email,
      phone: order.shippingAddress.phone,
      street_address: order.shippingAddress.street,
      apartment: order.shippingAddress.apartment,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postal_code: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
    notifications: {
      email: true,
      sms: !!order.shippingAddress.phone,
    },
  };
};
