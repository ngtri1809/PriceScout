// @ts-check
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { ApiClient } from '../lib/api-client.js';

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      apiClient.setAccessToken(token);
    }
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      
      // If mock token, load from localStorage
      if (!token || token === 'mock-jwt-token') {
        const localWatchlist = localStorage.getItem('mockWatchlist');
        if (localWatchlist) {
          try {
            setWatchlist(JSON.parse(localWatchlist));
          } catch (e) {
            setWatchlist([]);
          }
        } else {
          setWatchlist([]);
        }
        setLoading(false);
        return;
      }
      
      // Real API call
      const data = await apiClient.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
      // If it's an auth error, try loading from localStorage
      if (err.status === 401 || err.status === 403) {
        const localWatchlist = localStorage.getItem('mockWatchlist');
        if (localWatchlist) {
          try {
            setWatchlist(JSON.parse(localWatchlist));
          } catch (e) {
            setWatchlist([]);
          }
        } else {
          setWatchlist([]);
        }
        setError('');
      } else {
        setError('Failed to load watchlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (itemId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // If mock token, remove from localStorage
      if (!token || token === 'mock-jwt-token') {
        const updated = watchlist.filter(item => item.item_id !== itemId);
        setWatchlist(updated);
        localStorage.setItem('mockWatchlist', JSON.stringify(updated));
        return;
      }
      
      await apiClient.removeFromWatchlist(itemId);
      setWatchlist(prev => prev.filter(item => item.item_id !== itemId));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
      // If auth error, still remove from local state
      if (err.status === 401 || err.status === 403) {
        const updated = watchlist.filter(item => item.item_id !== itemId);
        setWatchlist(updated);
        localStorage.setItem('mockWatchlist', JSON.stringify(updated));
      } else {
        setError('Failed to remove item. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Please log in to view your watchlist</p>
          <a 
            href="/login"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
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
                  {item.category && (
                    <p className="text-gray-600 mb-2">Category: {item.category}</p>
                  )}
                  {item.current_price ? (
                    <p className="text-green-600 font-bold text-lg">
                      Current Price: ${parseFloat(item.current_price).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-lg">Price not available</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Added: {new Date(item.added_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <a 
                    href={`/item/${item.item_id}`}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    View Details
                  </a>
                  <button
                    onClick={() => removeFromWatchlist(item.item_id)}
                    className="text-red-500 hover:text-red-600 text-sm text-left"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex space-x-4">
                  <a
                    href={`/predict`}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 text-sm inline-block"
                  >
                    Get Price Prediction
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
