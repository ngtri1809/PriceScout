// @ts-check
import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Mock search results
      const mockResults = [
        { id: '1', name: 'PlayStation 5 Console', sku: 'PS5-001', price: 499.99 },
        { id: '2', name: 'iPhone 15 Pro', sku: 'IPHONE-15-001', price: 999.99 },
        { id: '3', name: 'NVIDIA GeForce RTX 4090', sku: 'RTX-4090-001', price: 1599.99 },
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.sku.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Products</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>
          {results.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium">{item.name}</h3>
              <p className="text-gray-600">SKU: {item.sku}</p>
              <p className="text-green-600 font-semibold">${item.price}</p>
              <div className="mt-2 space-x-2">
                <a 
                  href={`/item/${item.id}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Details
                </a>
                <a 
                  href={`/compare?sku=${item.sku}`}
                  className="text-green-500 hover:text-green-600"
                >
                  Compare Prices
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
