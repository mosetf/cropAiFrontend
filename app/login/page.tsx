'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api';
import { loginErrorMessage } from '@/lib/errors';
import { Button } from '@/components';
import AuthShell from '@/components/AuthShell';

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
    } catch (err: unknown) {
      setError(loginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <>
          New to CropAI?{' '}
          <Link href="/signup" className="font-semibold text-accent hover:underline hover:underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-[14px] bg-bad-soft p-4 text-[15px] text-bad">
          <AlertCircle className="mt-0.5 shrink-0" size={19} aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="group">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="mx-4 [border-top:0.5px_solid_var(--line)]" />
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label htmlFor="remember-me" className="flex min-h-[44px] cursor-pointer items-center gap-3 px-1 text-[15px] text-ink-2">
          <input
            id="remember-me"
            type="checkbox"
            className="h-5 w-5 rounded-md [accent-color:var(--accent)]"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Keep me signed in for 30 days
        </label>

        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  );
}
