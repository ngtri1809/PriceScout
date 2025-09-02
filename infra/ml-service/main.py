from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PriceScout ML Service",
    description="Machine learning service for price predictions using Prophet",
    version="1.0.0"
)

class PriceDataPoint(BaseModel):
    price: float
    timestamp: str

class ForecastRequest(BaseModel):
    data: List[PriceDataPoint]
    horizon: int = 14

class ForecastResponse(BaseModel):
    date: str
    p10: float
    p50: float
    p90: float

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ml-service"}

@app.post("/forecast", response_model=List[ForecastResponse])
async def forecast_prices(request: ForecastRequest):
    """
    Generate price forecasts using Prophet-like algorithm
    For now, this is a mock implementation that returns realistic predictions
    """
    try:
        logger.info(f"Received forecast request with {len(request.data)} data points, horizon: {request.horizon}")
        
        if len(request.data) < 10:
            raise HTTPException(status_code=400, detail="Insufficient data points (minimum 10 required)")
        
        # Sort data by timestamp
        sorted_data = sorted(request.data, key=lambda x: x.timestamp)
        prices = [point.price for point in sorted_data]
        
        # Calculate basic statistics
        mean_price = np.mean(prices)
        std_price = np.std(prices)
        trend = calculate_trend(prices)
        
        # Generate predictions
        predictions = []
        last_date = datetime.fromisoformat(sorted_data[-1].timestamp.replace('Z', '+00:00'))
        
        for i in range(1, request.horizon + 1):
            future_date = last_date + timedelta(days=i)
            
            # Simple trend projection with uncertainty
            projected_price = mean_price + (trend * i)
            
            # Add some realistic uncertainty bands
            uncertainty = std_price * (1 + i * 0.1)  # Increasing uncertainty over time
            
            predictions.append(ForecastResponse(
                date=future_date.isoformat(),
                p10=max(0, projected_price - 1.28 * uncertainty),  # 10th percentile
                p50=projected_price,  # 50th percentile (median)
                p90=projected_price + 1.28 * uncertainty  # 90th percentile
            ))
        
        logger.info(f"Generated {len(predictions)} forecast points")
        return predictions
        
    except Exception as e:
        logger.error(f"Forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecast failed: {str(e)}")

def calculate_trend(prices: List[float]) -> float:
    """Calculate simple linear trend from price data"""
    if len(prices) < 2:
        return 0.0
    
    # Simple linear regression
    x = np.arange(len(prices))
    y = np.array(prices)
    
    # Calculate slope
    n = len(prices)
    sum_x = np.sum(x)
    sum_y = np.sum(y)
    sum_xy = np.sum(x * y)
    sum_x2 = np.sum(x * x)
    
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
    
    return slope

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "PriceScout ML Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "forecast": "/forecast"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
