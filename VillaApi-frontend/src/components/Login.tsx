import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services';
import { ApiError } from '../services/api';
import './Auth.css';

interface LoginProps {
  onLogin: (user: { email: string; name: string; role?: 'admin' | 'worker' }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!username || !password) {
      setError('Ju lutem plotësoni të gjitha fushat');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login({ username, password });
      
      if (response.isSuccessfull && response.data) {
        // SECURITY FIX: Get role from token claims first, then verify with API
        let role: 'admin' | 'worker' = 'worker';
        
        // First, try to get role from token claims
        try {
          const payload = JSON.parse(atob(response.data.split('.')[1]));
          console.log('🔍 Token payload:', payload);
          
          if (payload.isAdmin === 'True' || payload.isAdmin === true || payload.isAdmin === 'true') {
            role = 'admin';
            console.log('✅ Role set to admin from token claims');
          } else {
            console.log('✅ Role set to worker from token claims');
          }
        } catch (tokenError) {
          console.error('❌ Error decoding token:', tokenError);
          
          // Fallback: Try to get user role from backend API
          try {
            const userResponse = await fetch('https://localhost:7210/api/Users/CheckAdmin', {
              headers: {
                'Authorization': `Bearer ${response.data}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log('🔍 API response:', userData);
              if (userData.isSuccessfull && userData.data?.isAdmin) {
                role = 'admin';
                console.log('✅ Role set to admin from API');
              } else {
                console.log('✅ Role set to worker from API');
              }
            }
          } catch (error) {
            console.error('❌ Error checking admin status:', error);
            // Default to worker if all checks fail
            console.log('⚠️ Defaulting to worker role');
          }
        }
        
        console.log(`🎯 Final role for user ${username}: ${role}`);
        
        onLogin({ 
          email: username, 
          name: username,
          role 
        });
        
        // Redirect to appropriate page based on current route, not role
        if (location.pathname === '/staff') {
          // If trying to access staff page, stay there (admin will see staff, worker will be redirected)
          navigate('/staff');
        } else {
          // Default redirect to rooms for all users
          navigate('/rooms');
        }
      } else {
        setError(response.errorMessage || 'Login i dështuar');
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
        <h2>Hyr në Sistem</h2>
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


          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Duke u kyçur...' : 'Hyr'}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
