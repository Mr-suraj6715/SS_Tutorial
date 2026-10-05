import { api } from './client';

export const settingsApi = {
  getAll: () => api.get<{ settings: Record<string, string> }>('/api/settings'),
  updateBulk: (updates: Record<string, string>) => api.patch('/api/settings', updates),
  set: (key: string, value: string, description?: string) =>
    api.put('/api/settings/' + key, { value, description }),
};