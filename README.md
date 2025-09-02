# PriceScout 🛒

**Intelligent Price Tracking and Prediction Platform**

PriceScout is a production-grade monorepo application that provides intelligent price tracking, comparison across multiple marketplaces, and AI-powered price predictions. Built with modern technologies and clean architecture principles.

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express + JavaScript
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Database**: MySQL + Prisma ORM
- **Authentication**: JWT + bcrypt
- **Caching**: node-cache with TTL
- **Rate Limiting**: Bottleneck for marketplace adapters
- **Email**: AWS SES (prod) / MailHog (dev)
- **Monitoring**: Prometheus + Pino logging
- **Testing**: Jest (API) + Vitest (Web) + Cypress (E2E)
- **ML**: TensorFlow.js + Python FastAPI Prophet service
- **Deployment**: Docker + Docker Compose

### Monorepo Structure
```
PriceScout/
├── apps/
│   ├── api/          # Express.js API server
│   └── web/          # React frontend
├── packages/
│   └── shared/       # Shared types and API client
├── infra/
│   ├── ml-service/   # Python FastAPI ML service
│   └── mysql/        # Database initialization
└── .github/
    └── workflows/    # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- MySQL 8.0+

### 1. Clone and Install
```bash
git clone <repository-url>
cd PriceScout
pnpm install
```

### 2. Environment Setup
```bash
# Copy environment files
cp apps/api/env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit the .env files with your configuration
```

### 3. Database Setup
```bash
# Start MySQL (if not using Docker)
# Create database: pricescout

# Run migrations and seed data
pnpm db:migrate
pnpm db:seed
```

### 4. Start Development
```bash
# Start all services with Docker Compose
pnpm dev

# Or start individual services
pnpm --filter='./apps/api' dev    # API on :8080
pnpm --filter='./apps/web' dev    # Web on :5173
```

### 5. Access the Application
- **Web App**: http://localhost:5173
- **API**: http://localhost:8080/api
- **API Docs**: http://localhost:8080/api-docs
- **MailHog**: http://localhost:8025
- **ML Service**: http://localhost:8081

## 📋 Available Scripts

### Root Level
```bash
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm test:e2e         # Run E2E tests
pnpm lint             # Lint all packages
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with sample data
pnpm db:reset         # Reset database
```

### API Specific
```bash
pnpm --filter='./apps/api' dev          # Start API server
pnpm --filter='./apps/api' test         # Run API tests
pnpm --filter='./apps/api' db:generate  # Generate Prisma client
pnpm --filter='./apps/api' db:studio    # Open Prisma Studio
```

### Web Specific
```bash
pnpm --filter='./apps/web' dev          # Start web dev server
pnpm --filter='./apps/web' build        # Build for production
pnpm --filter='./apps/web' test         # Run web tests
pnpm --filter='./apps/web' test:e2e     # Run E2E tests
```

## 🏛️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `DELETE /api/auth/me` - Delete account

### Items & Search
- `GET /api/items/search?q=query` - Search items
- `GET /api/items/:id` - Get item details
- `GET /api/items/:id/prices?days=30` - Get price history

### Price Comparison
- `GET /api/compare?sku=SKU123` - Compare prices across marketplaces

### Watchlist (Authenticated)
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add item to watchlist
- `DELETE /api/watchlist/:itemId` - Remove from watchlist

### Predictions
- `GET /api/predict?itemId=123&h=14` - Get price predictions

### Notifications
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update preferences

## 🧠 Machine Learning

### Prediction Providers

#### 1. TensorFlow.js Provider (Default)
- **Location**: `apps/api/src/modules/prediction/providers/tfjs-provider.js`
- **Algorithm**: Moving average + quantile bootstrap
- **Use Case**: Fast, lightweight predictions
- **Configuration**: `PREDICTOR_PROVIDER=tfjs`

#### 2. Prophet Provider
- **Location**: `infra/ml-service/main.py`
- **Algorithm**: Facebook Prophet-like time series forecasting
- **Use Case**: More sophisticated predictions
- **Configuration**: `PREDICTOR_PROVIDER=prophet`

### Switching to Prophet Microservice

1. **Start the ML service**:
   ```bash
   docker-compose up ml
   ```

2. **Update environment**:
   ```bash
   # In apps/api/.env
   PREDICTOR_PROVIDER=prophet
   ML_SERVICE_URL=http://ml:8080
   ```

3. **Expected API format**:
   ```json
   POST /forecast
   {
     "data": [
       {"price": 100.0, "timestamp": "2024-01-01T00:00:00Z"},
       {"price": 105.0, "timestamp": "2024-01-02T00:00:00Z"}
     ],
     "horizon": 14
   }
   ```

4. **Response format**:
   ```json
   [
     {
       "date": "2024-01-15T00:00:00Z",
       "p10": 95.0,
       "p50": 110.0,
       "p90": 125.0
     }
   ]
   ```

## 🏪 Marketplace Adapters

### Current Adapters
- **Amazon**: Mock implementation with Prime shipping
- **eBay**: Mock implementation with auction/used variants

### Adding New Adapters

1. **Create adapter class**:
   ```javascript
   // apps/api/src/modules/compare/adapters/new-adapter.js
   import { BaseMarketplaceAdapter } from '../marketplace-adapter.js';
   
   export class NewAdapter extends BaseMarketplaceAdapter {
     id = 'newmarketplace';
     
     async fetchPrices(item) {
       // Implementation
     }
   }
   ```

2. **Register in engine**:
   ```javascript
   // apps/api/src/modules/compare/price-comparison-engine.js
   this.registerAdapter(new NewAdapter());
   ```

3. **Add rate limiting**:
   ```javascript
   // apps/api/src/modules/compare/rate-limiter.js
   this.createLimiter('newmarketplace', requestsPerMinute);
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
```bash
pnpm test:e2e
-filter='./apps/web' test:e2e:openpnpm -
```

