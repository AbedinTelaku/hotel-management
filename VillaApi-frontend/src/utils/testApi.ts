// API Testing Utilities
import { 
  authService, 
  roomService, 
  productService, 
  paymentService, 
  supplyAndSellService
} from '../services';
import { ApiError } from '../services/api';

export interface TestResult {
  service: string;
  test: string;
  success: boolean;
  error?: string;
  data?: any;
}

class ApiTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    console.log('🧪 Starting API Tests...');
    
    // Test Authentication
    await this.testAuth();
    
    // Test Rooms
    await this.testRooms();
    
    // Test Products
    await this.testProducts();
    
    // Test Payments
    await this.testPayments();
    
    // Test Supply & Sell
    await this.testSupplyAndSell();
    
    console.log('✅ API Tests Completed');
    return this.results;
  }

  private addResult(service: string, test: string, success: boolean, error?: string, data?: any) {
    this.results.push({ service, test, success, error, data });
    const status = success ? '✅' : '❌';
    console.log(`${status} ${service} - ${test}${error ? `: ${error}` : ''}`);
  }

  private async testAuth() {
    try {
      // Test login with invalid credentials (should fail)
      const loginResult = await authService.login({ username: 'test', password: 'test' });
      this.addResult('Auth', 'Login (invalid)', !loginResult.isSuccessfull, 
        loginResult.isSuccessfull ? 'Should have failed' : undefined);
    } catch (error) {
      this.addResult('Auth', 'Login (invalid)', true, undefined, 'Expected failure');
    }

    try {
      // Test register (might fail if user exists)
      const registerResult = await authService.register({ username: 'testuser', password: 'testpass' });
      this.addResult('Auth', 'Register', registerResult.isSuccessfull, 
        registerResult.errorMessage);
    } catch (error) {
      const apiError = error as ApiError;
      this.addResult('Auth', 'Register', false, apiError.message);
    }
  }

  private async testRooms() {
    try {
      const roomsResult = await roomService.getRooms();
      this.addResult('Rooms', 'Get Rooms', roomsResult.isSuccessfull, 
        roomsResult.errorMessage, roomsResult.data?.length);
    } catch (error) {
      const apiError = error as ApiError;
      this.addResult('Rooms', 'Get Rooms', false, apiError.message);
    }

    try {
      const activeRoomsResult = await roomService.getActiveRooms();
      this.addResult('Rooms', 'Get Active Rooms', activeRoomsResult.isSuccessfull, 
        activeRoomsResult.errorMessage, activeRoomsResult.data?.length);
    } catch (error) {
      const apiError = error as ApiError;
      this.addResult('Rooms', 'Get Active Rooms', false, apiError.message);
    }
  }

  private async testProducts() {
    try {
      const productsResult = await productService.getAllProducts();
      this.addResult('Products', 'Get All Products', productsResult.isSuccessfull, 
        productsResult.errorMessage, productsResult.data?.length);
    } catch (error) {
      const apiError = error as ApiError;
      this.addResult('Products', 'Get All Products', false, apiError.message);
    }

    try {
      const categoriesResult = await productService.getActiveCategories();
      this.addResult('Products', 'Get Categories', categoriesResult.isSuccessfull, 
        categoriesResult.errorMessage, categoriesResult.data?.length);
    } catch (error) {
      const apiError = error as ApiError;
      this.addResult('Products', 'Get Categories', false, apiError.message);
    }
  }

  private async testPayments() {
    try {
      const paymentsResult = await paymentService.getAllPayments();
      this.addResult('Payments', 'Get All Payments', paymentsResult.isSuccessfull, 
        paymentsResult.errorMessage, paymentsResult.data?.length);
    } catch (error) {
      const apiError = error as ApiError;
      this.addResult('Payments', 'Get All Payments', false, apiError.message);
    }
  }

  private async testSupplyAndSell() {
    try {
      const stockResult = await supplyAndSellService.getStock();
      this.addResult('Supply & Sell', 'Get Stock', stockResult.isSuccessfull, 
        stockResult.errorMessage, stockResult.data?.length);
    } catch (error) {
      const apiError = error as ApiError;
      this.addResult('Supply & Sell', 'Get Stock', false, apiError.message);
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSuccessCount(): number {
    return this.results.filter(r => r.success).length;
  }

  getFailureCount(): number {
    return this.results.filter(r => !r.success).length;
  }

  getSummary(): string {
    const total = this.results.length;
    const success = this.getSuccessCount();
    const failure = this.getFailureCount();
    
    return `API Tests Summary: ${success}/${total} passed (${failure} failed)`;
  }
}

export const apiTester = new ApiTester();

// Helper function to run tests from console
export const runApiTests = async () => {
  const results = await apiTester.runAllTests();
  console.log(apiTester.getSummary());
  return results;
};

// Make it available globally for testing
(window as any).runApiTests = runApiTests;
