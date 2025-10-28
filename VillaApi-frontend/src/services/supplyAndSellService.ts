import apiService, { ApiResponse } from './api';

export interface SupplyAndSell {
  id: number;
  roomNo: string;
  isDebt: boolean;
  IsForStaff: boolean;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  enteredBy: number;
  enteredOn: string;
  items: SupplyAndSellItem[];
}

export interface SupplyAndSellItem {
  id: number;
  supplyAndSellId: number;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  enteredBy: number;
  enteredOn: string;
}

export interface SupplyAndSellParameters {
  dateAndTime?: string;
  isSupply?: boolean;
  isFree?: boolean;
  roomNo: string | null;
  isDebt: boolean;
  isMistake?: boolean;
  IsForStaff?: boolean;
  discount?: number;
  items: SupplyAndSellItemsParameters[];
}

export interface SupplyAndSellItemsParameters {
  productCode: string;
  quantity: number;
  price: number;
}

export interface StockItem {
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
}

class SupplyAndSellService {
  async addBill(billData: SupplyAndSellParameters): Promise<ApiResponse<SupplyAndSell>> {
    try {
      return await apiService.post<SupplyAndSell>('/SupplyAndSell/Add', billData);
    } catch (error) {
      console.error('Add bill failed:', error);
      throw error;
    }
  }

  async updateBill(
    supplyAndSellId: number,
    isDebt: boolean,
    items: SupplyAndSellItemsParameters[]
  ): Promise<ApiResponse<SupplyAndSell>> {
    try {
      return await apiService.post<SupplyAndSell>('/SupplyAndSell/Update', {
        supplyAndSellId,
        isDebt,
        supplyAndSellItems: items
      });
    } catch (error) {
      console.error('Update bill failed:', error);
      throw error;
    }
  }

  async confirmPaid(supplyAndSellId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.put<boolean>(`/SupplyAndSell/ConfirmPaid?supplyAndSellId=${supplyAndSellId}`, {});
    } catch (error) {
      console.error('Confirm paid failed:', error);
      throw error;
    }
  }

  async updateItemQuantity(supplyAndSellItemId: number, quantity: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.put<boolean>(`/SupplyAndSell/UpdateQuantityOfItems?suppyAndSellItemId=${supplyAndSellItemId}&quantity=${quantity}`, {});
    } catch (error) {
      console.error('Update item quantity failed:', error);
      throw error;
    }
  }

  async deleteBill(supplyAndSellId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/SupplyAndSell/DeleteBill?supplyAndSellId=${supplyAndSellId}`);
    } catch (error) {
      console.error('Delete bill failed:', error);
      throw error;
    }
  }

  async deleteItemInBill(supplyAndSellItemId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/SupplyAndSell/DeleteItemInBill?supplyAndSellItemsId=${supplyAndSellItemId}`);
    } catch (error) {
      console.error('Delete item in bill failed:', error);
      throw error;
    }
  }

  async getBillWithItems(roomNo: string): Promise<ApiResponse<SupplyAndSell>> {
    try {
      return await apiService.get<SupplyAndSell>(`/SupplyAndSell/GetBillWithItems?roomNo=${roomNo}`);
    } catch (error) {
      console.error('Get bill with items failed:', error);
      throw error;
    }
  }

  async getBills(fromDate: string, toDate: string): Promise<ApiResponse<SupplyAndSell[]>> {
    try {
      return await apiService.get<SupplyAndSell[]>(`/SupplyAndSell/GetBills?fromDate=${fromDate}&toDate=${toDate}`);
    } catch (error) {
      console.error('Get bills failed:', error);
      throw error;
    }
  }

  async getItemsInBill(billId: number): Promise<ApiResponse<SupplyAndSellItem[]>> {
    try {
      return await apiService.get<SupplyAndSellItem[]>(`/SupplyAndSell/GetItemsInBill?billId=${billId}`);
    } catch (error) {
      console.error('Get items in bill failed:', error);
      throw error;
    }
  }

  async getStock(): Promise<ApiResponse<StockItem[]>> {
    try {
      return await apiService.get<StockItem[]>('/SupplyAndSell/GetStock');
    } catch (error) {
      console.error('Get stock failed:', error);
      throw error;
    }
  }

  async getBillForRoom(roomMovementId: number): Promise<ApiResponse<SupplyAndSell>> {
    try {
      return await apiService.get<SupplyAndSell>(`/SupplyAndSell/GetBillForRoom?roomMovementId=${roomMovementId}`);
    } catch (error) {
      console.error('Get bill for room failed:', error);
      throw error;
    }
  }
}

export const supplyAndSellService = new SupplyAndSellService();
export default supplyAndSellService;
