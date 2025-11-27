export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to PriceScout
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Intelligent Price Tracking & AI-Powered Predictions
        </p>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto">
          Make smarter purchasing decisions with real-time price tracking, 
          marketplace comparisons, and Prophet-powered price forecasts.
        </p>
      </div>

      {/* What is PriceScout */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">What is PriceScout?</h2>
        <p className="text-gray-700 text-lg mb-4">
          PriceScout is an intelligent price tracking platform that helps you find the best deals 
          and predict future prices using advanced machine learning. Whether you're shopping for 
          electronics, home goods, or everyday items, PriceScout provides you with the insights 
          you need to make informed purchasing decisions.
        </p>
        <p className="text-gray-700 text-lg">
          Our platform aggregates prices from multiple marketplaces, tracks historical price data, 
          and uses Facebook's Prophet algorithm to forecast future price trends, helping you know 
          when to buy and when to wait.
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">How PriceScout Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-3">1</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Search Products</h3>
            <p className="text-gray-700">
              Use our search feature to find products across multiple marketplaces including 
              Amazon, eBay, and Google Shopping. Get real-time prices and product information 
              from various sources.
            </p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-4xl font-bold text-green-600 mb-3">2</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Track & Monitor</h3>
            <p className="text-gray-700">
              Add products to your watchlist to monitor price changes over time. Get notified 
              when prices drop or when it's the best time to buy based on historical trends.
            </p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-4xl font-bold text-purple-600 mb-3">3</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Predictions</h3>
            <p className="text-gray-700">
              Leverage AI-powered price predictions using Prophet forecasting. See predicted 
              prices for future dates with confidence intervals, helping you plan your purchases 
              strategically.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Marketplace Search</h3>
              <p className="text-gray-700">
                Search across Amazon, eBay, and Google Shopping simultaneously to find the best prices.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Watchlist</h3>
              <p className="text-gray-700">
                Save products to your watchlist and track price changes over time.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Price Predictions</h3>
              <p className="text-gray-700">
                Get Prophet-powered forecasts with confidence intervals for future price trends.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Historical Price Data</h3>
              <p className="text-gray-700">
                View price history charts to understand pricing patterns and trends.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <a
          href="/search"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Searching Products
        </a>
      </div>
    </div>
  );
}