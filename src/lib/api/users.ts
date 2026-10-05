import { api } from './client';

export const usersApi = {
  list: () => api.get('/api/users'),
  get: (id: string) => api.get('/api/users/' + id),
  create: (data: { email: string; password: string; full_name: string; phone?: string; role: string }) =>
    api.post('/api/users', data),
  update: (id: string, data: Partial<{ full_name: string; phone: string; is_active: number }>) =>
    api.patch('/api/users/' + id, data),
  deactivate: (id: string) => api.delete('/api/users/' + id),
};