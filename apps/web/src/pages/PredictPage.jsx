import { useState, useEffect } from 'react';
import { ApiClient } from '../lib/api-client';

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

// List of all 17 products available for prediction
const PRODUCTS = [
  'Heart Chalkboard',
  'alarm clock bakelike green',
  'alarm clock bakelike red',
  'Cake Cases',
  'Glass Hanging T Light',
  'hand warmer red',
  'Jam Making Set',
  'Jumbo Bag Red',
  'Jumbo Storage Bag Suki',
  'Lunch Bag Cars Blue',
  'Lunch Bag Pink Polkadot',
  'Lunch Bag Red Retrospot',
  'Lunch Bag Spaceboy Design',
  'Party Bunting',
  'White Hanging t-light Holder',
  'Wooden Picture Frame',
  'Woodland Charlotte Bag'
];

export default function PredictPage() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate date options (1-31)
  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Generate month options (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate year options (2024-2025, with limited 2026 dates)
  const yearOptions = [2024, 2025, 2026];

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setPrediction(null);
    setError('');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setPrediction(null);
    setError('');
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setPrediction(null);
    setError('');
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setPrediction(null);
    setError('');
  };

  const handlePredict = async () => {
    if (!selectedProduct || !selectedDate || !selectedMonth) {
      setError('Please select a product, date, and month');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.request(
        `/prophet/forecast?productName=${encodeURIComponent(selectedProduct)}&date=${selectedDate}&month=${selectedMonth}&year=${selectedYear}`
      );
      
      setPrediction(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Price Predictions
        </h1>
        <p className="text-xl text-gray-600">
          Get Prophet-powered price forecasts for your products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Select Product
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {PRODUCTS.map((product) => (
              <button
                key={product}
                onClick={() => handleProductSelect(product)}
                className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                  selectedProduct === product
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{product}</span>
              </button>
            ))}
          </div>

          {selectedProduct && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Selected:</span> {selectedProduct}
              </p>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Select Date
          </h2>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Note:</span> Forecast data is available from December 2024 to November 2026.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Month</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Date</option>
                {dateOptions.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading || !selectedProduct || !selectedDate || !selectedMonth || !selectedYear}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Getting Prediction...' : 'Get Price Prediction'}
            </button>
          </div>
        </div>
      </div>

      {/* Prediction Results */}
      {(prediction || error) && (
        <div className="mt-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  {error.includes('No forecast data found') && (
                    <div className="mt-3 p-3 bg-red-100 rounded-md">
                      <p className="text-sm text-red-800 font-medium">Available Date Range:</p>
                      <p className="text-sm text-red-700">
                        The forecast data is only available from 2024-12-01 to 2026-11-04.
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Please select a date within this range.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {prediction && prediction.success && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Price Prediction Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Product Information</h4>
                    <p className="text-gray-600">
                      <span className="font-medium">Product:</span> {prediction.productName}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Date:</span> {prediction.requestedDate}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Predicted Price</h4>
                    <p className="text-3xl font-bold text-blue-900">
                      {formatCurrency(prediction.forecast.yhat)}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Confidence interval: {formatCurrency(prediction.forecast.yhat_lower)} - {formatCurrency(prediction.forecast.yhat_upper)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Lower Bound</h4>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(prediction.forecast.yhat_lower)}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Conservative estimate
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Upper Bound</h4>
                    <p className="text-2xl font-bold text-orange-900">
                      {formatCurrency(prediction.forecast.yhat_upper)}
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Optimistic estimate
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Prediction Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Date:</span> {prediction.forecast.ds}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Prediction Range:</span> 
                    <span className="ml-1">
                      {formatCurrency(prediction.forecast.yhat_upper - prediction.forecast.yhat_lower)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
