import apiService, { ApiResponse } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdOn: string;
  lastLogin?: string;
  isAdmin?: boolean;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  isAdmin: boolean;
}

class UserService {
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    // Try alternative endpoints for users
    try {
      // Try /Users if /Users/GetAll fails
      return await apiService.get<User[]>('/Users');
    } catch (error) {
      // Fallback to /Users/GetAll if needed
      return await apiService.get<User[]>('/Users/GetAll');
    }
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      return await apiService.post<User>('/Register', userData);
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<ApiResponse<boolean>> {
    try {
      const params = new URLSearchParams();
      params.append('userId', userId.toString());
      params.append('isActive', isActive.toString());
      
      return await apiService.put<boolean>(`/Users/UpdateStatus?${params.toString()}`);
    } catch (error) {
      console.error('Update user status failed:', error);
      throw error;
    }
  }

  async updateAdminStatus(userId: number, isAdmin: boolean): Promise<ApiResponse<boolean>> {
    try {
      const params = new URLSearchParams();
      params.append('userId', userId.toString());
      params.append('isAdmin', isAdmin.toString());
      
      return await apiService.put<boolean>(`/Users/UpdateAdminStatus?${params.toString()}`);
    } catch (error) {
      console.error('Update admin status failed:', error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/Users/Remove?userId=${userId}`);
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }

  async checkAdminStatus(): Promise<ApiResponse<any>> {
    try {
      return await apiService.get<any>('/Users/CheckAdmin');
    } catch (error) {
      console.error('Check admin status failed:', error);
      throw error;
    }
  }

  async fixAdminUser(): Promise<ApiResponse<any>> {
    try {
      return await apiService.post<any>('/Users/FixAdminUser');
    } catch (error) {
      console.error('Fix admin user failed:', error);
      throw error;
    }
  }

  async autoFixAdmin(): Promise<ApiResponse<any>> {
    try {
      return await apiService.post<any>('/Users/AutoFixAdmin');
    } catch (error) {
      console.error('Auto fix admin failed:', error);
      throw error;
    }
  }

}

export const userService = new UserService();
export default userService;
