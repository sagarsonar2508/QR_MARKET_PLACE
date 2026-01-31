# Testing Guide for QR Marketplace API

## Prerequisites
- Postman or curl installed
- Server running on http://localhost:3002
- MongoDB connected

## Test Sequence

### 1. User Authentication

#### 1.1 Email Signup (Request OTP)
```bash
curl -X POST http://localhost:3002/user/signup/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cafe@example.com",
    "firstName": "Cafe",
    "lastName": "Owner",
    "platform": "WEB"
  }'
```
**Expected Response**: OTP sent to email
**Note**: Check email for OTP (or check MongoDB for otp field)

#### 1.2 Verify OTP
```bash
curl -X POST http://localhost:3002/user/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cafe@example.com",
    "otp": "123456",
    "platform": "WEB"
  }'
```
**Expected Response**: Success message

#### 1.3 Set Password
```bash
curl -X POST http://localhost:3002/user/set-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cafe@example.com",
    "password": "SecurePassword@123",
    "confirmPassword": "SecurePassword@123",
    "platform": "WEB"
  }'
```
**Expected Response**: Success message

#### 1.4 Login
```bash
curl -X POST http://localhost:3002/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cafe@example.com",
    "password": "SecurePassword@123",
    "platform": "WEB"
  }'
```
**Expected Response**: 
```json
{
  "email": "cafe@example.com",
  "role": null,
  "expiresIn": 10800,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Save the token for next requests**

### 2. Cafe Management

#### 2.1 Create Cafe
```bash
curl -X POST http://localhost:3002/cafes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Corner",
    "address": "123 Main Street",
    "city": "Mumbai",
    "googleReviewLink": "https://google.com/maps/place/..."
  }'
```
**Expected Response**: Cafe object with _id
**Save the cafe _id for QR code creation**

#### 2.2 Get My Cafes
```bash
curl -X GET http://localhost:3002/cafes/my-cafes \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Response**: Array of cafe objects

#### 2.3 Get Single Cafe
```bash
curl -X GET http://localhost:3002/cafes/CAFE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2.4 Update Cafe
```bash
curl -X PUT http://localhost:3002/cafes/CAFE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Corner Updated",
    "city": "Bangalore"
  }'
```

### 3. Products

#### 3.1 Get All Products
```bash
curl -X GET http://localhost:3002/products
```
**Note**: No authentication required

#### 3.2 Create Product (Admin)
```bash
curl -X POST http://localhost:3002/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Mug",
    "basePrice": 499,
    "printProviderId": "mug-1"
  }'
```
**Expected Response**: Product object with _id
**Save the product _id for order creation**

### 4. QR Codes

#### 4.1 Create QR Code
```bash
curl -X POST http://localhost:3002/qrcodes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cafeId": "CAFE_ID",
    "type": "GOOGLE_REVIEW",
    "destinationUrl": "https://google.com/maps/place/coffee-corner",
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```
**Expected Response**: QR code object with slug
**Save the QR code _id and slug**

#### 4.2 Get QR Code Details
```bash
curl -X GET http://localhost:3002/qrcodes/QRCODE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.3 Get All QR Codes for Cafe
```bash
curl -X GET http://localhost:3002/qrcodes/cafe/CAFE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.4 Rotate QR Code Link
```bash
curl -X POST http://localhost:3002/qrcodes/QRCODE_ID/rotate-link \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destinationUrl": "https://new-destination.com"
  }'
```

#### 4.5 Test Public QR Redirect
```bash
curl -X GET http://localhost:3002/q/SLUG -L
```
**Expected Response**: Redirect (301) to destination URL

### 5. Orders

#### 5.1 Create Order
```bash
curl -X POST http://localhost:3002/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cafeId": "CAFE_ID",
    "productId": "PRODUCT_ID",
    "qrCodeId": "QRCODE_ID",
    "quantity": 1
  }'
