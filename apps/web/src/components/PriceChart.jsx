import React from 'react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PriceChart = ({ data, productName, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-500 mb-2">No historical data available</div>
            <div className="text-sm text-gray-400">This product may not have forecast data yet</div>
          </div>
      </div>
    );
  }

  // Format data for the chart - proper date formatting
  const chartData = data.map((item, index) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    return {
      date: formattedDate,
      fullDate: item.date,
      predictedPrice: parseFloat(item.predictedPrice) || 0,
      actualPrice: item.actualPrice ? parseFloat(item.actualPrice) : null,
      lowerBound: parseFloat(item.lowerBound) || 0,
      upperBound: parseFloat(item.upperBound) || 0
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.fullDate}</p>
          {data.actualPrice && (
            <p className="text-blue-600">
              Actual Price: ${data.actualPrice.toFixed(2)}
            </p>
          )}
          <p className="text-green-600">
            Predicted Price: ${data.predictedPrice.toFixed(2)}
          </p>
          <p className="text-gray-500 text-sm">
            Range: ${data.lowerBound.toFixed(2)} - ${data.upperBound.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-md border p-6 w-3/4 max-w-6xl">
        {/* Chart Header */}
        <div className="mb-4 text-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Price History - {productName}
          </h3>
          <p className="text-sm text-gray-600">
            Historical price predictions from December 2024 to present
          </p>
        </div>

        {/* SVG Line Chart */}
        <div className="h-80 bg-gray-50 rounded-lg border p-4">
        <svg width="100%" height="100%" viewBox="0 0 800 300">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Y-axis label */}
          <text x="20" y="150" textAnchor="middle" transform="rotate(-90, 20, 150)" 
                className="text-sm font-medium fill-gray-600">
            Price ($)
          </text>
          
          {/* Y-axis tick marks and labels */}
          {chartData.length > 0 && (() => {
            const maxPrice = Math.max(...chartData.map(d => d.predictedPrice));
            const minPrice = Math.min(...chartData.map(d => d.predictedPrice));
            const priceRange = maxPrice - minPrice;
            const chartHeight = 220;
            const padding = 60;
            const tickCount = 6;
            
            const ticks = [];
            for (let i = 0; i <= tickCount; i++) {
              const price = minPrice + (priceRange * i / tickCount);
              const y = padding + (chartHeight - 2 * padding) * (1 - i / tickCount);
              
              ticks.push(
                <g key={i}>
                  {/* Tick line */}
                  <line x1="60" y1={y} x2="65" y2={y} stroke="#666" strokeWidth="1"/>
                  {/* Price label */}
                  <text x="55" y={y + 4} textAnchor="end" className="text-xs fill-gray-600">
                    ${price.toFixed(1)}
                  </text>
                </g>
              );
            }
            return ticks;
          })()}
          
          {/* X-axis label */}
          <text x="400" y="290" textAnchor="middle" 
                className="text-sm font-medium fill-gray-600">
            Date
          </text>
          
          {/* X-axis tick marks and date labels */}
          {chartData.length > 0 && (() => {
            const chartWidth = 700;
            const padding = 60;
            const tickCount = Math.min(6, Math.floor(chartData.length / 30)); // Show up to 6 ticks, one per month
            
            const ticks = [];
            for (let i = 0; i <= tickCount; i++) {
              const dataIndex = Math.floor((chartData.length - 1) * i / tickCount);
              const item = chartData[dataIndex];
              const x = padding + (chartWidth - 2 * padding) * i / tickCount;
              
              // Format date to show month and year
              const date = new Date(item.fullDate);
              const monthYear = date.toLocaleDateString('en-US', { 
                month: 'short', 
                year: '2-digit' 
              });
              
              ticks.push(
                <g key={i}>
                  {/* Tick line */}
                  <line x1={x} y1="240" x2={x} y2="245" stroke="#666" strokeWidth="1"/>
                  {/* Date label */}
                  <text x={x} y="260" textAnchor="middle" className="text-xs fill-gray-600">
                    {monthYear}
                  </text>
                </g>
              );
            }
            return ticks;
          })()}
          
          {/* Chart line */}
          {chartData.length > 0 && (() => {
            const maxPrice = Math.max(...chartData.map(d => d.predictedPrice));
            const minPrice = Math.min(...chartData.map(d => d.predictedPrice));
            const priceRange = maxPrice - minPrice;
            const chartWidth = 700;
            const chartHeight = 220;
            const padding = 60;
            
            const points = chartData.map((item, index) => {
              const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
              const y = padding + ((maxPrice - item.predictedPrice) / priceRange) * (chartHeight - 2 * padding);
              return `${x},${y}`;
            }).join(' ');
            
            return (
              <>
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  points={points}
                />
                {/* Data points */}
                {chartData.map((item, index) => {
                  const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
                  const y = padding + ((maxPrice - item.predictedPrice) / priceRange) * (chartHeight - 2 * padding);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      title={`${item.date}: $${item.predictedPrice.toFixed(2)}`}
                    />
                  );
                })}
              </>
            );
          })()}
        </svg>
      </div>
      
        {/* Chart Footer */}
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Note:</span> This chart shows predicted prices (yhat) from 
            December 2024 to present. The green line represents the mid values of price predictions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
