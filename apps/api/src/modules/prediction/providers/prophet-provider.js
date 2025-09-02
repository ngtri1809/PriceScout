import { BasePredictionProvider } from '../prediction-provider.js';
import { config } from '../../../config/index.js';
import { logger } from '../../../lib/logger.js';

export class ProphetProvider extends BasePredictionProvider {
  id = 'prophet';

  async predictPriceTrends(historicalData, horizon) {
    logger.info(`Calling Prophet service for ${historicalData.length} data points, horizon: ${horizon}`);

    try {
      const response = await fetch(`${config.prediction.mlServiceUrl}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: historicalData,
          horizon,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Prophet service error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!Array.isArray(result)) {
        throw new Error('Invalid response format from Prophet service');
      }

      // Validate response format
      const predictions = result.map((item) => {
        if (!item.date || typeof item.p10 !== 'number' || typeof item.p50 !== 'number' || typeof item.p90 !== 'number') {
          throw new Error('Invalid prediction format from Prophet service');
        }
        
        return {
          date: item.date,
          p10: Math.round(item.p10 * 100) / 100,
          p50: Math.round(item.p50 * 100) / 100,
          p90: Math.round(item.p90 * 100) / 100,
        };
      });

      logger.info(`Prophet prediction completed: ${predictions.length} forecast points generated`);
      return predictions;
    } catch (error) {
      logger.error('Prophet service call failed:', error);
      
      // Fallback to simple trend analysis if Prophet service is unavailable
      logger.warn('Falling back to simple trend analysis');
      return this.fallbackPrediction(historicalData, horizon);
    }
  }

  fallbackPrediction(historicalData, horizon) {
    const sortedData = historicalData
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(d => d.price);

    const recentPrices = sortedData.slice(-7); // Last 7 prices
    const average = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / recentPrices.length;
    const stdDev = Math.sqrt(variance);

    const predictions = [];
    const lastDate = new Date(historicalData[historicalData.length - 1].timestamp);

    for (let i = 1; i <= horizon; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(lastDate.getDate() + i);

      predictions.push({
        date: futureDate.toISOString(),
        p10: Math.round((average - 1.28 * stdDev) * 100) / 100, // 10th percentile
        p50: Math.round(average * 100) / 100, // 50th percentile
        p90: Math.round((average + 1.28 * stdDev) * 100) / 100, // 90th percentile
      });
    }

    return predictions;
  }
}