```
**Expected Response**: Order object with _id
**Save the order _id for payment**

#### 5.2 Get My Orders
```bash
curl -X GET http://localhost:3002/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5.3 Get Order Details
```bash
curl -X GET http://localhost:3002/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Payments

#### 6.1 Initiate Payment
```bash
curl -X POST http://localhost:3002/payments/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "amount": 499,
    "provider": "RAZORPAY"
  }'
```
**Expected Response**: Payment initiation details

#### 6.2 Verify Payment
```bash
curl -X POST http://localhost:3002/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "paymentId": "pay_123456",
    "signature": "signature_hash"
  }'
```

### 7. Analytics

#### 7.1 Get QR Code Analytics
```bash
curl -X GET http://localhost:3002/analytics/qrcode/QRCODE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Response**: Array of analytics entries

#### 7.2 Get QR Code Stats
```bash
curl -X GET http://localhost:3002/analytics/stats/qrcode/QRCODE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Response**: Statistics including total scans, unique IPs, top cities

### 8. Webhooks (Testing Locally)

#### 8.1 Test Payment Webhook
```bash
curl -X POST http://localhost:3002/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_123456",
          "amount": 49900
        }
      },
      "order": {
        "entity": {
          "receipt": "ORDER_ID"
        }
      }
    }
  }'
```

#### 8.2 Test Print Webhook
```bash
curl -X POST http://localhost:3002/webhooks/print \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order_shipped",
    "data": {
      "id": "print_order_123",
      "external_id": "ORDER_ID",
      "tracking_url": "https://tracking.printful.com/...",
      "tracking_number": "TRACK123"
    }
  }'
```

## Error Scenarios to Test

### 1. Unauthorized Access
```bash
curl -X GET http://localhost:3002/cafes/my-cafes
```
**Expected Response**: 401 Unauthorized

### 2. Invalid Token
```bash
curl -X GET http://localhost:3002/cafes/my-cafes \
  -H "Authorization: Bearer invalid_token"
```
**Expected Response**: 401 Unauthorized

### 3. Cafe Ownership Verification
- Create cafe with User A
- Try to update with User B
**Expected Response**: 403 Forbidden

### 4. Non-existent Resource
```bash
curl -X GET http://localhost:3002/cafes/invalid_id \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Response**: 404 Not Found

### 5. Invalid Request Data
```bash
curl -X POST http://localhost:3002/cafes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A"
  }'
```
**Expected Response**: 400 Bad Request (validation error)

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test QR redirect endpoint
ab -n 1000 -c 10 http://localhost:3002/q/test-slug

# Test public product endpoint
ab -n 1000 -c 10 http://localhost:3002/products
```

## Database Verification

### Check Collections
```bash
mongosh qr-marketplace
db.users.find()
db.cafes.find()
db.qrcodes.find()
db.products.find()
db.orders.find()
db.payments.find()
db.analytics.find()
```

## Using Postman

1. Import the collection (create Postman collection with above endpoints)
2. Set environment variables:
   - `base_url`: http://localhost:3002
   - `token`: (obtained from login)
   - `cafe_id`: (obtained from create cafe)
   - etc.
3. Run collection with different scenarios

## Debugging

### Enable Verbose Logging
Set in .env:
```env
LOG_LEVEL=debug
```

### Check Network Requests
Use Chrome DevTools or Postman's Console tab

### MongoDB Profiling
```bash
mongosh
db.setProfilingLevel(1)
db.system.profile.find().pretty()
```

## Common Issues

### 1. CORS Error
- Ensure frontend URL is in ALLOWED_ORIGINS
- Check .env for correct CORS configuration

### 2. Payment Webhook Not Working
- Verify webhook secret matches Razorpay dashboard
- Check ngrok tunnel (for local Razorpay testing)

### 3. Email Not Sending
- Verify Gmail app password (not regular password)
- Check email configuration in .env
- Enable "Less secure apps" if needed

### 4. MongoDB Connection Error
- Ensure MongoDB service is running
- Check MONGODB_URI in .env
- Verify MongoDB credentials

## Next Steps

After testing:
1. Set up CI/CD pipeline
2. Deploy to staging
3. Run integration tests
4. Deploy to production