### Test Data
- **Test User**: `test@example.com` / `password`
- **Sample Items**: PS5, iPhone 15 Pro, RTX 4090
- **Price History**: 60 days of mock data per item

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

### Services
- **API**: `pricescout-api:8080`
- **Web**: `pricescout-web:80`
- **MySQL**: `pricescout-mysql:3306`
- **MailHog**: `pricescout-mailhog:8025`
- **ML Service**: `pricescout-ml:8080`

## 📊 Monitoring & Observability

### Metrics (Prometheus)
- **Endpoint**: `/metrics`
- **Custom Metrics**:
  - HTTP request duration and count
  - Cache hit/miss rates
  - Marketplace API requests
  - Prediction requests

### Logging
- **Format**: JSON (production) / Pretty (development)
- **Levels**: debug, info, warn, error
- **Library**: Pino

### Health Checks
- **API**: `GET /api/health`
- **ML Service**: `GET /health`

## 🔧 Configuration

### Environment Variables

#### API (.env)
```bash
# Database
DATABASE_URL="mysql://root:password@localhost:3306/pricescout"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Cache
CACHE_TTL=60

# Email
SES_REGION="us-east-1"
SES_ACCESS_KEY=""
SES_SECRET_KEY=""
MAILHOG_HOST="localhost"
MAILHOG_PORT=1025

# Prediction
PREDICTOR_PROVIDER="tfjs"  # or "prophet"
ML_SERVICE_URL="http://ml:8080"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AMAZON_RATE_LIMIT=10
EBAY_RATE_LIMIT=10
```

#### Web (.env)
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="mysql://user:pass@prod-db:3306/pricescout"
export JWT_SECRET="your-production-secret"
# ... other production configs
```

### 2. Database Migration
```bash
pnpm db:deploy
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
- **Test Coverage**: Minimum 80%

## 📝 API Documentation

- **OpenAPI Spec**: `apps/api/src/openapi/openapi.yaml`
- **Interactive Docs**: http://localhost:8080/api-docs (development)
- **Schema**: RFC 7807 error format

## 🔒 Security

### Implemented Security Measures
- **Helmet.js**: Security headers
- **CORS**: Configured origins
- **Rate Limiting**: Per-endpoint limits
- **JWT**: Secure token authentication
- **bcrypt**: Password hashing
- **Input Validation**: Zod schemas
- **SQL Injection**: Prisma ORM protection

### Security Checklist
- [ ] Change default JWT secret
- [ ] Configure CORS origins
- [ ] Set up HTTPS in production
- [ ] Configure rate limits
- [ ] Set up monitoring alerts
- [ ] Regular dependency updates

## 📈 Performance

### Targets
- **API Response Time**: ≤ 5 seconds
- **Cache TTL**: 60 seconds (configurable)
- **Rate Limits**: 10 requests/minute per marketplace
- **Concurrent Requests**: 5 per marketplace

### Optimization
- **Caching**: Node-cache with TTL
- **Rate Limiting**: Bottleneck for external APIs
- **Database**: Prisma connection pooling
- **Frontend**: Vite build optimization

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MySQL is running
docker-compose ps mysql

# Check connection
pnpm --filter='./apps/api' db:studio
```

#### Port Conflicts
```bash
# Check what's using ports
lsof -i :8080
lsof -i :5173

# Kill processes if needed
kill -9 <PID>
```

#### Cache Issues
```bash
# Clear cache (if implemented)
curl -X POST http://localhost:8080/api/cache/clear
```

### Logs
```bash
# API logs
docker-compose logs -f api

# All services
docker-compose logs -f
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Prisma**: Database ORM
- **shadcn/ui**: UI components
- **Tailwind CSS**: Styling
- **React**: Frontend framework
- **Express**: Backend framework
- **TensorFlow.js**: Machine learning
- **Prophet**: Time series forecasting


