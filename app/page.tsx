'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import apiClient from '@/lib/api-client';

type LoginApiResponse = {
  success: boolean;
  message: string;
  token?: string;
  access_token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    role_label: string;
    is_active: boolean;
  };
  data?: {
    user?: {
      id: number;
      name: string;
      email: string;
      username: string;
      role: string;
      role_label: string;
      is_active: boolean;
    };
    token?: string;
    access_token?: string;
  };
};

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const loginInFlightRef = useRef(false);

  const performLoginRequest = async (normalizedEmail: string, rawPassword: string) => {
    const loginEndpoints = ['auth/user/login'];
    let lastError: unknown;

    for (const endpoint of loginEndpoints) {
      try {
        const response = await apiClient.post<LoginApiResponse>(endpoint, {
          email: normalizedEmail,
          password: rawPassword,
        });

        return response;
      } catch (error: any) {
        lastError = error;

        // Coba endpoint fallback hanya jika endpoint pertama gagal.
        if (endpoint !== loginEndpoints[loginEndpoints.length - 1]) {
          continue;
        }
      }
    }

    throw lastError;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submit while a request is still in flight.
    if (loginInFlightRef.current) {
      return;
    }

    loginInFlightRef.current = true;
    setErrorMessage('');
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim();
      const response = await performLoginRequest(normalizedEmail, password);

      const payload = response.data;

      if (!payload.success) {
        setErrorMessage(payload.message || 'Login gagal');
        return;
      }

      const token = payload.data?.token || payload.token || payload.data?.access_token || payload.access_token;
      const user = payload.data?.user || payload.user;

      if (!token) {
        setErrorMessage('Login gagal: token tidak ditemukan pada response backend.');
        return;
      }

      setCookie('auth_token', token);

      if (user) {
        setCookie('auth_user', JSON.stringify(user));
      }

      const role = (user?.role || user?.role_label || '').toLowerCase();

      const redirectUrl = role === 'admin' || role === 'guru' ? '/admin/dashboard' : '/dashboard';

      window.location.href = redirectUrl;
    } catch (error: any) {
      const responseMessage = error?.response?.data?.message;
      const validationErrors = error?.response?.data?.errors;
      const status = error?.response?.status;

      let message = responseMessage;
      if (validationErrors && typeof validationErrors === 'object') {
        const firstError = Object.values(validationErrors)
          .flat()
          .find((item) => typeof item === 'string');
        if (firstError) {
          message = firstError as string;
        }
      }

      if (!message && status === 401) {
        message = 'Email atau password salah.';
      }

      setErrorMessage(message || 'Login gagal. Periksa email/password atau koneksi backend.');
    } finally {
      setIsLoading(false);
      loginInFlightRef.current = false;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-8">
      {/* Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:min-h-160">
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:w-1/2 shrink-0 overflow-hidden self-stretch">
          <img
            src="/robobo.png"
            alt="Tech hero illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 lg:shrink-0 flex flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-12">
            <img
              src="/logo_login.png"
              alt="SkillBytes Logo"
              className="h-50 w-auto object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-1">
              Log In
            </h2>
            <p className="text-slate-600 text-lg">
              Please log in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-0 placeholder-slate-400"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-0 placeholder-slate-400 pr-12"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </div>
      </div>
      </div>
    </main>
  );
}
