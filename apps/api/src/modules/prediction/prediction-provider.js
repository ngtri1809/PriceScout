export class BasePredictionProvider {
  generateDateRange(startDate, horizon) {
    const dates = [];
    const currentDate = new Date(startDate);
    
    for (let i = 1; i <= horizon; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + i);
      dates.push(futureDate);
    }
    
    return dates;
  }

  calculatePercentiles(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const len = sorted.length;
    
    return {
      p10: sorted[Math.floor(len * 0.1)],
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
    };
  }

  async predictPriceTrends(historicalData, horizon) {
    throw new Error('predictPriceTrends method must be implemented');
  }
}
