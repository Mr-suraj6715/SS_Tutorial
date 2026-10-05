import { api } from './client';

export const batchesApi = {
  list: () => api.get('/api/batches'),
  get: (id: string) => api.get('/api/batches/' + id),
  create: (data: any) => api.post('/api/batches', data),
  update: (id: string, data: any) => api.patch('/api/batches/' + id, data),
  enroll: (batchId: string, studentId: string) =>
    api.post('/api/batches/' + batchId + '/enroll', { student_id: studentId }),
};