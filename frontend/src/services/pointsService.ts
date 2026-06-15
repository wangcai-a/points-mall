import apiClient from './api';
import { PointsOperationResponse, ImportPreview, ImportConfirmResponse } from '@/types';

export const pointsService = {
  award: (data: { student_id: number; amount: number; reason: string }): Promise<PointsOperationResponse> =>
    apiClient.post('/points/award', data),

  deduct: (data: { student_id: number; amount: number; reason: string }): Promise<PointsOperationResponse> =>
    apiClient.post('/points/deduct', data),

  importExcel: (file: File): Promise<ImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/points/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  confirmImport: (data: { records: Array<{ student_id: number; change_amount: number; reason: string }> }): Promise<ImportConfirmResponse> =>
    apiClient.post('/points/import/confirm', data),
};
