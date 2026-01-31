# QR Marketplace Backend API

A complete Node.js/Express backend for a QR code marketplace where cafe owners can create custom QR codes linked to products (mugs, table stands, etc.) with integrated printing and payment solutions.

## Project Structure

```
services/
├── business-service/          # Business logic layer
│   ├── cafe/
│   ├── qrcode/
│   ├── product/
│   ├── order/
│   ├── payment/
│   ├── analytics/
│   └── user/
├── persistence-service/       # Database layer
│   ├── cafe/
│   ├── qrcode/
│   ├── product/
│   ├── order/
│   ├── payment/
│   ├── analytics/
│   └── user/
├── dto-service/              # Data Transfer Objects & Constants
│   ├── cafe/
│   ├── qrcode/
│   ├── product/
│   ├── order/
│   ├── payment/
│   ├── analytics/
│   ├── user/
│   └── constants/
└── helper-service/           # Utilities & External Services
    ├── qr-generator.ts
    ├── notification.service.ts
    ├── print-provider.service.ts
    ├── print-webhook.handler.ts
    └── ...
```

## Database Collections

### 1. Users
```typescript
{
  _id: ObjectId
  email: string
  password: string (hashed)
  firstName: string
  lastName: string
  authProvider: "EMAIL" | "GOOGLE"
  googleId?: string
  status: "ACTIVE" | "INACTIVE"
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 2. Cafes (Business Profiles)
```typescript
{
  _id: ObjectId
  ownerId: string (User ID)
  name: string
  address: string
  city: string
  googleReviewLink?: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  createdAt: Date
  updatedAt: Date
}
```

### 3. QR Codes
```typescript
{
  _id: ObjectId
  cafeId: string (Cafe ID)
  slug: string (unique identifier like "abc123")
  type: "GOOGLE_REVIEW" | "CUSTOM_URL" | "PRODUCT_LINK"
  destinationUrl: string
  isActive: boolean
  expiresAt?: Date
  qrCodeImageUrl?: string
  scanCount: number
  createdAt: Date
  updatedAt: Date
}
```

### 4. Products
```typescript
{
  _id: ObjectId
  name: string
  basePrice: number
  printProviderId: string (Printful SKU)
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 5. Orders
```typescript
{
  _id: ObjectId
  userId: string (User ID)
  cafeId: string (Cafe ID)
  productId: string (Product ID)
  qrCodeId: string (QR Code ID)
  amount: number
  quantity: number
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
  orderStatus: "CREATED" | "PRINTING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  printProviderOrderId?: string
  trackingUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### 6. Payments
```typescript
{
  _id: ObjectId
  orderId: string (Order ID)
  provider: "RAZORPAY" | "STRIPE"
  amount: number
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
  providerPaymentId?: string
  createdAt: Date
  updatedAt: Date
}
```

### 7. Analytics
```typescript
{
  _id: ObjectId
  qrCodeId: string (QR Code ID)
  ip: string
  userAgent: string
  city: string
  createdAt: Date
}
```

## API Endpoints

### Authentication (User Module)
```
POST   /user/signup/email        - Email signup (OTP sent)
POST   /user/signup/google       - Google OAuth signup
POST   /user/verify-otp          - Verify OTP
POST   /user/set-password        - Set password after OTP verification
POST   /user/login               - Login with email/password
```

### Cafes
```
POST   /cafes                    - Create cafe (requires auth)
GET    /cafes/my-cafes           - Get user's cafes (requires auth)
GET    /cafes/:id                - Get cafe details (requires auth)
PUT    /cafes/:id                - Update cafe (requires auth + ownership)
DELETE /cafes/:id                - Delete cafe (requires auth + ownership)
```

### QR Codes
```
POST   /qrcodes                  - Create QR code (requires auth)
GET    /qrcodes/:id              - Get QR code details (requires auth)
GET    /qrcodes/cafe/:cafeId     - Get all QR codes for cafe (requires auth)
PUT    /qrcodes/:id              - Update QR code (requires auth + ownership)
POST   /qrcodes/:id/rotate-link  - Change destination URL (requires auth + ownership)
POST   /qrcodes/:id/disable      - Disable QR code (requires auth + ownership)
DELETE /qrcodes/:id              - Delete QR code (requires auth + ownership)
GET    /q/:slug                  - Public redirect endpoint (no auth)
```

### Products
```
GET    /products                 - Get all active products
GET    /products/:id             - Get product details
POST   /products                 - Create product (requires auth, admin only in production)
PUT    /products/:id             - Update product (requires auth, admin only)
DELETE /products/:id             - Delete product (requires auth, admin only)
```

### Orders
```
POST   /orders                   - Create order (requires auth)
GET    /orders                   - Get user's orders (requires auth)
GET    /orders/:id               - Get order details (requires auth + ownership)
GET    /orders/cafe/:cafeId      - Get cafe's orders (requires auth + ownership)
```

### Payments
```
POST   /payments/create          - Initiate payment (requires auth)
POST   /payments/verify          - Verify payment (requires auth)
POST   /payments/webhook         - Payment webhook (no auth)
```

### Analytics
```
GET    /analytics/qrcode/:qrCodeId           - Get QR code scans (requires auth)
GET    /analytics/stats/qrcode/:qrCodeId     - Get analytics stats (requires auth)
```

### Webhooks
```
POST   /webhooks/payment         - Payment provider webhook
POST   /webhooks/print           - Printful/Printify webhook
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MongoDB 5+
- npm or yarn

### 2. Environment Variables
Create a `.env` file:
```env
# Server
NODE_ENV=development
PORT=3002

# Database
MONGODB_URI=mongodb://localhost:27017/qr-marketplace

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email Service (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment Providers
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret
STRIPE_SECRET_KEY=your-stripe-secret

# Print Provider
PRINTFUL_API_KEY=your-printful-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

### 3. Installation
```bash
npm install
```

### 4. Running the Server
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Key Features

### 1. User Authentication
- Email/password signup with OTP verification
- Google OAuth integration
- JWT-based session management
- Email verification

### 2. Cafe Management
- Multiple cafes per owner
- Cafe status management
- Google review link integration

### 3. QR Code Generation
- Automatic slug generation
- QR code image generation
- Link rotation capability
- Expiry management
- Multiple QR code types

### 4. Product Management
- Base product management
- Price configuration
- Print provider integration
- Product activation/deactivation

### 5. Order Management
- Order creation with product selection
- Automatic price calculation
- Order status tracking
- Print provider integration

### 6. Payment Processing
- Razorpay integration (UPI-native for India)
- Payment verification
- Webhook handling
- Multiple payment statuses

### 7. Analytics
- QR code scan tracking
- Geolocation tracking
- User agent tracking
- Analytics statistics generation
- Top cities and user agents

### 8. Webhooks
- Payment webhooks from Razorpay
- Print provider webhooks (Printful/Printify)
- Order status updates
- Email notifications

## Service Architecture

### DTOs (Data Transfer Objects)
Located in `services/dto-service/`, these define the request/response interfaces and enums for each module.

### Persistence Layer
Located in `services/persistence-service/`, these handle all database operations using Mongoose models.

### Business Logic
Located in `services/business-service/`, these contain the core business logic and call persistence services.

### Helper Services
Located in `services/helper-service/`, these provide utility functions:
- QR code generation
- Email notifications
- Print provider integration
- Webhook handlers

## Integration Points

### Razorpay Integration
```typescript
// Payment initiation
- Create payment record in DB
- Return payment order ID for frontend

// Payment verification
- Verify signature with Razorpay secret
- Update payment status
- Update order status
```

### Printful Integration
```typescript
// Order creation
- Send order to Printful with QR code URL
- Store external order ID

// Webhook handling
- Listen for order status updates
- Update order status
- Send email notifications
```

## Error Handling

All endpoints follow a consistent error response format:
```typescript
{
  status: number,
  message: string,
  data?: any
}
```

## Security Considerations

1. **Authentication**: All protected endpoints require valid JWT token
2. **Authorization**: Ownership verification for cafe/order updates
3. **Input Validation**: Joi schema validation for all inputs
4. **CORS**: Configurable CORS for frontend domains
5. **Environment Variables**: Sensitive data stored in .env
6. **Password Hashing**: Bcrypt for password hashing
7. **Webhook Verification**: Signature verification for webhooks

## Future Enhancements

1. Admin dashboard for product management
2. Subscription model for cafe owners
3. Advanced analytics with date range filters
4. Bulk order creation
5. Email templates with branding
6. SMS notifications via WhatsApp
7. Cron jobs for subscription expiry
8. Rate limiting on public endpoints
9. API documentation with Swagger/OpenAPI
10. Testing suite (Jest/Mocha)

## File Structure Reference

```
d:\Sagar\QR\QR_MARKET\
├── app.ts                          # Main Express app
├── package.json
├── tsconfig.json
├── nodemon.json
├── controllers/
│   ├── user.controller.ts
│   ├── cafe.controller.ts
│   ├── qrcode.controller.ts
│   ├── product.controller.ts
│   ├── order.controller.ts
│   ├── payment.controller.ts
│   └── analytics.controller.ts
├── routes/
│   ├── user.route.ts
│   ├── cafe.route.ts
│   ├── qrcode.route.ts
│   ├── product.route.ts
│   ├── order.route.ts
│   ├── payment.route.ts
│   ├── analytics.route.ts
│   └── webhooks.route.ts
├── middlewares/
│   ├── authenticate.ts
│   ├── validateRequest.ts
│   ├── errorHandler.ts
│   ├── user/
│   ├── cafe/
│   ├── qrcode/
│   ├── product/
│   ├── order/
│   └── payment/
└── services/
    ├── business-service/
    ├── persistence-service/
    ├── dto-service/
    └── helper-service/
```

## Testing the API

### 1. User Signup
```bash
curl -X POST http://localhost:3002/user/signup/email \
  -H "Content-Type: application/json" \
  -d '{"email":"cafe@example.com","firstName":"Cafe","lastName":"Owner","platform":"WEB"}'
```

### 2. Create Cafe
```bash
curl -X POST http://localhost:3002/cafes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Cafe","address":"123 Street","city":"Mumbai"}'
```

### 3. Create QR Code
```bash
curl -X POST http://localhost:3002/qrcodes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cafeId":"CAFE_ID","type":"GOOGLE_REVIEW","destinationUrl":"https://google.com/reviews"}'
```

## Support

For issues or questions, please refer to the API documentation or contact the development team.
