import apiClient from './api';
import axios from 'axios';
import { Student, PaginatedStudents, StudentPointsHistory, StudentImportPreview } from '@/types';

const uploadClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

uploadClient.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    if (code !== 200) {
      throw new Error(message || '请求失败');
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
);

export const studentService = {
  getStudents: (params?: { page?: number; pageSize?: number; name?: string; class_name?: string }): Promise<PaginatedStudents> =>
    apiClient.get('/students', { params }),

  getClasses: (): Promise<string[]> =>
    apiClient.get('/students/classes'),

  getStudent: (id: number): Promise<Student> =>
    apiClient.get(`/students/${id}`),

  createStudent: (data: { name: string; class_name: string; total_points?: number }): Promise<Student> =>
    apiClient.post('/students', data),

  updateStudent: (id: number, data: { name?: string; class_name?: string }): Promise<void> =>
    apiClient.put(`/students/${id}`, data),

  deleteStudent: (id: number): Promise<void> =>
    apiClient.delete(`/students/${id}`),

  getPointsHistory: (id: number, params?: { page?: number; pageSize?: number }): Promise<StudentPointsHistory> =>
    apiClient.get(`/students/${id}/points-history`, { params }),

  importExcel: async (file: File): Promise<StudentImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadClient.post('/students/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  confirmImport: async (students_data: Array<{ name: string; class_name: string; total_points: number }>): Promise<{ success_count: number; fail_count: number }> => {
    return apiClient.post('/students/import', students_data);
  },
};
