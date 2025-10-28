import React, { useState } from 'react';
import { apiTester, TestResult } from '../utils/testApi';
import { testBackendConnection } from '../utils/connectionTest';
import { getTokenPreview, hasToken } from '../utils/tokenManager';
import { testDirectLogin } from '../utils/directLoginTest';
import { checkAdminUser } from '../utils/checkAdminUser';
import './ApiTestPanel.css';

const ApiTestPanel: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      // First test backend connection
      console.log('🔍 Testing backend connection...');
      const isBackendAccessible = await testBackendConnection();
      
      if (!isBackendAccessible) {
        console.log('❌ Backend is not accessible. Please check if backend is running.');
        setResults([{
          service: 'Connection',
          test: 'Backend Connection',
          success: false,
          error: 'Backend is not accessible. Please check if backend is running on https://localhost:7210'
        }]);
        return;
      }

      // Check if token exists in localStorage
      const existingToken = localStorage.getItem('authToken');
      if (existingToken) {
        console.log('🔑 Found existing token in localStorage');
        console.log('Token preview:', existingToken.substring(0, 50) + '...');
      }

      // Check if admin user exists
      console.log('🔍 Checking if admin user exists...');
      const adminExists = await checkAdminUser();
      
      if (!adminExists) {
        console.log('❌ Admin user not found in database');
        setResults([{
          service: 'Authentication',
          test: 'Admin User Check',
          success: false,
          error: 'Admin user not found in database. Please create admin user first.'
        }]);
        return;
      }

      console.log('✅ Admin user exists - testing direct login...');
      
      // Test direct login first
      const directLoginResult = await testDirectLogin();
      
      if (!directLoginResult) {
        console.log('❌ Direct login failed');
        setResults([{
          service: 'Authentication',
          test: 'Direct Login',
          success: false,
          error: 'Direct login failed. Check backend connection and credentials.'
        }]);
        return;
      }

      console.log('✅ Direct login successful - testing API calls...');
      
      // Run full API tests
      const testResults = await apiTester.runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const totalCount = results.length;


  return (
    <div className="api-test-panel">
      <div className="test-header">
        <h2>🧪 API Test Panel</h2>
        <div className="test-actions">
          <button 
            onClick={runTests} 
            disabled={loading}
            className="run-tests-btn"
          >
            {loading ? 'Duke testuar...' : 'Testo API-t'}
          </button>
          {results.length > 0 && (
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="toggle-details-btn"
            >
              {showDetails ? 'Fshih Detajet' : 'Shfaq Detajet'}
            </button>
          )}
        </div>
      </div>

      {/* Auto-Login Status */}
      <div className="auto-login-section">
        <h3>🔐 Authentication Status</h3>
        <div className="login-info">
          <p><strong>Status:</strong> {hasToken() ? '✅ Authenticated' : '❌ Not authenticated'}</p>
          {hasToken() && (
            <p><strong>Token:</strong> {getTokenPreview()}</p>
          )}
        </div>
        <p className="auto-login-note">
          🔄 Frontend-i do të bëjë login automatikisht kur të klikosh "Testo API-t"
        </p>
      </div>

      {results.length > 0 && (
        <div className="test-summary">
          <div className="summary-stats">
            <div className="stat-item success">
              <span className="stat-number">{successCount}</span>
              <span className="stat-label">Sukses</span>
            </div>
            <div className="stat-item failure">
              <span className="stat-number">{failureCount}</span>
              <span className="stat-label">Dështim</span>
            </div>
            <div className="stat-item total">
              <span className="stat-number">{totalCount}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          
          <div className="summary-message">
            {failureCount === 0 ? (
              <span className="success-message">🎉 Të gjitha testet kaluan me sukses!</span>
            ) : (
              <span className="warning-message">
                ⚠️ {failureCount} test dështuan. Kontrolloni lidhjen me serverin.
              </span>
            )}
          </div>
        </div>
      )}

      {showDetails && results.length > 0 && (
        <div className="test-details">
          <h3>Detajet e Testeve</h3>
          <div className="test-results">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`test-result ${result.success ? 'success' : 'failure'}`}
              >
                <div className="test-info">
                  <span className="test-service">{result.service}</span>
                  <span className="test-name">{result.test}</span>
                  {result.data !== undefined && (
                    <span className="test-data">({result.data} items)</span>
                  )}
                </div>
                {result.error && (
                  <div className="test-error">{result.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="test-info-panel">
        <h3>ℹ️ Informacion për Testet</h3>
        <ul>
          <li><strong>Authentication:</strong> Teston login dhe register endpoints</li>
          <li><strong>Rooms:</strong> Teston marrjen e dhomave nga API</li>
          <li><strong>Products:</strong> Teston marrjen e produkteve dhe kategorive</li>
          <li><strong>Payments:</strong> Teston marrjen e pagesave</li>
          <li><strong>Supply & Sell:</strong> Teston marrjen e stokut</li>
        </ul>
        <p className="note">
          <strong>Shënim:</strong> Nëse testet dështojnë, kontrolloni që backend serveri të jetë i ndezur 
          dhe të jetë i aksesueshëm në URL-në e konfiguruar në <code>api.ts</code>.
        </p>
      </div>
    </div>
  );
};

export default ApiTestPanel;
