import { api } from './client';

export const attendanceApi = {
  list: (filters?: { batch_id?: string; student_id?: string; date?: string; month?: string }) => {
    const qs = new URLSearchParams(filters as any).toString();
    return api.get('/api/attendance' + (qs ? '?' + qs : ''));
  },
  mark: (batch_id: string, date: string, records: { student_id: string; status: string; remarks?: string }[]) =>
    api.post('/api/attendance', { batch_id, date, records }),
  summary: (studentId: string) => api.get('/api/attendance/summary/' + studentId),
};