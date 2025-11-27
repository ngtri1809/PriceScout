// @ts-check
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { ApiClient } from '../lib/api-client.js';

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState(new Set());
  const [addingItems, setAddingItems] = useState(new Set());
  const { user } = useAuth();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/search?q=${encodeURIComponent(query)}`
      );
      const results = await response.json();
      setResults(results);
      
      // Load watchlist items if user is logged in
      if (user) {
        loadWatchlistItems();
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlistItems = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || token === 'mock-jwt-token') {
        // Load from localStorage for mock auth
        const mockWatchlist = JSON.parse(localStorage.getItem('mockWatchlist') || '[]');
        const itemNames = new Set(mockWatchlist.map(item => item.name?.toLowerCase()));
        setWatchlistItems(itemNames);
        return;
      }
      
      apiClient.setAccessToken(token);
      const watchlist = await apiClient.getWatchlist();
      // Create a set of item names to check against search results
      const itemNames = new Set(watchlist.map(item => item.name?.toLowerCase()));
      setWatchlistItems(itemNames);
    } catch (err) {
      // Silently fail - watchlist check is optional
      console.error('Failed to load watchlist items:', err);
    }
  };

  const handleAddToWatchlist = async (item) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      setAddingItems(prev => new Set(prev).add(item.id || item.name));
      const token = localStorage.getItem('accessToken');
      
      if (!token || token === 'mock-jwt-token') {
        // For mock auth, add to localStorage
        const mockWatchlist = JSON.parse(localStorage.getItem('mockWatchlist') || '[]');
        const newItem = {
          id: Date.now(), // Temporary ID
          item_id: Date.now(),
          name: item.name,
          description: item.description || null,
          category: item.category || null,
          image_url: item.thumbnail,
          current_price: item.price,
          added_at: new Date().toISOString()
        };
        
        // Check if already exists
        const exists = mockWatchlist.some(w => w.name === item.name);
        if (!exists) {
          mockWatchlist.push(newItem);
          localStorage.setItem('mockWatchlist', JSON.stringify(mockWatchlist));
          setWatchlistItems(prev => new Set(prev).add(item.name?.toLowerCase()));
        }
        
        setAddingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id || item.name);
          return newSet;
        });
        return;
      }
      
      apiClient.setAccessToken(token);
      
      // Send itemData to create item in database if it doesn't exist
      await apiClient.addToWatchlist(null, {
        name: item.name,
        description: item.description || null,
        category: item.category || null,
        thumbnail: item.thumbnail,
        price: item.price,
        source: item.source,
        product_link: item.product_link
      });
      
      // Reload watchlist items to update the UI
      await loadWatchlistItems();
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      alert(err.detail || err.message || 'Failed to add to watchlist. Please try again.');
    } finally {
      setAddingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id || item.name);
        return newSet;
      });
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
          {results.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                <img className="w-full h-full object-contain" src={item.thumbnail} alt={item.name}/>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-medium">{item.name}</h3>				  
                  <p>
                    <span className="text-gray-600">from</span>
                    <span className="text-lg font-medium"> {item.source}</span>
                  </p>

                  <p>
                    <span className="text-gray-600 font-semibold">Price: </span>
                    <span className="text-green-600 font-semibold"> ${item.price ?? 'N/A'} </span>
                  </p>

                  <p>
                    <span className="text-gray-600 font-semibold">Rating: </span>
                    <span className="text-yellow-500 font-semibold"> {item.rating != null ? item.rating.toFixed(1) : 'N/A'} </span>
                    <span className="text-gray-600 italic"> ({item.reviews ?? '0'} reviews) </span>
                  </p>
                </div>

                <div className="mt-2 flex gap-4 items-center">
                  <a
                    href={item.product_link}
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    Product Source
                  </a>
                  {user && (
                    <button
                      onClick={() => handleAddToWatchlist(item)}
                      disabled={addingItems.has(item.id || item.name) || watchlistItems.has(item.name?.toLowerCase())}
                      className={`px-4 py-1 rounded-md text-sm ${
                        watchlistItems.has(item.name?.toLowerCase())
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      } disabled:opacity-50`}
                    >
                      {addingItems.has(item.id || item.name)
                        ? 'Adding...'
                        : watchlistItems.has(item.name?.toLowerCase())
                        ? 'In Watchlist'
                        : 'Add to Watchlist'}
                    </button>
                  )}
                </div>
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
