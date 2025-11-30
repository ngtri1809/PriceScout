# PriceScout 🛒

**Intelligent Price Tracking and Prediction Platform**

PriceScout is a production-grade monorepo application that provides intelligent price tracking across multiple marketplaces and AI-powered price predictions using Facebook's Prophet algorithm. Built with modern technologies and clean architecture principles.

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express + JavaScript
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: AWS RDS MySQL (direct connection with mysql2, no ORM)
- **Authentication**: JWT + bcryptjs
- **Search**: SerpAPI (Amazon, eBay, Google Shopping)
- **ML**: Facebook Prophet (CSV-based forecasting)
- **Testing**: Jest (API) + Vitest (Web) + Selenium/pytest (E2E)
- **Deployment**: Docker + Docker Compose

### Monorepo Structure
```
PriceScout/
├── apps/
│   ├── api/          # Express.js API server (server.js)
│   └── web/          # React frontend
├── e2e-tests/        # Selenium E2E tests (pytest)
├── infra/
│   └── ml-service/   # Prophet forecast data (CSV files)
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (optional)
- AWS RDS MySQL instance
- SerpAPI key (for search functionality)

### Installation

#### 1. Install Node.js
Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)

**Verify installation:**
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v8.0.0 or higher
```

#### 2. Install pnpm
Choose one of the following methods:

**Method 1: Using npm (Recommended)**
```bash
npm install -g pnpm
```

**Method 2: Using Corepack (Node.js 16.13+)**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**Method 3: Using Homebrew (macOS)**
```bash
brew install pnpm
```

**Verify pnpm installation:**
```bash
pnpm --version  # Should be v8.0.0 or higher
```

