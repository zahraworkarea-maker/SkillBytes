'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    console.log('Login attempt:', { username, password });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-8">
      {/* Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:min-h-[640px]">
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
            {/* Username Field */}
            <div className="space-y-3">
              <label htmlFor="username" className="text-sm font-semibold text-slate-700">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 px-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-0 placeholder-slate-400"
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
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
