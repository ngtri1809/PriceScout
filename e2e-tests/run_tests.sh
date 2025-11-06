#!/bin/bash

# Script to run PriceScout E2E tests

cd "$(dirname "$0")"

# Activate virtual environment
source .venv/bin/activate

echo "=========================================="
echo "Running PriceScout E2E Tests"
echo "=========================================="
echo ""

# Check if app is running
echo "Checking if application is running at http://localhost:5173..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✓ Application is running"
else
    echo "⚠ Warning: Application may not be running at http://localhost:5173"
    echo "  Please start the web app before running tests"
    echo ""
fi

echo ""
echo "Select test suite:"
echo "1) Focused suite (19 tests - RECOMMENDED)"
echo "2) Comprehensive suite (58 tests)"
echo ""
read -p "Enter choice [1]: " choice
choice=${choice:-1}

if [ "$choice" == "2" ]; then
    TEST_FILE="test_pricescout.py"
    echo "Running comprehensive test suite (58 tests)..."
else
    TEST_FILE="test_pricescout_focused.py"
    echo "Running focused test suite (19 tests)..."
fi

echo ""
echo "Running tests..."
echo ""

# Run tests with detailed output
pytest $TEST_FILE -v --tb=short -x

echo ""
echo "=========================================="
echo "Test run completed"
echo "=========================================="

