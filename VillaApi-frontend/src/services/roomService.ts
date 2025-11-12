import apiService, { ApiResponse, ApiError } from './api';

export interface Room {
  roomNo: string;
  title: string;
  orderNo: number;
  roomModel: string;
  isActive: boolean;
  isDeleted: boolean;
  enteredBy: number;
  enteredOn: string;
}

export interface RoomView {
  roomMovementId?: number;
  roomNo: string;
  title: string;
  orderNo: number;
  roomModel: string;
  roomModelDescription: string;
  isOpen: boolean;
  roomType?: string;
  roomTypeDescription?: string;
  isExtraRoomType: boolean;
  amountDebt: number;
  hours: number;
  price: number;
  minuteLeft: number;
  entryOn?: string; // Koha kur u hap dhoma (ISO string)
  clientPlateNo?: string; // Numri i tabelave të veturës
  clientCarName?: string; // Emri i veturës
  clientDocument?: string; // Dokumenti i klientit
}

export interface OpenRoomRequest {
  roomNo: string;
  bookingType: 'pushim' | '24h' | 'fjetje' | 'tjeter';
  tables: string;
  vehicle: string;
  price: string;
  paid: boolean;
  clientName?: string;
  hours?: string; // Optional custom hours for "Tjeter" booking type
}

// Backend expects this structure
export interface OpenRoomParameters {
  RoomNo: string;
  RoomType: string; // Required - maps to bookingType
  ClientPlateNo?: string; // Maps to tables
  ClientDocument?: string; // Maps to clientName
  ClientCarName?: string; // Maps to vehicle
  Price: number; // Maps to price (converted to decimal)
  IsDebt: boolean; // Maps to !paid
  Hours: number; // Calculated based on bookingType
}

export interface AddExtraInRoomRequest {
  roomMovementId: number;
  roomType: string;
  isDebt: boolean;
  hours: number;
  price: number;
}

export interface AddDrinkToRoomRequest {
  roomMovementId: number;
  productCode: string;
  quantity: number;
  price: number;
  isDebt?: boolean;
}


export interface RoomDetails {
  roomMovementId: number;
  roomNo: string;
  roomTitle: string;
  clientPlateNo?: string;
  clientDocument?: string;
  clientCarName?: string;
  roomTypeDescription: string;
  startTime: string;
  spendTime: string;
  extras: string;
  roomDebt: number;
  marketDebt: number;
  gratisAmount: number;
  roomAmount: number;
  marketAmount: number;
  total: number;
}

class RoomService {
  async getAllRooms(): Promise<ApiResponse<Room[]>> {
    try {
      return await apiService.get<Room[]>('/Room/GetAllRooms');
    } catch (error) {
      console.error('Get all rooms failed:', error);
      throw error;
    }
  }

  async getActiveRooms(): Promise<ApiResponse<Room[]>> {
    try {
      return await apiService.get<Room[]>('/Room/GetActiveRooms');
    } catch (error) {
      console.error('Get active rooms failed:', error);
      throw error;
    }
  }

  async getRooms(): Promise<ApiResponse<RoomView[]>> {
    try {
      return await apiService.get<RoomView[]>('/Room/GetRooms');
    } catch (error) {
      console.error('Get rooms failed:', error);
      throw error;
    }
  }

  async getRoomByNo(roomNo: string): Promise<ApiResponse<Room>> {
    try {
      return await apiService.get<Room>(`/Room/GetRoomByNo?roomNo=${roomNo}`);
    } catch (error) {
      console.error('Get room by number failed:', error);
      throw error;
    }
  }

  async getItem(roomNo: string): Promise<ApiResponse<Room>> {
    try {
      return await apiService.get<Room>(`/Room/GetItem?roomNo=${roomNo}`);
    } catch (error) {
      console.error('Get room item failed:', error);
      throw error;
    }
  }

  async getAvailableRooms(roomModel: string): Promise<ApiResponse<Room[]>> {
    try {
      return await apiService.get<Room[]>(`/Room/GetAvailableRooms?roomModel=${roomModel}`);
    } catch (error) {
      console.error('Get available rooms failed:', error);
      throw error;
    }
  }

  async addRoom(roomData: any): Promise<ApiResponse<Room>> {
    try {
      return await apiService.post<Room>('/Room/Add', roomData);
    } catch (error) {
      console.error('Add room failed:', error);
      throw error;
    }
  }

  async updateRoom(roomData: any): Promise<ApiResponse<Room>> {
    try {
      return await apiService.put<Room>('/Room/Update', roomData);
    } catch (error) {
      console.error('Update room failed:', error);
      throw error;
    }
  }

