// @ts-check
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock login for demo
      if (email === 'test@example.com' && password === 'password') {
        login(
          { id: '1', email, name: 'Test User' },
          'mock-jwt-token'
        );
        navigate('/');
      } else {
        setError('Invalid credentials. Use test@example.com / password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
   <div style={{
  background: '#dbfae4',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <div style={{
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 6px 24px rgba(38, 46, 67, 0.08)',
    padding: '2rem',
    maxWidth: '420px',
    width: '100%'
  }}>
    <h2 style={{
      fontWeight: 700,
      fontSize: '2rem',
      color: '#24292e',
      textAlign: 'center',
      marginBottom: '1.3rem'
    }}>Login to PriceScout</h2>

    {error && (
      <div style={{color: '#b00020', marginBottom: '1rem', textAlign: 'center'}}>
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <div style={{marginBottom: '0.75rem'}}>
        <label htmlFor="email" style={{
          display: 'block',
          marginBottom: 5,
          fontWeight: 500
        }}>Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #cfd8dc',
            borderRadius: 6,
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
          placeholder="name@example.com"
        />
      </div>

      <div style={{marginBottom: '1rem'}}>
        <label htmlFor="password" style={{
          display: 'block',
          marginBottom: 5,
          fontWeight: 500
        }}>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #cfd8dc',
            borderRadius: 6,
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
          placeholder="Enter password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.7rem',
          background: '#2265e3',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: '1.08rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '0.75rem'
        }}
      >
        {loading ? 'Signing in...' : 'Login'}
      </button>
    </form>

    <div style={{
      textAlign: 'center',
      marginTop: '0.5rem',
      fontSize: '1rem'
    }}>
      Don't have an account?{' '}
      <Link style={{color: '#2265e3'}} to="/register">Register here</Link>
    </div>
  </div>
</div>


  );
}
