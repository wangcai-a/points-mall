import apiClient from './api';
import { LoginCredentials, LoginResponse, Teacher } from '@/types';

export const authService = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    apiClient.post('/auth/login', credentials),

  getCurrentUser: (): Promise<Teacher> =>
    apiClient.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
