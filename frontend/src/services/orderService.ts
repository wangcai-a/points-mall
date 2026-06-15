import apiClient from './api';
import { Order, PaginatedOrders, CreateOrderResponse, OrderStatus } from '@/types';

export const orderService = {
  getOrders: (params?: { page?: number; pageSize?: number; status?: string; student_id?: number }): Promise<PaginatedOrders> =>
    apiClient.get('/orders', { params }),

  createOrder: (data: { student_id: number; product_id: number }): Promise<CreateOrderResponse> =>
    apiClient.post('/orders', data),

  getOrder: (id: number): Promise<Order> =>
    apiClient.get(`/orders/${id}`),

  updateOrderStatus: (id: number, status: OrderStatus): Promise<void> =>
    apiClient.put(`/orders/${id}`, { status }),
};
