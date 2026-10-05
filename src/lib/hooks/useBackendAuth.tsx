import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, setToken, clearToken } from '../api';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'user';

export interface BackendUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface BackendAuthContextType {
  user: BackendUser | null;
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isParent: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const BackendAuthContext = createContext<BackendAuthContextType>({
  user: null,
  role: 'user',
  loading: true,
  isAdmin: false,
  isTeacher: false,
  isStudent: false,
  isParent: false,
  signIn: async () => ({ error: null }),
  signOut: () => {},
  refreshUser: async () => {},
});

export const BackendAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('ss_token');
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const res = await authApi.me();
      setUser(res.user as BackendUser);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const res = await authApi.login(email.trim().toLowerCase(), password);
      setToken(res.token);
      localStorage.setItem('ss_user', JSON.stringify(res.user));
      setUser(res.user as BackendUser);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  };

  const signOut = () => {
    clearToken();
    setUser(null);
    authApi.logout();
  };

  const role = (user?.role ?? 'user') as UserRole;
  const isAdmin   = role === 'admin';
  const isTeacher = role === 'teacher' || isAdmin;
  const isStudent = role === 'student';
  const isParent  = role === 'parent';

  return (
    <BackendAuthContext.Provider value={{
      user, role, loading, isAdmin, isTeacher, isStudent, isParent,
      signIn, signOut, refreshUser,
    }}>
      {children}
    </BackendAuthContext.Provider>
  );
};

export const useBackendAuth = () => useContext(BackendAuthContext);