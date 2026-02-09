# QR Code T-Shirt Store - Complete Implementation Guide

## Overview

The application has been restructured to implement a shirt design + QR code customization store. Customers can:
1. Browse shirt designs with various colors and sizes
2. Create custom QR codes (text or URL)
3. Preview their design
4. Checkout (sign in required)
5. Payment & order management
6. Automatic Printify integration for printing and shipping

## Architecture Changes

### Backend (Node.js/Express/TypeScript)

#### Database Schema Updates

**Product Schema** (`services/persistence-service/product/schemas/product.schema.ts`)
- Added `productType` field: "shirt" | "other"
- Added `shirtDesigns` array with color, size, and mockup image
- Added `description` and `thumbnailUrl` fields

**Order Schema** (`services/persistence-service/order/schemas/order.schema.ts`)
- Added shipping address object with full contact details
- Added `shirtColor`, `shirtSize`, `shirtMockupUrl` fields
- Shipping address is now required with proper validation

#### API Endpoints

**Products** (Public - No Auth Required)
- `GET /products` - Get all shirt designs
- `GET /products/:id` - Get specific product with all variants

**QR Codes** (Auth Required)
- `POST /qrcodes` - Create new QR code
- `GET /qrcodes` - Get user's QR codes
- `PUT /qrcodes/:id` - Update QR code
- `DELETE /qrcodes/:id` - Delete QR code

**Orders** (Auth Required)
- `POST /orders` - Create order with shipping details
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details

**Payment** (Auth Required)
- `POST /payments/initiate` - Initiate payment
- `POST /payments/verify` - Verify payment

#### Authentication Flow

**Optional Authentication** (`middlewares/authenticate.ts`)
- Added `optionalAuth` middleware for public browsing
- Users can browse products without login
- Authentication required only for:
  - Creating QR codes
  - Creating orders
  - Accessing dashboard

#### Printify Integration (DEPRECATED)

**MIGRATION NOTICE:** Printify has been replaced with Shopify + Qikink integration.

The legacy Printify service (`services/helper-service/print-provider.service.ts`) is deprecated but kept for backward compatibility. New implementations must use:
- `shopify.service.ts` for order creation and checkout
- `qikink.service.ts` for fulfillment and tracking
- `shopify-webhook.handler.ts` for Shopify webhooks
- `qikink-webhook.handler.ts` for Qikink webhooks

**Legacy Printify Environment Variables** (Deprecated)
```
PRINTIFY_API_KEY=your_api_key (DEPRECATED)
PRINTIFY_SHOP_ID=your_shop_id (DEPRECATED)
```

#### Shopify Integration (`services/helper-service/shopify.service.ts`)

**New Methods:**
```typescript
getShopifyProduct(handle) // Get product by handle
createOrGetShopifyCustomer(email, firstName, lastName, phone) // Manage customers
createShopifyCheckout(variantIds, quantities, customerId) // Create checkout
getShopifyOrder(orderId) // Get order details
createShopifyFulfillment(orderId, lineItemIds, trackingInfo) // Fulfill order
cancelShopifyOrder(orderId, reason) // Cancel order
```

**Environment Variables Required:**
```
SHOPIFY_STORE_URL=https://your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_api_access_token
SHOPIFY_API_VERSION=2024-04
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
SHOPIFY_PRODUCT_VARIANT_ID=gid://shopify/ProductVariant/123456
```

#### Qikink Integration (`services/helper-service/qikink.service.ts`)

**New Methods:**
```typescript
getQikinkOrderStatus(orderId) // Get manufacturing and shipping status
createQikinkOrder(shopifyOrderId, products, shippingAddress) // Submit order
syncShopifyOrderToQikink(shopifyOrder) // Sync Shopify order to Qikink
cancelQikinkOrder(orderId, reason) // Cancel manufacturing
getQikinkProducts() // Get available products/SKUs
verifyQikinkWebhookSignature(payload, signature) // Verify webhook signature
```

**Environment Variables Required:**
```
QIKINK_API_BASE=https://api.qikink.com/v1
QIKINK_API_KEY=your_qikink_api_key
QIKINK_MERCHANT_ID=your_qikink_merchant_id
QIKINK_WEBHOOK_SECRET=your_qikink_webhook_secret
```

#### Webhook Flow

**Old Flow (Deprecated):**
```
Order → Printify → Printify Webhook → Order Status
```

