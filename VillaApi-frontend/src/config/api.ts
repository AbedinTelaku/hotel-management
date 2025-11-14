// API Configuration
export const API_CONFIG = {
  // Development configuration
  development: {
    baseURL: 'http://192.168.1.5:8085/api', // Use proxy
    hubURL: 'http://192.168.1.5:8085/roomshub',
    timeout: 10000
  },
  // Production configuration
  production: {
    baseURL: 'http://192.168.1.5:8085/api', // Direct backend URL
    hubURL: 'http://192.168.1.5:8085/roomshub',
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

export const API_HUB_URL = CURRENT_API_CONFIG.hubURL;
