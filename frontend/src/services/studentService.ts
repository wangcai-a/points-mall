import apiClient from './api';
import { Student, PaginatedStudents, StudentPointsHistory } from '@/types';

export const studentService = {
  getStudents: (params?: { page?: number; pageSize?: number; name?: string; class?: string }): Promise<PaginatedStudents> =>
    apiClient.get('/students', { params }),

  getStudent: (id: number): Promise<Student> =>
    apiClient.get(`/students/${id}`),

  createStudent: (data: { name: string; class: string; total_points?: number }): Promise<Student> =>
    apiClient.post('/students', data),

  updateStudent: (id: number, data: { name?: string; class?: string }): Promise<void> =>
    apiClient.put(`/students/${id}`, data),

  deleteStudent: (id: number): Promise<void> =>
    apiClient.delete(`/students/${id}`),

  getPointsHistory: (id: number, params?: { page?: number; pageSize?: number }): Promise<StudentPointsHistory> =>
    apiClient.get(`/students/${id}/points-history`, { params }),
};
