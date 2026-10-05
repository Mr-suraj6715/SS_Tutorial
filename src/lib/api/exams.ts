import { api } from './client';

export const examsApi = {
  list: (batchId?: string) => {
    const qs = batchId ? '?batch_id=' + batchId : '';
    return api.get('/api/exams' + qs);
  },
  create: (data: any) => api.post('/api/exams', data),
  publish: (examId: string) => api.patch('/api/exams/' + examId + '/publish', {}),
  results: {
    get: (examId: string) => api.get('/api/exams/' + examId + '/results'),
    save: (examId: string, results: any[]) => api.post('/api/exams/' + examId + '/results', { results }),
    publish: (examId: string) => api.patch('/api/exams/' + examId + '/results/publish', {}),
  },
};