**New Flow:**
```
Order → Shopify Webhook → DB Update → Qikink Sync
        ↓
    Qikink Webhook → DB Update + Email Notification
        ↓
    Shopify Fulfillment → Order Shipped
```

### Frontend (Next.js/React)

#### New Pages

1. **Home Page** (`src/app/page.tsx`)
   - Shirt gallery with product cards
   - Color indicators
   - Price display
   - "Customize & Design QR" CTA button
   - Sign up/Login prompts for non-authenticated users

2. **Customize Page** (`src/app/shop/customize/page.tsx`)
   - Product details
   - Color selection
   - Size selection (XS-XXL)
   - QR code type selection (URL/Text)
   - QR code text input
   - QR code generation
   - Live preview with shirt mockup
   - Proceed to checkout button

3. **Checkout Page** (`src/app/checkout/page.tsx`)
   - Order summary with preview
   - Shipping address form with all fields
   - Validation
   - Creates QR code in database
   - Creates order with Printify details
   - Redirects to payment

4. **Payment Page** (`src/app/payment/page.tsx`)
   - Order summary
   - Payment form (card details)
   - Shipping address display
   - Payment processing
   - Redirect to confirmation

5. **Order Confirmation Page** (`src/app/order-confirmation/page.tsx`)
   - Success message
   - Order details
   - Shipping address
   - Tracking information
   - Next steps guide
   - Links to dashboard and shop

#### User Flow

```
Home Page (Browse)
    ↓
Select Shirt (no auth required)
    ↓
Customize Page (design QR)
    ↓
Proceed to Checkout (triggers login if needed)
    ↓
Checkout Page (enter shipping)
    ↓
Payment Page (card details)
    ↓
Order Confirmation
    ↓
Dashboard (track order)
```

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd QR_MARKET
npm install
```

2. **Environment Variables** (Add to `.env`)
```
# Server
PORT=3002
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Shopify Configuration
SHOPIFY_STORE_URL=https://your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_api_access_token
SHOPIFY_API_VERSION=2024-04
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
SHOPIFY_PRODUCT_VARIANT_ID=gid://shopify/ProductVariant/123456

# Qikink Configuration
QIKINK_API_BASE=https://api.qikink.com/v1
QIKINK_API_KEY=your_qikink_api_key
QIKINK_MERCHANT_ID=your_qikink_merchant_id
QIKINK_WEBHOOK_SECRET=your_qikink_webhook_secret

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Payment (Legacy - for backward compatibility)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
```

3. **Database Seeding** (Optional - Create sample products)
```bash
# Create sample shirt products in database
npm run seed  # (if you have this script)
```

4. **Start Development Server**
```bash
npm run dev
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd QR_MARKET_FE
npm install
```

2. **Environment Variables** (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_APP_NAME=QR Market
```

3. **Install QR Code Library**
```bash
npm install qrcode
```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## Sample Product Creation

Create sample products in your database:

```typescript
// Product 1: Black Shirt
{
  name: "Classic Black T-Shirt",
  description: "Premium quality black cotton t-shirt",
  basePrice: 29.99,
  printProviderId: "printify_123",
  productType: "shirt",
  thumbnailUrl: "https://...",
  shirtDesigns: [
    {
      colorCode: "#000000",
      colorName: "Black",
      size: "M",
      mockupImageUrl: "https://..."
    },
    {
      colorCode: "#FFFFFF",
      colorName: "White",
      size: "M",
      mockupImageUrl: "https://..."
    }
  ]
}

// Product 2: Blue Shirt
{
  name: "Premium Blue Polo",
  description: "Classic blue polo shirt",
  basePrice: 34.99,
  printProviderId: "printify_456",
  productType: "shirt",
  thumbnailUrl: "https://...",
  shirtDesigns: [
    {
      colorCode: "#0066FF",
      colorName: "Royal Blue",
      size: "M",
      mockupImageUrl: "https://..."
    }
  ]
}
```

## Key Features

### 1. **No Auth Required for Browsing**
- Customers can browse all shirt designs
- Can view product details
- Can customize QR codes without login
- Only requires auth at checkout

### 2. **QR Code Customization**
- Text-based QR codes
- URL/Link-based QR codes
- Real-time QR code generation
- Preview on shirt mockup

### 3. **Automated Printify Integration**
- Orders automatically sync to Printify
- Shipping address included in order
- Track order status and tracking URL
- Order cancellation support

