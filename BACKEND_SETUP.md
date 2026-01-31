# QR Market - Backend Setup & Architecture Guide

## Overview

Backend is built with Express.js, TypeScript, MongoDB, and integrates with Printify for print-on-demand fulfillment.

## Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn
- Printify API access (optional for development)

## Installation

1. **Navigate to Backend Directory**
```bash
cd QR_MARKET
```

2. **Install Dependencies**
```bash
npm install
```

3. **Verify Installation**
```bash
npm list
```

## Configuration

### Environment Variables

Create `.env` file in the backend root:

```env
# Server Configuration
PORT=3002
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/qr_market
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/qr_market?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_key_change_this
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# Printify Integration
PRINTIFY_API_KEY=your_printify_api_key_here
PRINTIFY_SHOP_ID=your_shop_id_here

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Payment (if using Stripe)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Environment Name
APP_NAME=QR Market
APP_VERSION=2.0.0
```

## Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

Output:
```
Server started on port 3002
```

### Production Mode
```bash
npm run build
npm start
```

### Check Health
```bash
curl http://localhost:3002/health-check
```

## Project Structure

```
src/
├── app.ts                           # Main application entry
├── controllers/                     # Request handlers
│   ├── product.controller.ts
│   ├── order.controller.ts
│   ├── qrcode.controller.ts
│   ├── payment.controller.ts
│   └── ...
├── routes/                          # API routes
│   ├── product.route.ts
│   ├── order.route.ts
│   ├── qrcode.route.ts
│   └── ...
├── middlewares/                     # Express middleware
│   ├── authenticate.ts             # JWT authentication
│   ├── errorHandler.ts             # Error handling
│   └── validateRequest.ts          # Request validation
├── services/
│   ├── business-service/           # Business logic
│   │   ├── product/
│   │   ├── order/
│   │   ├── qrcode/
│   │   ├── payment/
│   │   └── ...
│   ├── persistence-service/        # Database operations
│   │   ├── product/
│   │   │   ├── product.persistence.service.ts
│   │   │   └── schemas/product.schema.ts
│   │   ├── order/
│   │   ├── qrcode/
│   │   └── ...
│   ├── dto-service/                # Data Transfer Objects
│   │   ├── product/
│   │   ├── order/
│   │   └── ...
│   └── helper-service/             # Utilities
│       ├── print-provider.service.ts  # Printify integration
│       ├── qr-generator.ts            # QR code generation
│       ├── email.helper.ts            # Email sending
│       ├── jwt.helper.ts              # JWT management
│       └── response.helper.ts         # Response formatting
```

## Key Services

### 1. Printify Integration (`services/helper-service/print-provider.service.ts`)

**Main Functions:**

```typescript
// Create order in Printify
createPrintifyOrder(
  orderId: string,
  lineItems: PrintifyLineItem[],
  shippingAddress: PrintifyShippingAddress
)

// Get order status
getPrintifyOrderStatus(printifyOrderId: string)

// Cancel order
cancelPrintifyOrder(printifyOrderId: string)

// Get available products
getPrintifyProducts()
```

**Usage Example:**
```typescript
const printOrder = await createPrintifyOrder(
  "order_123",
  [
    {
      productId: 123,
      variantId: 456,
      quantity: 1,
      fileUrl: "https://..."
    }
  ],
  {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    street: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA"
  }
);
```

### 2. QR Code Generation (`services/helper-service/qr-generator.ts`)

- Generates QR codes for URLs and text
- Returns base64 or file path
- Customizable error correction levels

### 3. Email Service (`services/helper-service/email.helper.ts`)

- Sends order confirmations
- Sends payment receipts
- Sends tracking information

### 4. JWT Helper (`services/helper-service/jwt.helper.ts`)

- Token generation and verification
- Token refresh handling
- Session management

## API Endpoints

### Products (Public)

```
GET /products
- Get all available shirt products
- No authentication required
- Returns: Product[]

GET /products/:id
- Get specific product with variants
- No authentication required
- Returns: Product
```

### QR Codes (Protected)

```
POST /qrcodes
- Create new QR code
- Auth: Required (Bearer token)
- Body: { type: "url" | "text", destinationUrl: string }
- Returns: { _id, slug, qrCodeImageUrl, ... }

GET /qrcodes
- Get user's QR codes
- Auth: Required
- Returns: QRCode[]

GET /qrcodes/:id
- Get specific QR code
- Auth: Required
- Returns: QRCode

PUT /qrcodes/:id
- Update QR code
- Auth: Required
- Body: { destinationUrl?: string, isActive?: boolean }
- Returns: QRCode

DELETE /qrcodes/:id
- Delete QR code
- Auth: Required
- Returns: { message: "Deleted" }
```

### Orders (Protected)

```
POST /orders
- Create new order
- Auth: Required
- Body: {
    productId: string,
    qrCodeId: string,
    shirtColor: string,
    shirtSize: string,
    quantity: number,
    shippingAddress: { ... }
  }
- Returns: { _id, orderStatus, paymentStatus, ... }

GET /orders
- Get user's orders
- Auth: Required
- Returns: Order[]

GET /orders/:id
- Get order details
- Auth: Required
- Returns: Order
```

### Payment (Protected)

```
POST /payments/initiate
- Start payment process
- Auth: Required
- Body: { orderId, amount, paymentMethod }
- Returns: { paymentId, clientSecret, ... }

POST /payments/verify
- Verify payment success
- Auth: Required
- Body: { paymentId, transactionId }
- Returns: { status: "success" | "failed" }

POST /payments/webhook
- Webhook from payment provider
- Body: { event, data }
- Returns: { received: true }
```

