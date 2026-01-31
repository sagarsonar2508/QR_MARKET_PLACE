# QR Marketplace Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Clone & Install
```bash
cd D:\Sagar\QR\QR_MARKET
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Step 3: Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Or using local installation
mongod
```

### Step 4: Run Server
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### Step 5: Test API
```bash
# Check health
curl http://localhost:3002/health-check

# Create a cafe (after user signup/login)
curl -X POST http://localhost:3002/cafes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Cafe","address":"123 St","city":"Mumbai"}'
```

## 📁 Project Structure Overview

```
services/
├── business-service/     ← Business logic (services)
├── persistence-service/  ← Database operations
├── dto-service/         ← Data models & interfaces
└── helper-service/      ← Utilities (email, QR, payments)

controllers/    ← HTTP request handlers
routes/         ← API endpoint definitions
middlewares/    ← Validation, auth, error handling
```

## 🔐 Key Features

✅ User Authentication (Email + Google OAuth)
✅ Cafe Management
✅ QR Code Generation & Management
✅ Product Catalog
✅ Order Management
✅ Payment Integration (Razorpay)
✅ Print Provider Integration (Printful)
✅ Analytics & Tracking
✅ Webhooks

## 📊 Database Collections

- **Users** - User accounts & profiles
- **Cafes** - Business profiles
- **QRCodes** - Generated QR codes with tracking
- **Products** - Printable products
- **Orders** - Customer orders
- **Payments** - Payment records
- **Analytics** - QR scan analytics

## 🔌 API Routes

```
/user/*          - Authentication endpoints
/cafes/*         - Cafe management
/qrcodes/*       - QR code operations
/products/*      - Product catalog
/orders/*        - Order management
/payments/*      - Payment processing
/analytics/*     - Analytics data
/webhooks/*      - Webhook handlers
```

## 💡 Common Tasks

### Create a Cafe
```bash
POST /cafes
{
  "name": "My Awesome Cafe",
  "address": "123 Main St",
  "city": "Mumbai",
  "googleReviewLink": "https://..."
}
```

### Create QR Code
```bash
POST /qrcodes
{
  "cafeId": "...",
  "type": "GOOGLE_REVIEW",
  "destinationUrl": "https://google.com/reviews/..."
}
```

### Create Order
```bash
POST /orders
{
  "cafeId": "...",
  "productId": "...",
  "qrCodeId": "...",
  "quantity": 1
}
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

## 📝 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or kill process on port 3002
lsof -ti:3002 | xargs kill -9
```

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify connection string format

### JWT Token Errors
- Token might be expired (3 hour expiry)
- Try login again to get new token
- Check JWT_SECRET_KEY in .env

## 🚢 Deployment

### Docker
```bash
docker build -t qr-marketplace .
docker run -p 3002:3002 -env-file .env qr-marketplace
```

### Environment Setup
1. Update .env for production
2. Use strong JWT secrets
3. Enable HTTPS
4. Setup error tracking (Sentry)
5. Configure CDN for QR images
6. Setup monitoring & logging

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Environment Variables](./. env.example)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit PR

## 📞 Support

For issues or questions:
1. Check documentation
2. Review test cases
3. Check MongoDB logs
4. Enable debug logging

---

**Happy coding! 🎉**
