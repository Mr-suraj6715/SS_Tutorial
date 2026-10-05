import { api } from './client';

export const feesApi = {
  list: (studentId?: string) => {
    const qs = studentId ? '?student_id=' + studentId : '';
    return api.get('/api/fees' + qs);
  },
  create: (data: any) => api.post('/api/fees', data),
  recordPayment: (feeId: string, data: { amount: number; method?: string; transaction_ref?: string }) =>
    api.post('/api/fees/' + feeId + '/payment', data),
};