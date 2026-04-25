/**
 * MyRuta Web - Login Page
 * 
 * Responsibilities:
 * - Display login form
 * - Handle authentication
 * - Call backend API for login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
      }

      // Call backend API
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Update auth context with token and user
      const authData = {
        token: data.token,
        user: data.user
      };

      // Save to localStorage and update context
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      
      login(authData);

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'CONDUCTOR') {
        navigate('/conductor/tracking');
      } else {
        navigate('/cliente/rutas');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background effect */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}>
      </div>

      {/* Animated corner effects */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-neon-500 opacity-5 rounded-full blur-3xl"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-neon-500 opacity-5 rounded-full blur-3xl"></div>

      <div className="bg-dark-800 rounded-xl shadow-2xl border-2 border-neon-500 p-8 w-full max-w-md relative z-10" style={{ boxShadow: '0 0 30px rgba(0, 255, 65, 0.3)' }}>
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            MyRuta
          </h1>
          <p className="text-neon-500 opacity-70" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.4)' }}>
            Sistema de Monitoreo de Rutas
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-transparent via-neon-500 to-transparent mx-auto"></div>
        </div>

        {error && (
          <div className="bg-dark-700 border-2 border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6" style={{ boxShadow: '0 0 10px rgba(255, 0, 0, 0.2)' }}>
            <p className="text-sm">⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-neon-500 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@myruta.com"
              disabled={loading}
              className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-neon-500 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
                style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-4 top-3 text-neon-500 hover:text-neon-400 disabled:cursor-not-allowed transition"
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 px-4 rounded-lg hover:from-neon-400 hover:to-neon-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
          >
            {loading ? '⏳ Iniciando sesión...' : '🔓 Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-neon-500 hover:text-neon-400 text-sm hover:underline transition" style={{ textShadow: '0 0 5px rgba(0, 255, 65, 0.3)' }}>
            ← Volver a la página principal
          </a>
        </div>
      </div>
    </div>
  );
}
