'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Check } from 'lucide-react';
import { useAuthStore, saveAuthCredentials } from '@/store/auth';
import apiClient from '@/lib/api';
import { signupFailure } from '@/lib/errors';
import { Button } from '@/components';
import AuthShell from '@/components/AuthShell';

type FieldName = 'email' | 'password' | 'password_confirm';

const FIELD_ORDER: FieldName[] = ['email', 'password', 'password_confirm'];

export default function SignupPage() {
  const router = useRouter();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Check your email format';
    }
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) {
      errors.password = 'Use at least 8 characters';
    }
    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords don\'t match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/v1/auth/register/', {
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });

      // Backend returns access token and user immediately
      setCredentials(response.data, false);
      saveAuthCredentials(response.data, false);

      setSuccess(true);

      // Show success message briefly, then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: unknown) {
      const failure = signupFailure(err);
      setFieldErrors(prev => ({ ...prev, ...failure.fieldErrors }));
      setError(failure.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell title="You're in" subtitle="Taking you to your dashboard…">
        <div role="status" className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-good-soft text-good">
          <Check size={34} strokeWidth={2.6} aria-hidden="true" />
        </div>
      </AuthShell>
    );
  }

  const inputProps = (name: FieldName, label: string, type: string, autoComplete: string) => ({
    id: name,
    name,
    type,
    autoComplete,
    placeholder: label,
    'aria-label': label,
    'aria-invalid': fieldErrors[name] ? (true as const) : undefined,
    'aria-describedby': fieldErrors[name] ? `${name}-error` : undefined,
    className: `field ${fieldErrors[name] ? 'field-bad' : ''}`,
    value: formData[name],
    onChange: handleChange,
  });

  const visibleFieldErrors = FIELD_ORDER.filter((name) => fieldErrors[name]);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Just an email and a password to get started."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-accent hover:underline hover:underline-offset-4">
            Sign in
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

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div className="group">
          <input {...inputProps('email', 'Email', 'email', 'email')} />
          <div className="mx-4 [border-top:0.5px_solid_var(--line)]" />
          <input {...inputProps('password', 'Password', 'password', 'new-password')} />
          <div className="mx-4 [border-top:0.5px_solid_var(--line)]" />
          <input {...inputProps('password_confirm', 'Confirm password', 'password', 'new-password')} />
        </div>

        {visibleFieldErrors.length > 0 ? (
          <ul className="space-y-1 px-1 text-[14px] text-bad">
            {visibleFieldErrors.map((name) => (
              <li key={name} id={`${name}-error`}>{fieldErrors[name]}</li>
            ))}
          </ul>
        ) : (
          <p className="px-1 text-[13px] text-ink-3">Use at least 8 characters.</p>
        )}

        <div className="pt-3">
          <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
