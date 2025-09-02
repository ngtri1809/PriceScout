// @ts-check
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock item data
    const mockItem = {
      id: id,
      name: 'PlayStation 5 Console',
      sku: 'PS5-001',
      description: 'Next-generation gaming console with 4K gaming and ray tracing',
      category: 'Gaming',
      price: 499.99
    };
    
    setItem(mockItem);
    setLoading(false);
  }, [id]);

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
            <a 
              href={`/compare?sku=${item.sku}`}
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Compare Prices
            </a>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
                Add to Watchlist
              </button>
              <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600">
                Get Price Prediction
              </button>
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
