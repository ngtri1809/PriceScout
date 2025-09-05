# PriceScout API - AWS RDS Version

A simplified Express.js API server using AWS RDS MySQL instead of Prisma.

## Features

- ✅ **Express.js** - Simple, fast web framework
- ✅ **AWS RDS MySQL** - Direct database connection (no ORM)
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **Rate Limiting** - Built-in request limiting
- ✅ **CORS Support** - Cross-origin resource sharing
- ✅ **Helmet Security** - Security headers
- ✅ **Environment Variables** - Easy configuration

## Quick Start

### 1. Set up AWS RDS

1. Create an AWS RDS MySQL instance
2. Note your endpoint, port, username, and password
3. Create a database named `pricescout`

### 2. Configure Environment

```bash
cp env.example .env
```

Edit `.env` with your AWS RDS credentials:

```env
DB_HOST="your-rds-endpoint.region.rds.amazonaws.com"
DB_PORT=3306
DB_USER="your-username"
DB_PASSWORD="your-password"
DB_NAME="pricescout"
```

### 3. Set up Database Schema

Run the SQL schema on your AWS RDS instance:

```bash
mysql -h your-rds-endpoint -u your-username -p < schema.sql
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Start the Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3001`

## File Structure

```
apps/api/
├── src/
│   └── server.js           # Main API server (Express.js)
├── schema.sql              # Database schema for AWS RDS
├── env.example             # Environment variables template
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Items
- `GET /api/items` - Get all items with latest prices
- `GET /api/items/:id` - Get specific item with price history
- `GET /api/search?q=query` - Search items

### Watchlist
- `GET /api/watchlist/:userId` - Get user's watchlist
- `POST /api/watchlist` - Add item to watchlist

## Database Schema

The API uses these main tables:
- `users` - User accounts
- `items` - Products being tracked
- `marketplaces` - Online stores (Amazon, eBay, etc.)
- `price_data` - Historical price information
- `watchlist` - User's saved items
- `price_alerts` - Price drop notifications

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | AWS RDS endpoint | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_USER` | Database username | root |
| `DB_PASSWORD` | Database password | (empty) |
| `DB_NAME` | Database name | pricescout |
| `PORT` | API server port | 3001 |
| `JWT_SECRET` | JWT signing secret | (required) |

## Development vs Production

### Development
- Uses local MySQL or AWS RDS
- No password hashing (for simplicity)
- Detailed error messages

### Production
- Use AWS RDS for database
- Implement proper password hashing with bcrypt
- Add input validation with Zod
- Enable HTTPS
- Set up monitoring and logging

## Migration from Prisma

This version removes Prisma entirely and uses direct MySQL queries. Benefits:

- ✅ **Simpler** - No ORM complexity
- ✅ **Faster** - Direct database access
- ✅ **Smaller** - Fewer dependencies
- ✅ **AWS Native** - Works directly with RDS
- ✅ **Transparent** - You see exactly what queries run

## Next Steps

1. **Set up AWS RDS** - Create your MySQL instance
2. **Run the schema** - Execute `schema.sql` on your database
3. **Configure environment** - Set your RDS credentials
4. **Test the API** - Verify all endpoints work
5. **Add features** - Extend with more functionality as needed
