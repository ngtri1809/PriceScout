import client from 'prom-client';

// Create a Registry to register the metrics
export const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'pricescout-api',
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_key'],
});

export const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_key'],
});

export const marketplaceRequests = new client.Counter({
  name: 'marketplace_requests_total',
  help: 'Total number of marketplace API requests',
  labelNames: ['marketplace', 'status'],
});

export const predictionRequests = new client.Counter({
  name: 'prediction_requests_total',
  help: 'Total number of prediction requests',
  labelNames: ['provider', 'status'],
});

// Register the custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);
register.registerMetric(marketplaceRequests);
register.registerMetric(predictionRequests);
