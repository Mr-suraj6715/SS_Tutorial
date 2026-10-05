import { api } from './client';

export const noticesApi = {
  list: () => api.get('/api/notices'),
  create: (data: { title: string; content: string; target_audience?: string; is_published?: boolean }) =>
    api.post('/api/notices', data),
  update: (id: string, data: any) => api.patch('/api/notices/' + id, data),
  delete: (id: string) => api.delete('/api/notices/' + id),
};