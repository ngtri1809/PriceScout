import { BasePredictionProvider } from '../prediction-provider.js';
import { logger } from '../../../lib/logger.js';

export class TfjsProvider extends BasePredictionProvider {
  id = 'tfjs';

  async predictPriceTrends(historicalData, horizon) {
    logger.info(`Running simple prediction for ${historicalData.length} data points, horizon: ${horizon}`);

    if (historicalData.length < 10) {
      throw new Error('Insufficient historical data for prediction (minimum 10 points required)');
    }

    try {
      // Sort data by timestamp
      const sortedData = historicalData
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(d => d.price);

      // Simple moving average baseline with quantile bootstrap
      const windowSize = Math.min(7, Math.floor(sortedData.length / 3));
      const movingAverages = this.calculateMovingAverages(sortedData, windowSize);
      
      // Calculate trend
      const trend = this.calculateTrend(movingAverages);
      
      // Generate predictions with uncertainty bands
      const predictions = [];
      const lastDate = new Date(historicalData[historicalData.length - 1].timestamp);
      
      for (let i = 1; i <= horizon; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setDate(lastDate.getDate() + i);
        
        // Simple linear trend projection
        const basePrice = movingAverages[movingAverages.length - 1];
        const projectedPrice = basePrice + (trend * i);
        
        // Add some noise for uncertainty bands
        const noise = this.generateBootstrapSamples(sortedData, 1000);
        const percentiles = this.calculatePercentiles(noise.map(n => projectedPrice + n));
        
        predictions.push({
          date: futureDate.toISOString(),
          p10: Math.round(percentiles.p10 * 100) / 100,
          p50: Math.round(projectedPrice * 100) / 100,
          p90: Math.round(percentiles.p90 * 100) / 100,
        });
      }

      logger.info(`Simple prediction completed: ${predictions.length} forecast points generated`);
      return predictions;
    } catch (error) {
      logger.error('Simple prediction failed:', error);
      throw new Error(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  calculateMovingAverages(data, windowSize) {
    const averages = [];
    
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      averages.push(average);
    }
    
    return averages;
  }

  calculateTrend(movingAverages) {
    if (movingAverages.length < 2) return 0;
    
    const first = movingAverages[0];
    const last = movingAverages[movingAverages.length - 1];
    const periods = movingAverages.length - 1;
    
    return (last - first) / periods;
  }

  generateBootstrapSamples(data, numSamples) {
    const samples = [];
    const residuals = this.calculateResiduals(data);
    
    for (let i = 0; i < numSamples; i++) {
      const randomResidual = residuals[Math.floor(Math.random() * residuals.length)];
      samples.push(randomResidual);
    }
    
    return samples;
  }

  calculateResiduals(data) {
    const movingAverages = this.calculateMovingAverages(data, 3);
    const residuals = [];
    
    for (let i = 0; i < movingAverages.length; i++) {
      const originalIndex = i + 2; // Adjust for moving average offset
      if (originalIndex < data.length) {
        residuals.push(data[originalIndex] - movingAverages[i]);
      }
    }
    
    return residuals;
  }
}