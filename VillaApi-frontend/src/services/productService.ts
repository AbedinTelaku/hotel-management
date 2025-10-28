import apiService, { ApiResponse, ApiError } from './api';

export interface Product {
  code: string;
  title: string;
  category: string;
  price: number;
  isActive: boolean;
  isDeleted: boolean;
  image?: string;
  imageFormat?: string;
  orderNo: number;
  enteredBy: number;
  enteredOn: string;
  stock?: number; // Shto fushën për stokun
}

export interface ProductCategory {
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  enteredBy: number;
  enteredOn: string;
}

export interface ProductParameters {
  code: string;
  title: string;
  category: string;
  price: number;
  isActive?: boolean;
  orderNo?: number;
  stock?: number; // Shto fushën për stokun
}

export interface ProductCategoryParameters {
  code: string;
  title: string;
  isActive?: boolean;
}

class ProductService {
  // Product endpoints
  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    try {
      return await apiService.get<Product[]>('/Product/GetAll');
    } catch (error) {
      console.error('Get all products failed:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
    try {
      return await apiService.get<Product[]>(`/Product/GetByCategory?category=${category}`);
    } catch (error) {
      console.error('Get products by category failed:', error);
      throw error;
    }
  }

  async getProductByCode(code: string): Promise<ApiResponse<Product>> {
    try {
      return await apiService.get<Product>(`/Product/GetByCode?code=${code}`);
    } catch (error) {
      console.error('Get product by code failed:', error);
      throw error;
    }
  }

  async addProduct(productData: ProductParameters): Promise<ApiResponse<Product>> {
    try {
      return await apiService.post<Product>('/Product/Add', productData);
    } catch (error) {
      console.error('Add product failed:', error);
      throw error;
    }
  }

  async updateProduct(productData: ProductParameters): Promise<ApiResponse<Product>> {
    try {
      return await apiService.put<Product>('/Product/Update', productData);
    } catch (error) {
      console.error('Update product failed:', error);
      throw error;
    }
  }

  async updateProductStock(code: string, newStock: number): Promise<ApiResponse<Product>> {
    try {
      return await apiService.put<Product>(`/Product/UpdateStock?code=${code}&stock=${newStock}`);
    } catch (error) {
      console.error('Update product stock failed:', error);
      throw error;
    }
  }

  async removeProduct(code: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/Product/Remove?code=${code}`);
    } catch (error) {
      console.error('Remove product failed:', error);
      throw error;
    }
  }

  // Product Category endpoints
  async getAllCategories(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      return await apiService.get<ProductCategory[]>('/ProductCategory/GetAll');
    } catch (error) {
      console.error('Get all categories failed:', error);
      throw error;
    }
  }

  async getActiveCategories(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      return await apiService.get<ProductCategory[]>('/ProductCategory/GetActiveItems');
    } catch (error) {
      console.error('Get active categories failed:', error);
      throw error;
    }
  }

  async addCategory(categoryData: ProductCategoryParameters): Promise<ApiResponse<ProductCategory>> {
    try {
      return await apiService.post<ProductCategory>('/ProductCategory/Add', categoryData);
    } catch (error) {
      console.error('Add category failed:', error);
      throw error;
    }
  }

  async updateCategory(categoryData: ProductCategoryParameters): Promise<ApiResponse<ProductCategory>> {
    try {
      return await apiService.put<ProductCategory>('/ProductCategory/Update', categoryData);
    } catch (error) {
      console.error('Update category failed:', error);
      throw error;
    }
  }

  async removeCategory(code: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(`/ProductCategory/Remove?code=${code}`);
    } catch (error) {
      console.error('Remove category failed:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
export default productService;
