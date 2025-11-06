#!/bin/bash

# PriceScout E2E Testing - Quick Start Script
# Run this from e2e-tests folder

echo "🚀 PriceScout E2E Testing Setup"
echo "================================"

# Check Python version
python3 -v > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✓ Python found"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✓ Virtual environment exists"
fi

# Activate venv
source venv/bin/activate
echo "✓ Virtual environment activated"

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt
echo "✓ Dependencies installed"

# Copy .env if not exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your test credentials"
echo "2. Start backend: npm run server (port 3001)"
echo "3. Start frontend: npm run dev (port 5173)"
echo "4. Run tests: pytest test_pricescout.py -v"
echo ""
echo "To activate venv next time:"
echo "source venv/bin/activate"
