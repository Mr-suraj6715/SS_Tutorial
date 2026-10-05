import { api } from './client';

export const dashboardApi = {
  adminStats: () => api.get('/api/dashboard/stats'),
  teacherDashboard: () => api.get('/api/dashboard/teacher'),
  studentDashboard: () => api.get('/api/dashboard/student'),
};