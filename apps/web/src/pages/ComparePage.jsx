// @ts-check
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const sku = searchParams.get('sku') || '';
  const [query, setQuery] = useState(sku);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Mock comparison data
      const mockComparison = {
        item: {
          name: 'PlayStation 5 Console',
          sku: query
        },
        totalCosts: [
          {
            marketplaceId: 'amazon',
            totalCost: 499.99,
            price: 499.99,
            shipping: 0,
            tax: 40.00,
            availability: true
          },
          {
            marketplaceId: 'ebay',
            totalCost: 474.99,
            price: 474.99,
            shipping: 9.99,
            tax: 38.00,
            availability: true
          },
          {
            marketplaceId: 'amazon-warehouse',
            totalCost: 424.99,
            price: 424.99,
            shipping: 5.99,
            tax: 34.00,
            availability: true
          }
        ]
      };
      
      setComparison(mockComparison);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Compare Prices</h1>
      
      <form onSubmit={handleCompare} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter product SKU..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      </form>

      {comparison && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Price Comparison for {comparison.item.name}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Marketplace</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-right py-3 px-4">Shipping</th>
                  <th className="text-right py-3 px-4">Tax</th>
                  <th className="text-right py-3 px-4 font-bold">Total</th>
                  <th className="text-center py-3 px-4">Availability</th>
                </tr>
              </thead>
              <tbody>
                {comparison.totalCosts.map((offer, index) => (
                  <tr key={offer.marketplaceId} className={`border-b ${index === 0 ? 'bg-green-50' : ''}`}>
                    <td className="py-3 px-4 font-medium">
                      {offer.marketplaceId}
                      {index === 0 && <span className="ml-2 text-green-600 font-bold">(Best Deal)</span>}
                    </td>
                    <td className="text-right py-3 px-4">${offer.price.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${offer.shipping.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${offer.tax.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-bold text-lg">
                      ${offer.totalCost.toFixed(2)}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        offer.availability 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.availability ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> The best deal is highlighted in green. 
              Prices are updated in real-time and may vary based on availability.
            </p>
          </div>
        </div>
      )}

      {query && !comparison && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No comparison data available for "{query}"</p>
        </div>
      )}
    </div>
  );
}