## Authentication Flow

### Request with Authentication
```bash
curl -H "Authorization: Bearer {token}" http://localhost:3002/orders
```

### Token Format
```
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Automatic Authentication (Middleware)
```typescript
// Required auth
router.post('/', authenticate, controller);

// Optional auth
router.get('/', optionalAuth, controller);
```

## Database Schemas

### Product Schema
```typescript
{
  name: string (unique)
  description?: string
  basePrice: number
  printProviderId: string
  productType: "shirt" | "other"
  shirtDesigns: [{
    colorCode: string
    colorName: string
    size: "XS" | "S" | "M" | "L" | "XL" | "XXL"
    mockupImageUrl: string
    quantity?: number
  }]
  thumbnailUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Order Schema
```typescript
{
  userId: string (ref: User)
  productId: string (ref: Product)
  qrCodeId: string (ref: QRCode)
  shirtColor: string
  shirtSize: string
  shirtMockupUrl?: string
  shippingAddress: {
    fullName: string
    email: string
    phone: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  amount: number
  quantity: number
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
  orderStatus: "created" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  printProviderOrderId?: string
  trackingUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### QRCode Schema
```typescript
{
  userId: string (ref: User)
  slug: string (unique)
  type: "url" | "text"
  destinationUrl: string
  isActive: boolean
  expiresAt?: Date
  qrCodeImageUrl?: string
  scanCount: number
  createdAt: Date
  updatedAt: Date
}
```

## Error Handling

### Custom AppError Class
```typescript
throw new AppError("Error message", 400);
// Returns: { success: false, message: "Error message", statusCode: 400 }
```

### Error Codes
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Validation

### Request Validation
```typescript
// Schemas located in: middlewares/{entity}/modules.export.ts
router.post('/', validateRequest(createProductSchema), controller);
```

### Joi Validation Example
```typescript
const createProductSchema = Joi.object({
  name: Joi.string().required(),
  basePrice: Joi.number().positive().required(),
  shirtDesigns: Joi.array().required(),
});
```

## Database Connection

### MongoDB Connection
```typescript
// src/services/persistence-service/database.ts
const db = await connectToDatabase();
```

### Connection String Examples
```
// Local
mongodb://localhost:27017/qr_market

// MongoDB Atlas
mongodb+srv://user:pass@cluster.mongodb.net/qr_market?retryWrites=true&w=majority
```

## Development Workflows

### Adding a New Route

1. **Create Persistence Service**
```typescript
// services/persistence-service/feature/feature.persistence.service.ts
export const getFeature = async (id: string) => {
  return FeatureModel.findById(id);
};
```

2. **Create Business Service**
```typescript
// services/business-service/feature/feature.business.service.ts
export const getFeatureService = async (id: string) => {
  return await getFeature(id);
};
```

3. **Create Controller**
```typescript
// controllers/feature.controller.ts
export const getFeature = catchAsync(async (req, res) => {
  const data = await getFeatureService(req.params.id);
  sendResponse(res, { status: 200, data });
});
```

4. **Create Route**
```typescript
// routes/feature.route.ts
router.get('/:id', authenticate, getFeature);
```

5. **Register Route**
```typescript
// app.ts
app.use('/feature', featureRoutes);
```

### Testing Endpoints

Using curl:
```bash
# Get products
curl http://localhost:3002/products

# Create order (requires auth)
curl -X POST http://localhost:3002/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Using Postman:
1. Import API collection
2. Set environment variables
3. Execute requests
4. View responses

## Debugging

### Enable Debug Logging
```bash
DEBUG=* npm run dev
```

### Check MongoDB Connection
```bash
mongo mongodb://localhost:27017/qr_market
```

### View Server Logs
```bash
npm run dev 2>&1 | tee server.log
```

## Performance Optimization

### Database Indexing
- Product: Indexed on `isActive`, `productType`
- Order: Indexed on `userId`, `orderStatus`, `paymentStatus`
- QRCode: Indexed on `userId`, `slug`, `isActive`

### Response Caching
- Product list cached for 5 minutes
- User orders cached per session

### API Rate Limiting
- 100 requests per minute per IP
- 1000 requests per day per user

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use strong random string (32+ characters)
3. **CORS**: Configure allowed origins
4. **Input Validation**: Validate all user inputs
5. **SQL Injection**: Use parameterized queries (Mongoose prevents this)
6. **Error Messages**: Don't expose sensitive info in errors
7. **Rate Limiting**: Implement per IP and per user

## Deployment

### Heroku Deployment
```bash
heroku create app-name
heroku config:set KEY=value
git push heroku main
```

### Docker Deployment
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t qr-market:latest .
docker run -p 3002:3002 -e MONGODB_URI=... qr-market:latest
```

## Monitoring & Logging

### Application Monitoring
- Track API response times
- Monitor error rates
- Database query performance

### Logging
- All API requests logged
- Database operations logged
- Error stack traces saved

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3002
lsof -i :3002
# Kill process
kill -9 <PID>
```

### Database Connection Failed
- Check MongoDB is running
- Verify connection string
- Check credentials

### JWT Token Errors
- Verify JWT_SECRET_KEY is set
- Check token format: `Bearer {token}`
- Check token hasn't expired

### Printify Integration Issues
- Verify API key is correct
- Check Shop ID exists
- Test with Printify sandbox first

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Printify API Documentation](https://developers.printify.com/)
- [JWT Explained](https://jwt.io/introduction)

---

**Last Updated**: January 31, 2026
**Version**: 2.0.0
