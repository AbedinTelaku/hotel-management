import apiService, { ApiResponse } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  userId: number;
  oldPassword: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface AuthToken {
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<string>> {
    try {
      console.log('🔐 Attempting login with credentials:', { username: credentials.username });
      
      // Backend expects form data for login
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await apiService.postFormData<string>('/Login', formData);
      
      console.log('🔐 Login response received:', response);
      
      if (response.isSuccessfull && response.data) {
        // Backend returns the token directly as a string in response.data
        const token = typeof response.data === 'string' ? response.data : (response.data as any)?.token;
        if (token && typeof token === 'string' && token.length > 0) {
          console.log('🔐 Setting token from response:', token.substring(0, 50) + '...');
          apiService.setToken(token);
        } else {
          console.error('❌ No valid token in response:', response);
        }
      } else {
        console.error('❌ Login response invalid:', response);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    try {
      // Backend expects form data for register
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('password', userData.password);
      
      return await apiService.postFormData<User>('/Register', formData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>('/Users');
    } catch (error) {
      console.error('Get users failed:', error);
      throw error;
    }
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<boolean>> {
    try {
      // Backend expects PUT request with query parameters
      const url = `/ChangePassword?userId=${passwordData.userId}&oldPassword=${encodeURIComponent(passwordData.oldPassword)}&password=${encodeURIComponent(passwordData.password)}`;
      
      return await apiService.put<boolean>(url);
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  async logoutAllUsers(): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.post<boolean>('/Users/ResetLogout');
    } catch (error) {
      console.error('Logout all users failed:', error);
      throw error;
    }
  }

  logout() {
    apiService.clearToken();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token && token.length > 0;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setToken(token: string) {
    apiService.setToken(token);
  }
}

export const authService = new AuthService();
export default authService;
