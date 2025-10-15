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
	  const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
	  const results = await response.json();
      setResults(results);
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
			<div className="w-4 h-4 bg-gray-100 flex item-center justify-center rounded-md overflow-hidden">
				<img className="w-full h-full object-contain" src={item.thumbnail}/>
				</div>
              <h3 className="text-lg font-medium">{item.name}</h3>
			  <p className="text-lg font-medium">Source: {item.source}</p>
              <p className="text-gray-600">SKU: {item.sku ?? 'N/A'}</p>
              <p className="text-green-600 font-semibold">Price: ${item.price ?? 'N/A'}</p>
              <p className="text-green-600 font-semibold">Rating: {item.rating ?? 'N/A'}</p>
             <p className="text-green-600 font-semibold">Reviews: {item.reviews ?? 'N/A'}</p>
              <div className="mt-2 space-x-2">
                <a 
                  href={item.product_link}
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
