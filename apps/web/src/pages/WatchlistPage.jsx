// @ts-check
import { useState, useEffect } from 'react';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock watchlist data
    const mockWatchlist = [
      {
        id: '1',
        name: 'PlayStation 5 Console',
        sku: 'PS5-001',
        currentPrice: 499.99,
        addedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'iPhone 15 Pro',
        sku: 'IPHONE-15-001',
        currentPrice: 999.99,
        addedAt: '2024-01-14T15:30:00Z'
      }
    ];
    
    setWatchlist(mockWatchlist);
    setLoading(false);
  }, []);

  const removeFromWatchlist = (itemId) => {
    setWatchlist(prev => prev.filter(item => item.id !== itemId));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      
      {watchlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your watchlist is empty</p>
          <a 
            href="/search"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Start Adding Items
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {watchlist.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">SKU: {item.sku}</p>
                  <p className="text-green-600 font-bold text-lg">
                    Current Price: ${item.currentPrice}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Added: {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <a 
                    href={`/item/${item.id}`}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    View Details
                  </a>
                  <a 
                    href={`/compare?sku=${item.sku}`}
                    className="text-green-500 hover:text-green-600 text-sm"
                  >
                    Compare Prices
                  </a>
                  <button
                    onClick={() => removeFromWatchlist(item.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex space-x-4">
                  <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 text-sm">
                    Get Price Prediction
                  </button>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm">
                    Set Price Alert
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
