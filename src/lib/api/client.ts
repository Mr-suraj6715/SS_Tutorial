// Central API client for the SS Tutorial backend
// In development, Vite proxies /api/* to http://localhost:5000 (see vite.config.ts)
// VITE_API_URL can override for production deployments

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getToken(): string | null {
  return localStorage.getItem('ss_token');
}

export function setToken(token: string) {
  localStorage.setItem('ss_token', token);
}

export function clearToken() {
  localStorage.removeItem('ss_token');
}

async function request<T = any>(
  method: string,
  path: string,
  body?: unknown,
  formData?: FormData
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (body && !formData) headers['Content-Type'] = 'application/json';

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: formData ? formData : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

export const api = {
  get:    <T = any>(path: string)                        => request<T>('GET',    path),
  post:   <T = any>(path: string, body: unknown)         => request<T>('POST',   path, body),
  patch:  <T = any>(path: string, body: unknown)         => request<T>('PATCH',  path, body),
  put:    <T = any>(path: string, body: unknown)         => request<T>('PUT',    path, body),
  delete: <T = any>(path: string)                        => request<T>('DELETE', path),
  upload: <T = any>(path: string, formData: FormData)    => request<T>('POST',   path, undefined, formData),
};