import apiService, { ApiResponse, ApiError } from './api';

export interface RoomType {
  id: number;
  code: string;
  title: string;
  roomModel: string;
  isBasic: boolean;
  isActive: boolean;
  isDeleted: boolean;
  enteredBy: number;
  enteredOn: string;
}

export interface RoomTypeWithPrice {
  code: string;
  description: string;
  hours: number;
  price: number;
  isCustom: boolean;
  orderNo: number;
}

export interface RoomTypeDTO {
  code: string;
  title: string;
  roomModel: string;
  isBasic: boolean;
  isActive?: boolean;
}

class RoomTypeService {
  async getAllRoomTypes(): Promise<ApiResponse<RoomType[]>> {
    try {
      return await apiService.get<RoomType[]>('/RoomType/GetAll');
    } catch (error) {
      console.error('Get all room types failed:', error);
      throw error;
    }
  }

  async getBasicRoomTypes(roomModel: string): Promise<ApiResponse<RoomType[]>> {
    try {
      return await apiService.get<RoomType[]>(`/RoomType/GetBasic?roomModel=${roomModel}`);
    } catch (error) {
      console.error('Get basic room types failed:', error);
      throw error;
    }
  }

  async getExtraRoomTypes(roomModel: string): Promise<ApiResponse<RoomTypeWithPrice[]>> {
    try {
      return await apiService.get<RoomTypeWithPrice[]>(`/RoomType/GetExtras?roomModel=${roomModel}`);
    } catch (error) {
      console.error('Get extra room types failed:', error);
      throw error;
    }
  }

  async addRoomType(roomTypeData: RoomTypeDTO): Promise<ApiResponse<RoomType>> {
    try {
      return await apiService.post<RoomType>('/RoomType/Add', roomTypeData);
    } catch (error) {
      console.error('Add room type failed:', error);
      throw error;
    }
  }

  async updateRoomType(roomTypeData: RoomTypeDTO): Promise<ApiResponse<RoomType>> {
    try {
      return await apiService.put<RoomType>('/RoomType/Update', roomTypeData);
    } catch (error) {
      console.error('Update room type failed:', error);
      throw error;
    }
  }

  async removeRoomType(code: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/RoomType/Remove?code=${code}`);
    } catch (error) {
      console.error('Remove room type failed:', error);
      throw error;
    }
  }
}

export const roomTypeService = new RoomTypeService();
export default roomTypeService;
