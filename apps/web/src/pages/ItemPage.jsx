// @ts-check
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ApiClient } from '../lib/api-client.js';

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

export default function ItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      apiClient.setAccessToken(token);
    }
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      // For now, use mock data since items API might not be fully implemented
      // In production, you'd fetch from: const data = await apiClient.getItem(id);
      const mockItem = {
        id: id,
        name: 'PlayStation 5 Console',
        sku: 'PS5-001',
        description: 'Next-generation gaming console with 4K gaming and ray tracing',
        category: 'Gaming',
        price: 499.99
      };
      
      setItem(mockItem);
      
      // Check if item is in watchlist
      if (user) {
        try {
          const watchlist = await apiClient.getWatchlist();
          setIsInWatchlist(watchlist.some(w => w.item_id === parseInt(id)));
        } catch (err) {
          // Ignore watchlist check errors
        }
      }
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Failed to load item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToWatchlist(true);
      setError('');
      await apiClient.addToWatchlist(parseInt(id));
      setIsInWatchlist(true);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      if (err.detail && err.detail.includes('already')) {
        setIsInWatchlist(true);
      } else {
        setError('Failed to add to watchlist. Please try again.');
      }
    } finally {
      setAddingToWatchlist(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!item) {
    return <div className="text-center py-8">Item not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4">{item.name}</h1>
        <p className="text-gray-600 mb-2">SKU: {item.sku}</p>
        <p className="text-gray-600 mb-4">Category: {item.category}</p>
        <p className="text-lg mb-6">{item.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Price Information</h2>
            <div className="text-3xl font-bold text-green-600 mb-4">
              ${item.price}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              {isInWatchlist ? (
                <a
                  href="/watchlist"
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 inline-block text-center"
                >
                  View in Watchlist
                </a>
              ) : (
                <button
                  onClick={handleAddToWatchlist}
                  disabled={addingToWatchlist}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {addingToWatchlist ? 'Adding...' : 'Add to Watchlist'}
                </button>
              )}
              <a
                href="/predict"
                className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 inline-block text-center"
              >
                Get Price Prediction
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-gray-600">Price history chart would be displayed here using Recharts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
