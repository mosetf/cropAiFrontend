'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api';
import { ApiError } from '@/types';
import Link from 'next/link';
import { Sprout, AlertCircle } from 'lucide-react';
import { Button } from '@/components';

export default function LoginPage() {
  const router = useRouter();
  const setCredentials = useAuthStore((s) => s.setCredentials);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/v1/auth/login/', {
        email,
        password,
        remember_me: rememberMe,
      });

      // Pass remember flag so store picks the right storage
      setCredentials(response.data, rememberMe);
      router.push('/dashboard');
    } catch (err: any) {
      const data: ApiError = err.response?.data || {};
      
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a few minutes and try again.');
      } else {
        setError(
          data.detail ||
            data.non_field_errors?.[0] ||
            'Wrong email or password.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-primary-700 mb-3">
              <Sprout size={32} />
              <span className="text-2xl font-bold">CropAI Kenya</span>
            </div>
            <p className="text-neutral-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-900 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 placeholder-neutral-400 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-900 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-neutral-900 placeholder-neutral-400 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-neutral-700"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-earth-600">
            New to CropAI?{' '}
            <Link
              href="/signup"
              className="text-sage-700 hover:text-sage-800 font-medium transition"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
