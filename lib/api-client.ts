import axios, { AxiosInstance, AxiosError } from 'axios';

function isPublicAuthRequest(url?: string): boolean {
  if (!url) {
    return false;
  }

  return url.includes('auth/user/login') || url.includes('auth/user/register');
}

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

  const value = match.substring(name.length + 1);
  return decodeURIComponent(value);
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

// Create axios instance dengan base URL dari environment variable
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true, // Penting untuk Laravel Sanctum
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('auth_token');

    // Do not attach stale bearer token to public auth endpoints.
    if (token && !isPublicAuthRequest(config.url)) {
      console.log('[AXIOS] Attaching token to request:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isPublicAuthRequest(config.url)) {
      console.log('[AXIOS] Skipping token for public auth request:', config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url;
    const status = error.response?.status;

    console.log('[AXIOS] Response error:', { url, status, message: (error.response?.data as any)?.message });

    // Jika 401 Unauthorized, redirect ke login untuk request selain login.
    if (status === 401 && !isPublicAuthRequest(url)) {
      console.log('[AXIOS] 401 detected. Clearing auth and redirecting to login.');
      clearCookie('auth_token');
      clearCookie('auth_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
