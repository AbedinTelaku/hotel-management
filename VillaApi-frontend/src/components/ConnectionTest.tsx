import React, { useState } from 'react';
import { testBackendConnection, testApiEndpoint } from '../utils/connectionTest';
import { authService } from '../services';

const ConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runConnectionTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addResult('🚀 Starting connection tests...');

    try {
      // Test 1: Basic connection
      addResult('📡 Testing basic backend connection...');
      const connectionTest = await testBackendConnection();
      if (connectionTest) {
        addResult('✅ Backend connection successful!');
      } else {
        addResult('❌ Backend connection failed!');
      }

      // Test 2: Test various endpoints
      const endpoints = ['/TestConnection', '/Users'];
      
      for (const endpoint of endpoints) {
        addResult(`🔍 Testing endpoint: ${endpoint}`);
        const response = await testApiEndpoint(endpoint);
        if (response) {
          addResult(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
        } else {
          addResult(`❌ ${endpoint}: Failed to connect`);
        }
      }

      // Test 3: Try login with test credentials
      addResult('🔐 Testing authentication...');
      try {
        // Use generic test credentials instead of hardcoded admin/admin
        const loginResponse = await authService.login({ username: 'test', password: 'test' });
        if (loginResponse.isSuccessfull) {
          addResult('✅ Authentication test successful!');
          addResult(`🎫 Token received: ${loginResponse.data?.token?.substring(0, 50)}...`);
        } else {
          addResult('⚠️ Authentication test failed (this is normal if test user doesn\'t exist)');
        }
      } catch (error) {
        addResult('⚠️ Authentication test failed (this is normal if test user doesn\'t exist)');
      }

    } catch (error) {
      addResult(`💥 Test error: ${error}`);
    } finally {
      setIsLoading(false);
      addResult('🏁 Tests completed!');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 Connection Test Panel</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runConnectionTests} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? '🔄 Running Tests...' : '🚀 Run Connection Tests'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Results
        </button>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        padding: '15px',
        minHeight: '300px',
        fontFamily: 'monospace',
        fontSize: '14px',
        overflowY: 'auto'
      }}>
        {testResults.length === 0 ? (
          <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
            Click "Run Connection Tests" to start testing the backend connection...
          </div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {result}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h4>📋 Test Information:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Backend URL:</strong> https://localhost:7210</li>
          <li><strong>Frontend URL:</strong> http://localhost:5173</li>
          <li><strong>Proxy:</strong> Enabled (development mode)</li>
          <li><strong>Note:</strong> Use valid credentials for authentication testing</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;
