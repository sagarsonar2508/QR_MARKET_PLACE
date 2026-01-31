#!/bin/bash

# QR Marketplace Backend - Setup Script
# This script sets up the development environment

set -e

echo "🚀 QR Marketplace Backend Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"

# Check if MongoDB is running (optional warning)
if ! command -v mongosh &> /dev/null; then
    echo "⚠ MongoDB CLI is not found. Make sure MongoDB is running separately."
else
    echo "✓ MongoDB CLI found"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠ Please update .env file with your configuration"
else
    echo "✓ .env file already exists"
fi

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Make sure MongoDB is running (mongodb://localhost:27017)"
echo "3. Run: npm run dev"
echo ""