  async removeRoom(roomNo: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/Room/Remove?roomNo=${roomNo}`);
    } catch (error) {
      console.error('Remove room failed:', error);
      throw error;
    }
  }

  async openRoom(roomData: OpenRoomRequest): Promise<ApiResponse<number>> {
    try {
      // Convert frontend data to backend format
      const getRoomTypeCode = (bookingType: string): string => {
        switch (bookingType) {
          case 'pushim': return 'P';
          case '24h': return '24h';
          case 'fjetje': return 'F';
          case 'tjeter': return 'T';
          default: return 'P';
        }
      };

      const getHours = (bookingType: string, customHours?: string): number => {
        // Use custom hours for "Tjeter" booking type if provided
        if (bookingType === 'tjeter' && customHours) {
          return parseFloat(customHours) || 0;
        }
        
        // Note: This will be updated to use database values when room types are loaded
        // For now, keeping the hardcoded values as fallback
        switch (bookingType) {
          case 'pushim': return 3; // Database shows 3 hours for pushim
          case '24h': return 24;
          case 'fjetje': return 12;
          case 'tjeter': return 0;
          default: return 3;
        }
      };

      // Convert room number to database format (with leading zero if needed)
      const formatRoomNo = (roomNo: string): string => {
        if (!roomNo) {
          return roomNo;
        }

        const trimmed = roomNo.trim();

        // Handle VIP rooms - remove spaces and ensure proper format
        if (trimmed.toLowerCase().includes('vip')) {
          return trimmed.replace(/\s+/g, '');
        }

        // If the value is purely numeric (including with leading zeros) normalise it
        if (/^\d+$/.test(trimmed)) {
          return parseInt(trimmed, 10).toString();
        }

        // If the value contains a numeric part (e.g. "Dhoma 1"), extract it
        const numericPart = trimmed.match(/\d+/);
        if (numericPart) {
          return parseInt(numericPart[0], 10).toString();
        }

        // Fallback to trimmed text as-is
        return trimmed;
      };

      const backendData: OpenRoomParameters = {
        RoomNo: formatRoomNo(roomData.roomNo),
        RoomType: getRoomTypeCode(roomData.bookingType),
        ClientPlateNo: roomData.tables || undefined,
        ClientDocument: undefined, // Not provided in current frontend
        ClientCarName: roomData.vehicle || undefined,
        Price: parseFloat(roomData.price) || 0,
        IsDebt: !roomData.paid,
        Hours: getHours(roomData.bookingType, roomData.hours)
      };

      console.log('🔄 Converting room data for backend:', {
        frontend: roomData,
        backend: backendData
      });
      
      console.log('🔍 Room number conversion:', {
        original: roomData.roomNo,
        formatted: formatRoomNo(roomData.roomNo)
      });

      return await apiService.post<number>('/Room/OpenRoom', backendData);
    } catch (error) {
      console.error('Open room failed:', error);
      throw error;
    }
  }

  async addExtraInRoom(extraData: AddExtraInRoomRequest): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.post<boolean>('/Room/AddExtraInRoom', extraData);
    } catch (error) {
      console.error('Add extra in room failed:', error);
      throw error;
    }
  }

  async addDrinkToRoom(drinkData: AddDrinkToRoomRequest): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.post<boolean>('/Room/AddDrinkToRoom', drinkData);
    } catch (error) {
      console.error('Add drink to room failed:', error);
      throw error;
    }
  }


  async mistake(roomMovementId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.put<boolean>(`/Room/Mistake?roomMovementId=${roomMovementId}`, {});
    } catch (error) {
      console.error('Mistake room failed:', error);
      throw error;
    }
  }

  async changeRoom(roomMovementId: number, roomNo: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.put<boolean>(`/Room/ChangeRoom?roomMovementId=${roomMovementId}&roomNo=${roomNo}`, {});
    } catch (error) {
      console.error('Change room failed:', error);
      throw error;
    }
  }

  async confirmPaidForRoom(roomMovementId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.put<boolean>(`/Room/ConfirmPaidForRoom?roomMovementId=${roomMovementId}`, {});
    } catch (error) {
      console.error('Confirm paid for room failed:', error);
      throw error;
    }
  }

  async confirmAllTheDebt(roomMovementId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.put<boolean>(`/Room/ConfirmAllTheDebt?roomMovementId=${roomMovementId}`, {});
    } catch (error) {
      console.error('Confirm all debt failed:', error);
      throw error;
    }
  }

  async getConfirmMessage(roomMovementId: number): Promise<ApiResponse<string>> {
    try {
      return await apiService.get<string>(`/Room/GetConfirmMessage?roomMovementId=${roomMovementId}`);
    } catch (error) {
      console.error('Get confirm message failed:', error);
      throw error;
    }
  }

  async closeRoom(roomMovementId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.put<boolean>(`/Room/CloseRoom?roomMovementId=${roomMovementId}`, {});
    } catch (error) {
      console.error('Close room failed:', error);
      throw error;
    }
  }

  async getRoomDetails(roomMovementId: number): Promise<ApiResponse<RoomDetails>> {
    try {
      return await apiService.get<RoomDetails>(`/Room/GetRoomDetails?roomMovementId=${roomMovementId}`);
    } catch (error) {
      console.error('Get room details failed:', error);
      throw error;
    }
  }
}

export const roomService = new RoomService();
export default roomService;
