import { api } from './client';

export const admissionsApi = {
  list: () => api.get('/api/admissions'),
  updateStatus: (studentId: string, status: string) =>
    api.patch('/api/admissions/' + studentId + '/status', { status }),
};