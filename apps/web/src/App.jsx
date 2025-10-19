import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from './hooks/useAuth.jsx';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ItemPage from './pages/ItemPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import WatchlistPage from './pages/WatchlistPage.jsx';
import PredictPage from './pages/PredictPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ItemPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="item/:id" element={<ItemPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="predict" element={<PredictPage />} />
              <Route 
                path="watchlist" 
                element={
                  <ProtectedRoute>
                    <WatchlistPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;