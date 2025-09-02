import { z } from 'zod';

// User types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Item types
export const ItemSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const CreateItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
});

// Price data types
export const PriceDataSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  marketplaceId: z.string(),
  price: z.number(),
  shipping: z.number(),
  tax: z.number(),
  availability: z.boolean(),
  timestamp: z.string().datetime(),
});

export const CreatePriceDataSchema = z.object({
  itemId: z.string(),
  marketplaceId: z.string(),
  price: z.number(),
  shipping: z.number(),
  tax: z.number(),
  availability: z.boolean(),
});

// Predicted price types
export const PredictedPriceSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  predictedPrice: z.number(),
  forecastDate: z.string().datetime(),
});

export const CreatePredictedPriceSchema = z.object({
  itemId: z.string(),
  predictedPrice: z.number(),
  forecastDate: z.string().datetime(),
});

// Watchlist types
export const WatchlistSchema = z.object({
  userId: z.string(),
  itemId: z.string(),
  createdAt: z.string().datetime(),
});

export const CreateWatchlistSchema = z.object({
  itemId: z.string(),
});

// Notification preference types
export const NotificationPreferenceSchema = z.object({
  userId: z.string(),
  emailOptIn: z.boolean(),
  createdAt: z.string().datetime(),
});

export const UpdateNotificationPreferenceSchema = z.object({
  emailOptIn: z.boolean(),
});

// Marketplace types
export const MarketplacePriceSchema = z.object({
  marketplaceId: z.string(),
  price: z.number(),
  shipping: z.number(),
  tax: z.number(),
  availability: z.boolean(),
  timestamp: z.string().datetime(),
});

// Comparison types
export const PriceComparisonSchema = z.object({
  item: ItemSchema,
  prices: z.array(MarketplacePriceSchema),
  totalCosts: z.array(z.object({
    marketplaceId: z.string(),
    totalCost: z.number(),
    price: z.number(),
    shipping: z.number(),
    tax: z.number(),
    availability: z.boolean(),
  })),
});

// Prediction types
export const PredictionResultSchema = z.object({
  date: z.string().datetime(),
  p10: z.number(),
  p50: z.number(),
  p90: z.number(),
});

export const PredictionRequestSchema = z.object({
  itemId: z.string(),
  horizon: z.number().min(1).max(90).default(14),
});

// API Response types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  instance: z.string().optional(),
});

// Auth types
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
});

// Search types
export const SearchQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Price history types
export const PriceHistoryQuerySchema = z.object({
  days: z.number().min(1).max(365).default(30),
});
