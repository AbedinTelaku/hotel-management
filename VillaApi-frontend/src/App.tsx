import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import RoomGrid from './components/RoomGrid';
import AdminDashboard from './components/AdminDashboard';
import TestComponents from './components/TestComponents';
import ConnectionTest from './components/ConnectionTest';
import StockView from './components/StockView';
import SimpleMarket from './components/SimpleMarket';
import StaffView from './components/StaffView';
import ChangePassword from './components/ChangePassword';
import { authService } from './services';
import './App.css';

interface User {
  email: string;
  name: string;
  role?: 'admin' | 'worker';
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('🔍 Checking auth status, token exists:', !!token);
        
        if (token && authService.isAuthenticated()) {
          // Token exists, try to get user info from token
          try {
            // Try to decode token to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.unique_name || payload.name || payload.username || 'user';
            
            console.log('🔍 Token payload:', payload);
            console.log('🔍 Username from token:', username);
            console.log('🔍 isAdmin claim:', payload.isAdmin);
            
            // SECURITY FIX: Only determine role from token claims, not username
            let role: 'admin' | 'worker' = 'worker';
            // Only trust the isAdmin claim from the token, not username
            if (payload.isAdmin === 'True' || payload.isAdmin === true || payload.isAdmin === 'true') {
              role = 'admin';
              console.log('✅ Role set to admin from token');
            } else {
              console.log('✅ Role set to worker from token');
            }
            
            setUser({ 
              email: username, 
              name: username, 
              role: role 
            });
            console.log('✅ User authenticated with existing token:', { username, role, isAdmin: payload.isAdmin });
          } catch (tokenError) {
            console.error('❌ Error decoding token:', tokenError);
            // Clear invalid token and logout
            authService.logout();
            setUser(null);
          }
        } else {
          console.log('ℹ️ No valid token found, user not authenticated');
        }
      } catch (error) {
        console.error('❌ Error checking authentication:', error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData: User) => {
    // SECURITY FIX: Only use the role provided by the backend, don't guess from username
    let role: User['role'] = 'worker';
    if (userData.role) {
      role = userData.role;
    }
    // Remove dangerous username-based role detection
    setUser({ ...userData, role });
  };

  const handleLogout = () => {
    console.log('🚪 Logging out user...');
    authService.logout();
    setUser(null);
    // Force clear any cached state
    localStorage.removeItem('authToken');
    console.log('✅ User logged out completely');
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Duke ngarkuar aplikacionin...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {user && (
          <nav className="navbar">
            <div className="navbar-content">
              <h2>Motel Management System</h2>
              <div className="navbar-user">
                <span>Mirë se vini, {user.name}!</span>
                <span className="user-role">
                  {user.role === 'admin' ? '🛡️ Administrator' : '👷 Punëtor'}
                </span>
                <button onClick={handleLogout} className="logout-button">
                  Dil
                </button>
              </div>
            </div>
          </nav>
        )}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/rooms" replace /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/rooms" replace /> : 
              <Register onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/rooms" 
            element={
              user ? <RoomGrid userRole={user.role as 'admin' | 'worker'} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/admin" 
            element={
              user && user.role === 'admin' ? 
                <AdminDashboard onBack={() => window.history.back()} /> : 
                <Navigate to="/rooms" replace />
            } 
          />
          <Route 
            path="/stock" 
            element={
              user ? 
                <StockView onBack={() => window.location.href = '/rooms'} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/market"
            element={
              user ? 
                <SimpleMarket onBack={() => window.history.back()} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/market-staff"
            element={
              user && user.role === 'worker' ? 
                <SimpleMarket onBack={() => window.history.back()} isForStaff={true} /> : 
                <Navigate to="/rooms" replace />
            } 
          />
          <Route 
            path="/change-password"
            element={
              user && user.role === 'worker' ? 
                <ChangePassword onBack={() => window.history.back()} /> : 
                <Navigate to="/rooms" replace />
            } 
          />
          <Route 
            path="/staff" 
            element={
              isLoading ? (
                <div className="app">
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Duke ngarkuar...</p>
                  </div>
                </div>
              ) : user && user.role === 'admin' ? 
                <StaffView onBack={() => window.history.back()} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/test" 
            element={<TestComponents userRole={user?.role} />} 
          />
          <Route 
            path="/connection-test" 
            element={<ConnectionTest />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/rooms" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