#### 3. Install Docker (Optional)
- **macOS**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Windows**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: Follow [Docker installation guide](https://docs.docker.com/engine/install/)

**Verify Docker installation:**
```bash
docker --version
docker-compose --version
```

### 4. Clone and Install
```bash
git clone <repository-url>
cd PriceScout
pnpm install
```

### 5. Environment Setup
```bash
# Copy environment files
cp apps/api/env.example apps/api/.env

# Edit the .env file with your configuration:
# - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (AWS RDS credentials)
# - JWT_SECRET (for authentication)
# - SERPAPI_KEY (for search functionality)
```

### 6. Database Setup
```bash
# Set up AWS RDS MySQL instance
# Create database: pricescout

# Run the schema on your RDS instance
mysql -h your-rds-endpoint -u your-username -p < apps/api/schema.sql
```

### 7. Start Development
```bash
# Start individual services
pnpm --filter='./apps/api' dev    # API on :3001
pnpm --filter='./apps/web' dev    # Web on :5173

# Or start all services with Docker Compose
pnpm dev
```

### 8. Access the Application
- **Web App**: http://localhost:5173
- **API**: http://localhost:3001/api
- **API Health**: http://localhost:3001/api/health

## 📋 Available Scripts

### Root Level
```bash
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm test:e2e         # Run E2E tests (requires Python/pytest setup)
pnpm lint             # Lint all packages
```

### API Specific
```bash
pnpm --filter='./apps/api' dev          # Start API server
pnpm --filter='./apps/api' test          # Run API tests
pnpm --filter='./apps/api' start        # Start production server
```

### Web Specific
```bash
pnpm --filter='./apps/web' dev          # Start web dev server
pnpm --filter='./apps/web' build        # Build for production
pnpm --filter='./apps/web' test         # Run web tests
```

## 🏛️ API Endpoints

### Health Check
- `GET /api/health` - Server status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Search
- `GET /api/search?q=query` - Search products across Amazon, eBay, and Google Shopping

### Items
- `GET /api/items` - Get all items with latest prices
- `GET /api/items/:id` - Get specific item with price history

### Watchlist (Authenticated - requires JWT token)
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add item to watchlist (accepts `itemId` or `itemData`)
- `DELETE /api/watchlist/:itemId` - Remove item from watchlist

### Price Predictions (Prophet)
- `GET /api/prophet/forecast?productName=name&date=DD&month=MM&year=YYYY` - Get price prediction for specific date
- `GET /api/prophet/history?productName=name` - Get historical price data for charts

## 🧠 Machine Learning

### Prophet Forecasting

PriceScout uses Facebook's Prophet algorithm for time series price forecasting. Forecast data is stored in CSV files and loaded on-demand.

**Available Products:**
- Products are defined in `apps/web/src/utils/product-helpers.js` (PRODUCT_CATALOG)
- Forecast CSV files are located in `infra/ml-service/data/Predictions_17_SKU/`
- Date range: December 2024 to November 2026

**How It Works:**
1. User selects a product from the catalog
2. User selects a future date (within available range)
3. Backend loads forecast data from CSV file
4. Returns predicted price with confidence intervals (yhat_lower, yhat, yhat_upper)

**API Example:**
```bash
GET /api/prophet/forecast?productName=alarm%20clock%20bakelike%20green&date=15&month=1&year=2025
```

**Response:**
```json
{
  "success": true,
  "productName": "alarm clock bakelike green",
  "requestedDate": "1/15/2025",
  "forecast": {
    "ds": "2025-01-15",
    "yhat": 12.50,
    "yhat_lower": 11.20,
    "yhat_upper": 13.80
  }
}
```

## 🧪 Testing

### API Tests
```bash
pnpm --filter='./apps/api' test
pnpm --filter='./apps/api' test:coverage
```

### Web Tests
```bash
pnpm --filter='./apps/web' test
pnpm --filter='./apps/web' test:ui
```

### E2E Tests
E2E tests use Selenium WebDriver with pytest. See `e2e-tests/README.md` for setup instructions.

```bash
cd e2e-tests
source venv/bin/activate  # Activate Python virtual environment
pytest test_pricescout.py -v
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Environment Variables

#### API (.env)
```bash
# AWS RDS Database
DB_HOST="your-rds-endpoint.region.rds.amazonaws.com"
DB_PORT=3306
DB_USER="your-username"
DB_PASSWORD="your-password"
DB_NAME="pricescout"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SerpAPI (for search)
SERPAPI_KEY="your-serpapi-key"
```

#### Web (.env)
```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

## 🎯 Features

### ✅ Implemented Features
- **Multi-Marketplace Search**: Search across Amazon, eBay, and Google Shopping using SerpAPI
- **User Authentication**: Register and login with JWT tokens
- **Watchlist**: Save and track products (requires authentication)
- **Price Predictions**: Get Prophet-powered price forecasts for future dates
- **Historical Price Charts**: View price history with interactive charts
- **Product Catalog**: Browse available products with images
- **About Us Page**: Team information and project details

### 🚫 Removed Features
- **Compare Page**: Price comparison feature has been removed

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export DB_HOST="your-production-rds-endpoint"
export JWT_SECRET="your-production-secret"
export SERPAPI_KEY="your-serpapi-key"
```

### 2. Database Migration
```bash
# Run schema on production database
mysql -h your-rds-endpoint -u username -p < apps/api/schema.sql
```

### 3. Build and Deploy
```bash
# Build all packages
pnpm build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Health Check
```bash
curl http://your-domain/api/health
```

## 🤝 Contributing

**Team Members:**
- Tri Nguyen (Team Leader)
- Anh Nguyen
- Tony Nguyen
- Timothy Vu

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run tests: `pnpm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- **ESLint**: Configured for JavaScript
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Test Coverage**: Write tests for new features

## 🔒 Security

### Implemented Security Measures
- **Helmet.js**: Security headers
- **CORS**: Configured origins
- **Rate Limiting**: Per-endpoint limits (100 requests per 15 minutes)
- **JWT**: Secure token authentication
- **bcryptjs**: Password hashing
- **Input Validation**: Basic validation on API endpoints

### Security Checklist
- [ ] Change default JWT secret in production
- [ ] Configure CORS origins for production domain
- [ ] Set up HTTPS in production
- [ ] Configure rate limits appropriately
- [ ] Set up monitoring alerts
- [ ] Regular dependency updates

## 🐛 Troubleshooting

### Installation Issues

#### pnpm Installation Problems
```bash
# If pnpm command not found after installation
export PATH="$PATH:$HOME/.local/share/pnpm"
# Add to ~/.bashrc or ~/.zshrc for permanent fix

# If permission denied on macOS/Linux
sudo npm install -g pnpm

# If using nvm, ensure Node.js is active
nvm use 18
npm install -g pnpm
```

#### Node.js Version Issues
```bash
# Check current Node.js version
node --version

# If version is too old, update Node.js
# Using nvm (recommended)
nvm install 18
nvm use 18
```

#### Docker Issues
```bash
# If Docker daemon not running
# macOS/Windows: Start Docker Desktop
# Linux: Start Docker service
sudo systemctl start docker

# If permission denied
sudo usermod -aG docker $USER
# Log out and back in
```

### Common Runtime Issues

#### Database Connection
```bash
# Check if API can connect to database
curl http://localhost:3001/api/health

# Check AWS RDS connectivity
telnet your-rds-endpoint 3306
```

#### Port Conflicts
```bash
# Check what's using ports
lsof -i :3001  # API port
lsof -i :5173  # Web port

# Kill processes if needed
kill -9 <PID>
```

#### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
pnpm install
```

### Logs
```bash
# API logs
pnpm --filter='./apps/api' dev

# Web logs  
pnpm --filter='./apps/web' dev

# All services with Docker
docker-compose logs -f
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js**: Backend framework
- **React**: Frontend framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **MySQL**: Database system
- **AWS RDS**: Managed database service
- **Node.js**: JavaScript runtime
- **Prophet**: Time series forecasting algorithm
- **SerpAPI**: Multi-marketplace search API
- **Docker**: Containerization platform
- **Selenium**: E2E testing framework
