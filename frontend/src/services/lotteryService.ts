import apiClient from './api';
import { Prize, LotteryResult, PaginatedLotteryRecords } from '@/types';

export const lotteryService = {
  getPrizes: (): Promise<Prize[]> =>
    apiClient.get('/lottery/prizes'),

  draw: (data: { student_id: number; cost_points: number }): Promise<LotteryResult> =>
    apiClient.post('/lottery/draw', data),

  getRecords: (params?: { page?: number; pageSize?: number; student_id?: number }): Promise<PaginatedLotteryRecords> =>
    apiClient.get('/lottery/records', { params }),
};
