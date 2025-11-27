import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">PriceScout</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-sm text-gray-500 hover:text-gray-700">Home</a>
                <a href="/search" className="text-sm text-gray-500 hover:text-gray-700">Search</a>
                <a href="/predict" className="text-sm text-gray-500 hover:text-gray-700">Predict</a>
                <a href="/about" className="text-sm text-gray-500 hover:text-gray-700">About Us</a>
                {user && (
                  <a href="/watchlist" className="text-sm text-gray-500 hover:text-gray-700">Watchlist</a>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">Welcome, {user.name || user.email}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                    Login
                  </a>
                  <a href="/register" className="text-sm text-gray-500 hover:text-gray-700">
                    Register
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}