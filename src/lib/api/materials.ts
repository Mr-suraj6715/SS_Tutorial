import { api } from './client';

export const materialsApi = {
  list: (filters?: { batch_id?: string; course_id?: string; category?: string }) => {
    const qs = new URLSearchParams(filters as any).toString();
    return api.get('/api/materials' + (qs ? '?' + qs : ''));
  },
  upload: (formData: FormData) => api.upload('/api/materials', formData),
  delete: (id: string) => api.delete('/api/materials/' + id),
};