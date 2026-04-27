'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // Validation
    if (!email || !password) {
      setLocalError('Email dan password harus diisi');
      return;
    }

    try {
      await login(email, password);
      setSuccessMessage('Login berhasil! Redirect...');
      
      // Redirect ke dashboard setelah 1 detik
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      const message = err.response?.data?.message || authError || 'Login gagal';
      setLocalError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>
            <p className="text-gray-600 mt-2">Masuk ke akun SkillBytes Anda</p>
          </div>

          {/* Error Alert */}
          {(localError || authError) && (
            <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
              {localError || authError}
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              {successMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@example.com"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Daftar di sini
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
