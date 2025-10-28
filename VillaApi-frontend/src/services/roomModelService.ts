import apiService, { ApiResponse } from './api';

export interface RoomModel {
  code: string;
  title: string;
  isActive: boolean;
  isDeleted: boolean;
  enteredBy: number;
  enteredOn: string;
}

export interface RoomModelDTO {
  code: string;
  title: string;
  isActive?: boolean;
}

class RoomModelService {
  async getAllRoomModels(): Promise<ApiResponse<RoomModel[]>> {
    try {
      return await apiService.get<RoomModel[]>('/RoomModel/GetAll');
    } catch (error) {
      console.error('Get all room models failed:', error);
      throw error;
    }
  }

  async addRoomModel(title: string): Promise<ApiResponse<RoomModel>> {
    try {
      const formData = new FormData();
      formData.append('title', title);
      
      return await apiService.postFormData<RoomModel>('/RoomModel/Add', formData);
    } catch (error) {
      console.error('Add room model failed:', error);
      throw error;
    }
  }

  async updateRoomModel(roomModelData: RoomModelDTO): Promise<ApiResponse<RoomModel>> {
    try {
      return await apiService.put<RoomModel>('/RoomModel/Update', roomModelData);
    } catch (error) {
      console.error('Update room model failed:', error);
      throw error;
    }
  }

  async removeRoomModel(code: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/RoomModel/Remove?code=${code}`);
    } catch (error) {
      console.error('Remove room model failed:', error);
      throw error;
    }
  }
}

export const roomModelService = new RoomModelService();
export default roomModelService;
