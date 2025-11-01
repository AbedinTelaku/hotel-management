// API Configuration and Base Service
import { API_BASE_URL } from '../config/api';

export interface ApiResponse<T = any> {
  isSuccessfull: boolean;
  errorMessage?: string;
  data?: T;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
    console.log('🔧 ApiService initialized with token:', this.token && typeof this.token === 'string' && this.token.length > 0 ? this.token.substring(0, 50) + '...' : 'No token');
  }

  setToken(token: string) {
    if (token && typeof token === 'string' && token.length > 0) {
      this.token = token;
      localStorage.setItem('authToken', token);
      console.log('✅ Token set successfully:', token.substring(0, 50) + '...');
      console.log('✅ Token stored in localStorage:', !!localStorage.getItem('authToken'));
    } else {
      console.error('❌ Invalid token provided to setToken:', token);
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Always get the latest token from localStorage and instance
    const currentToken = localStorage.getItem('authToken') || this.token;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (currentToken && typeof currentToken === 'string' && currentToken.length > 0) {
      headers.Authorization = `Bearer ${currentToken}`;
      console.log('🔑 Using token for request:', currentToken.substring(0, 50) + '...');
    } else {
      console.log('⚠️ No token available for request');
      console.log('localStorage token:', localStorage.getItem('authToken'));
      console.log('instance token:', this.token);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const err: ApiError = {
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
        };
        throw err;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request URL:', url);
      console.error('Request headers:', headers);
      
      // Check if it's a certificate error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('❌ Certificate or connection error. Try accepting the certificate in browser first.');
      }
      
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: (error as any)?.status,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Helper method for form data
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Always get the latest token from localStorage and instance
    const currentToken = localStorage.getItem('authToken') || this.token;
    
    const headers: HeadersInit = {};
    if (currentToken && typeof currentToken === 'string' && currentToken.length > 0) {
      headers.Authorization = `Bearer ${currentToken}`;
      console.log('🔑 Using token for form data request:', currentToken.substring(0, 50) + '...');
    } else {
      console.log('⚠️ No token available for form data request');
      console.log('localStorage token:', localStorage.getItem('authToken'));
      console.log('instance token:', this.token);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const err: ApiError = {
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
        };
        throw err;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Form data request failed:', error);
      console.error('Request URL:', url);
      console.error('Request headers:', headers);
      
      // Check if it's a certificate error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('❌ Certificate or connection error. Try accepting the certificate in browser first.');
      }
      
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: (error as any)?.status,
      } as ApiError;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
export { ApiService };
