import apiService, { ApiResponse, ApiError } from './api';

export interface Privilege {
  id: number;
  name: string;
  formName: string;
  privilegeCode: string;
  isActive: boolean;
  isDeleted: boolean;
  enteredBy: number;
  enteredOn: string;
}

export interface PrivilegeTreeList {
  formName: string;
  privileges: Privilege[];
}

class PrivilegeService {
  async getParameter(name: string): Promise<ApiResponse<Privilege[]>> {
    try {
      return await apiService.get<Privilege[]>(`/Privilege/GetParameter?name=${name}`);
    } catch (error) {
      console.error('Get privilege parameter failed:', error);
      throw error;
    }
  }

  async getByForm(formName: string): Promise<ApiResponse<Privilege[]>> {
    try {
      return await apiService.get<Privilege[]>(`/Privilege/GetByForm?formName=${formName}`);
    } catch (error) {
      console.error('Get privileges by form failed:', error);
      throw error;
    }
  }

  async hasPrivilege(formName: string, privilegeCode: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.get<boolean>(`/Privilege/HasPrivielege?formName=${formName}&privilegeCode=${privilegeCode}`);
    } catch (error) {
      console.error('Check privilege failed:', error);
      throw error;
    }
  }

  async getAllPrivileges(userId: number = 0): Promise<ApiResponse<Privilege[]>> {
    try {
      return await apiService.get<Privilege[]>(`/Privilege/GetAll?userId=${userId}`);
    } catch (error) {
      console.error('Get all privileges failed:', error);
      throw error;
    }
  }

  async getAllPrivilege(): Promise<ApiResponse<PrivilegeTreeList[]>> {
    try {
      return await apiService.get<PrivilegeTreeList[]>('/Privilege/GetAllPrivilege');
    } catch (error) {
      console.error('Get all privilege tree failed:', error);
      throw error;
    }
  }
}

export const privilegeService = new PrivilegeService();
export default privilegeService;