### 4. **Responsive Design**
- Mobile-friendly product gallery
- Responsive checkout form
- Mobile payment form
- Touch-friendly size/color selection

### 5. **Order Management**
- Order history
- Order tracking
- Order details
- Shipping information

## API Request/Response Examples

### Get All Products
```bash
GET /products
Response:
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Classic Black T-Shirt",
      "basePrice": 29.99,
      "shirtDesigns": [...]
    }
  ]
}
```

### Create QR Code
```bash
POST /qrcodes
Header: Authorization: Bearer {token}
Body:
{
  "type": "url",
  "destinationUrl": "https://example.com"
}
Response:
{
  "success": true,
  "data": {
    "_id": "qrcode_id",
    "slug": "abc123def456",
    "qrCodeImageUrl": "..."
  }
}
```

### Create Order
```bash
POST /orders
Header: Authorization: Bearer {token}
Body:
{
  "productId": "product_id",
  "qrCodeId": "qrcode_id",
  "shirtColor": "#000000",
  "shirtSize": "M",
  "shirtMockupUrl": "https://...",
  "quantity": 1,
  "shippingAddress": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  }
}
Response:
{
  "success": true,
  "data": {
    "_id": "order_id",
    "orderStatus": "created",
    "paymentStatus": "pending"
  }
}
```

## Testing Workflow

1. **Open Home Page**
   - Browse shirt designs
   - View colors and pricing

2. **Select a Shirt**
   - Click "Customize & Design QR"
   - Choose color and size

3. **Create QR Code**
   - Enter text or URL
   - Generate QR code
   - Preview on shirt

4. **Proceed to Checkout**
   - Redirect to login if not authenticated
   - Fill shipping address
   - Validate form

5. **Payment**
   - Enter payment details
   - Process payment
   - Confirm order

6. **Confirmation**
   - View order details
   - Check tracking info
   - View next steps

## Environment Variables Reference

### Backend (.env)
- `PORT` - Server port (default: 3002)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET_KEY` - JWT signing key
- `PRINTIFY_API_KEY` - Printify API key
- `PRINTIFY_SHOP_ID` - Printify shop ID
- `EMAIL_SERVICE` - Email provider (gmail/etc)
- `EMAIL_USER` - Email user
- `EMAIL_PASSWORD` - Email password

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_NAME` - App name for display

## Troubleshooting

### QR Code Not Generating
- Ensure `qrcode` npm package is installed
- Check browser console for errors
- Verify text/URL is not empty

### Authentication Issues
- Check JWT_SECRET_KEY matches
- Verify token in localStorage
- Check Authorization header format: `Bearer {token}`

### Printify Integration Not Working
- Verify API key and shop ID
- Check Printify account is active
- Ensure product IDs match Printify

### Checkout Page Not Working
- Clear session storage: `sessionStorage.clear()`
- Ensure user is authenticated
- Check customization data is saved

## Future Enhancements

1. **Payment Integration**
   - Stripe/PayPal integration
   - Real payment processing
   - Invoice generation

2. **Analytics**
   - Track popular designs
   - QR code scan statistics
   - Order conversion metrics

3. **Design Gallery**
   - Pre-made QR code designs
   - Logo placement options
   - Design templates

4. **Bulk Orders**
   - Multiple shirt orders
   - Custom pricing
   - Team orders

5. **Admin Dashboard**
   - Product management
   - Order management
   - Analytics dashboard
   - Printify sync monitoring

## File Structure Summary

```
Backend Changes:
- schemas/product.schema.ts (updated)
- schemas/order.schema.ts (updated)
- controllers/order.controller.ts (updated)
- controllers/qrcode.controller.ts (updated)
- middlewares/authenticate.ts (added optionalAuth)
- services/helper-service/print-provider.service.ts (enhanced)

Frontend Changes:
- src/app/page.tsx (new home with gallery)
- src/app/shop/customize/page.tsx (new)
- src/app/checkout/page.tsx (new)
- src/app/payment/page.tsx (new)
- src/app/order-confirmation/page.tsx (new)
```

## Support & Debugging

For issues:
1. Check browser console for errors
2. Check backend logs: `npm run dev`
3. Verify database connection
4. Check environment variables
5. Clear browser cache and session storage

---

**Last Updated**: January 31, 2026
**Version**: 2.0.0 - Shirt + QR Code Store
