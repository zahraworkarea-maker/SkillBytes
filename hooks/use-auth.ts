'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/api-services';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.substring(name.length + 1));
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  role_label?: string;
  [key: string]: any;
}

function getAuthUserIdFromCookie(): number | null {
  const authUser = getCookie('auth_user');
  if (!authUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(authUser);
    const id = parsed?.id;
    if (typeof id === 'number') {
      return id;
    }

    if (typeof id === 'string' && id.trim() !== '') {
      const parsedId = Number(id);
      return Number.isNaN(parsedId) ? null : parsedId;
    }

    return null;
  } catch {
    return null;
  }
}

function getAuthUserFromCookie(): User | null {
  const authUser = getCookie('auth_user');
  if (!authUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(authUser);
    if (parsed && typeof parsed === 'object') {
      return parsed as User;
    }
    return null;
  } catch {
    return null;
  }
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check user saat component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getCookie('auth_token');
        if (token) {
          const cookieUser = getAuthUserFromCookie();
          if (cookieUser) {
            setUser(cookieUser);
          }

          const userId = getAuthUserIdFromCookie();
          if (!userId) {
            return;
          }

          const currentUser = await authService.getUserById(userId);

          setUser(currentUser.data || currentUser.user || currentUser);
        }
      } catch (err) {
        clearCookie('auth_token');
        clearCookie('auth_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user || response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login gagal';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Logout gagal';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.register(data);
      setUser(response.user || response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Register gagal';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    error,
  };
}
