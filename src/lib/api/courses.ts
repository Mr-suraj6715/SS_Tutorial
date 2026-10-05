import { api } from './client';

export const coursesApi = {
  list: (filters?: { board?: string; class?: string }) => {
    const qs = new URLSearchParams(filters as any).toString();
    return api.get('/api/courses' + (qs ? '?' + qs : ''));
  },
  get: (id: string) => api.get('/api/courses/' + id),
  create: (data: any) => api.post('/api/courses', data),
  update: (id: string, data: any) => api.patch('/api/courses/' + id, data),
  delete: (id: string) => api.delete('/api/courses/' + id),
  subjects: (filters?: { board?: string; class?: string }) => {
    const qs = new URLSearchParams(filters as any).toString();
    return api.get('/api/courses/subjects/all' + (qs ? '?' + qs : ''));
  },
};