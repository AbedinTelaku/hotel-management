import apiService, { ApiResponse } from './api';

export interface Payment {
  displayText: string;
  amount: number;
  isMistake: boolean;
  Employee: string;
  enteredOn: Date;
  isForStaff: boolean;
  Koha: string;
}

export interface PaymentSummary {
  totalAmount: number;
  mistakeAmount: number;
  staffAmount: number;
  amount: number;
}

class PaymentService {
  async getAllPayments(): Promise<ApiResponse<Payment[]>> {
    try {
      return await apiService.get<Payment[]>('/Payment/GetAll');
    } catch (error) {
      console.error('Get all payments failed:', error);
      throw error;
    }
  }

  async getPaymentsByEmployee(employeeId: number): Promise<ApiResponse<Payment[]>> {
    try {
      return await apiService.get<Payment[]>(`/Payment/GetByEmployee?employeeId=${employeeId}`);
    } catch (error) {
      console.error('Get payments by employee failed:', error);
      throw error;
    }
  }

  async getRoomSettlementsByEmployee(employeeId: number): Promise<ApiResponse<Payment[]>> {
    try {
      return await apiService.get<Payment[]>(`/Payment/GetByEmployee?employeeId=${employeeId}`);
    } catch (error) {
      console.error('Get room settlements by employee failed:', error);
      throw error;
    }
  }

  async confirmAllPayments(): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>('/Payment/ConfirmAll');
    } catch (error) {
      console.error('Confirm all payments failed:', error);
      throw error;
    }
  }

  async confirmPaymentsByEmployee(employeeId: number): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/Payment/ConfirmByEmployee?employeeId=${employeeId}`);
    } catch (error) {
      console.error('Confirm payments by employee failed:', error);
      throw error;
    }
  }

  // Helper method to calculate payment summary from payments array
  calculatePaymentSummary(payments: Payment[]): PaymentSummary {
    const summary: PaymentSummary = {
      totalAmount: 0,
      mistakeAmount: 0,
      staffAmount: 0,
      amount: 0
    };

    payments.forEach(payment => {
      summary.totalAmount += payment.amount;
      
      if (payment.isMistake) {
        summary.mistakeAmount += payment.amount;
      }
      else if (payment.isForStaff) {
        summary.staffAmount += payment.amount;
      }
      else {
        summary.amount += payment.amount;
      }

    });

    return summary;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
