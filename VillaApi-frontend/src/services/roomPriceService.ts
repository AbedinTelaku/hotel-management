import apiService, { ApiResponse, ApiError } from './api';

export interface RoomPrice {
  id: number;
  roomType: string;
  roomModel: string;
  price: number;
  isActive: boolean;
  isDeleted: boolean;
  enteredBy: number;
  enteredOn: string;
}

export interface RoomPriceParameters {
  roomType: string;
  roomModel: string;
  price: number;
  isActive?: boolean;
}

class RoomPriceService {
  async getAllRoomPrices(): Promise<ApiResponse<RoomPrice[]>> {
    try {
      return await apiService.get<RoomPrice[]>('/RoomPrice/GetAll');
    } catch (error) {
      console.error('Get all room prices failed:', error);
      throw error;
    }
  }

  async getRoomPriceById(id: number): Promise<ApiResponse<RoomPrice>> {
    try {
      return await apiService.get<RoomPrice>(`/RoomPrice/GetItem?id=${id}`);
    } catch (error) {
      console.error('Get room price by id failed:', error);
      throw error;
    }
  }

  async getRoomPriceByTypeAndModel(type: string, model: string): Promise<ApiResponse<RoomPrice>> {
    try {
      return await apiService.get<RoomPrice>(`/RoomPrice/GetItemByTypeAndModel?type=${type}&model=${model}`);
    } catch (error) {
      console.error('Get room price by type and model failed:', error);
      throw error;
    }
  }

  async addRoomPrice(priceData: RoomPriceParameters): Promise<ApiResponse<RoomPrice>> {
    try {
      return await apiService.post<RoomPrice>('/RoomPrice/Add', priceData);
    } catch (error) {
      console.error('Add room price failed:', error);
      throw error;
    }
  }

  async updateRoomPrice(id: number, price: number): Promise<ApiResponse<RoomPrice>> {
    try {
      return await apiService.put<RoomPrice>(`/RoomPrice/Update?id=${id}&price=${price}`, {});
    } catch (error) {
      console.error('Update room price failed:', error);
      throw error;
    }
  }

  async removeRoomPrice(id: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/RoomPrice/Remove?id=${id}`);
    } catch (error) {
      console.error('Remove room price failed:', error);
      throw error;
    }
  }
}

export const roomPriceService = new RoomPriceService();
export default roomPriceService;
