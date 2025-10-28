import apiService, { ApiResponse, ApiError } from './api';

export interface SuggestionCarName {
  id: number;
  carName: string;
  isActive: boolean;
  isDeleted: boolean;
  enteredBy: number;
  enteredOn: string;
}

class SuggestionCarNameService {
  async getAllCarNames(): Promise<ApiResponse<SuggestionCarName[]>> {
    try {
      return await apiService.get<SuggestionCarName[]>('/SuggestionCarName');
    } catch (error) {
      console.error('Get all car names failed:', error);
      throw error;
    }
  }

  async addCarName(carName: string): Promise<ApiResponse<SuggestionCarName>> {
    try {
      const formData = new FormData();
      formData.append('carName', carName);
      
      return await apiService.postFormData<SuggestionCarName>('/SuggestionCarName', formData);
    } catch (error) {
      console.error('Add car name failed:', error);
      throw error;
    }
  }

  async removeCarName(carName: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/SuggestionCarName?carName=${carName}`);
    } catch (error) {
      console.error('Remove car name failed:', error);
      throw error;
    }
  }
}

export const suggestionCarNameService = new SuggestionCarNameService();
export default suggestionCarNameService;
