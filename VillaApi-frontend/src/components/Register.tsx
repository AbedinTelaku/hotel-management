import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { ApiError } from '../services/api';
import './Auth.css';

interface RegisterProps {
  onLogin: (user: { email: string; name: string; role?: 'admin' | 'worker' }) => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!username || !password || !confirmPassword) {
      setError('Ju lutem plotësoni të gjitha fushat');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Fjalëkalimi duhet të ketë të paktën 6 karaktere');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({ username, password });
      
      if (response.isSuccessfull && response.data) {
        // Backend now returns token directly as a string in response.data
        const token = typeof response.data === 'string' ? response.data : response.data.token;
        if (token && typeof token === 'string' && token.length > 0) {
          console.log('🔐 Setting token from registration:', token.substring(0, 50) + '...');
          authService.setToken(token);
        }
        
        // SECURITY FIX: Don't determine role from username - let backend decide
        // Role should be determined by backend based on actual user permissions
        const role = 'worker'; // Default to worker, backend will set admin if needed
        
        onLogin({ 
          email: username, 
          name: username,
          role 
        });
        navigate('/rooms');
      } else {
        setError(response.errorMessage || 'Regjistrimi dështoi');
      }
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në lidhje me serverin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Regjistrohuni</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Përdoruesi:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Shkruani emrin e përdoruesit"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Fjalëkalimi:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Shkruani fjalëkalimin"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmoni Fjalëkalimin:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmoni fjalëkalimin"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Duke u regjistruar...' : 'Regjistrohuni'}
          </button>
        </form>

        <p className="auth-switch">
          Keni llogari? <a href="/login">Hyni</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
