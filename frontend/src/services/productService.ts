import apiClient from './api';
import { Product, PaginatedProducts, CreateProductData, UpdateProductData } from '@/types';

export const productService = {
  getProducts: (params?: { page?: number; pageSize?: number; category?: string }): Promise<PaginatedProducts> =>
    apiClient.get('/products', { params }),

  getCategories: (): Promise<string[]> =>
    apiClient.get('/products/categories'),

  getProduct: (id: number): Promise<Product> =>
    apiClient.get(`/products/${id}`),

  createProduct: (data: CreateProductData): Promise<{ id: number }> =>
    apiClient.post('/products', data),

  updateProduct: (id: number, data: UpdateProductData): Promise<void> =>
    apiClient.put(`/products/${id}`, data),

  deleteProduct: (id: number): Promise<void> =>
    apiClient.delete(`/products/${id}`),
};
