import { api, setToken, clearToken } from './client';

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; role: string; name: string };
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),

  me: () => api.get<{ user: LoginResponse['user'] }>('/api/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/auth/change-password', { currentPassword, newPassword }),

  logout: () => { clearToken(); },

  saveToken: (token: string) => setToken(token),
};