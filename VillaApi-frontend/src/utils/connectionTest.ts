// Simple connection test to check if backend is accessible
export const testBackendConnection = async () => {
  try {
    const response = await fetch('/api/TestConnection'); // Use proxy endpoint
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is accessible:', data.data);
      return true;
    } else {
      console.log('❌ Backend returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error);
    return false;
  }
};

// Test API endpoint without authentication
export const testApiEndpoint = async (endpoint: string) => {
  try {
    const response = await fetch(`/api${endpoint}`);
    console.log(`Testing ${endpoint}:`, response.status, response.statusText);
    return response;
  } catch (error) {
    console.log(`Error testing ${endpoint}:`, error);
    return null;
  }
};
