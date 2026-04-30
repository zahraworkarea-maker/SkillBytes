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

// Create axios instance - JANGAN set default Content-Type
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    // ❌ HAPUS Content-Type dari sini
  },
});

// Interceptor request
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('auth_token');

    // ✅ FIX 1: Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any;
    }

    // ✅ FIX 2: Handle FormData - HARUS LEBIH DULU
    if (config.data instanceof FormData) {
      console.log('[AXIOS] FormData detected - allowing browser to set multipart/form-data');
      // ✅ FIX 3: Completely remove Content-Type header untuk FormData
      delete config.headers['Content-Type'];
      
      // Debug: log FormData contents
      const entries: any[] = [];
      config.data.forEach((value: any, key: string) => {
        if (value instanceof File) {
          entries.push(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          entries.push(`${key}: ${value}`);
        }
      });
      console.log('[AXIOS] FormData entries:', entries);
    } else {
      // ✅ FIX 4: Only set Content-Type for JSON
      config.headers['Content-Type'] = 'application/json';
    }

    // ✅ FIX 5: Add token
    if (token && !isPublicAuthRequest(config.url)) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[AXIOS] Token attached to request:', config.url);
    }

    // Debug log
    console.log('[AXIOS] Request config:', {
      url: config.url,
      method: config.method,
      hasFormData: config.data instanceof FormData,
      contentType: config.headers['Content-Type'],
      hasAuth: !!config.headers['Authorization'],
    });

    return config;
  },
  (error) => {
    console.error('[AXIOS] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor response
apiClient.interceptors.response.use(
  (response) => {
    console.log('[AXIOS] Response success:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error: AxiosError) => {
    const url = error.config?.url;
    const status = error.response?.status;

    console.error('[AXIOS] Response error:', {
      url,
      status,
      message: (error.response?.data as any)?.message,
    });

    // Handle 401
    if (status === 401 && !isPublicAuthRequest(url)) {
      console.log('[AXIOS] 401 Unauthorized - clearing cookies and redirecting');
      clearCookie('auth_token');
      clearCookie('auth_user');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;