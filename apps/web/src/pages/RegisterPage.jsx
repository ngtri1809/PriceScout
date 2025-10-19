// @ts-check
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Mock registration for demo
      login(
        { id: '1', email: formData.email, name: formData.name },
        'mock-jwt-token'
      );
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
      maxWidth: '520px',
      width: '100%'
    }}>
      <h2 style={{
        fontWeight: 700,
        fontSize: '2rem',
        color: '#24292e',
        textAlign: 'center',
        marginBottom: '1.3rem'
      }}>
        Create your account
      </h2>

      {error && (
        <div role="alert" style={{
          color: '#b00020',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your name"
            autoComplete="name"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cfd8dc',
              borderRadius: 6,
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="name@example.com"
            autoComplete="email"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cfd8dc',
              borderRadius: 6,
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create a password"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cfd8dc',
              borderRadius: 6,
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Re-enter password"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cfd8dc',
              borderRadius: 6,
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#2265e3' }}>Login here</Link>
      </div>
    </div>
  </div>

  );
}
