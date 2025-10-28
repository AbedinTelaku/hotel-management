// API Configuration
export const API_CONFIG = {
  // Development configuration
  development: {
    baseURL: '/api', // Use proxy
    timeout: 10000,
  },
  // Production configuration
  production: {
    baseURL: 'https://localhost:7210/api', // Direct backend URL
    timeout: 10000,
  }
};

// Get current environment
const isDevelopment = import.meta.env.DEV;

// Export current configuration
export const CURRENT_API_CONFIG = isDevelopment 
  ? API_CONFIG.development 
  : API_CONFIG.production;

export const API_BASE_URL = CURRENT_API_CONFIG.baseURL;
