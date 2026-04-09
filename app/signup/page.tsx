'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, saveAuthCredentials } from '@/store/auth';
import apiClient from '@/lib/api';
import { ApiError } from '@/types';
import Link from 'next/link';
import { Sprout, AlertCircle, CheckCircle2, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components';

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
      
    } catch (err: any) {
      const errorData: ApiError = err.response?.data || {};
      
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a few minutes and try again.');
      } else {
        if (errorData.email && Array.isArray(errorData.email)) {
          setFieldErrors(prev => ({ ...prev, email: errorData.email![0] }));
        }
        if (errorData.password && Array.isArray(errorData.password)) {
          setFieldErrors(prev => ({ ...prev, password: errorData.password![0] }));
        }
        if (errorData.password2 && Array.isArray(errorData.password2)) {
          setFieldErrors(prev => ({ ...prev, password_confirm: errorData.password2![0] }));
        }
        
        setError(errorData.detail || errorData.non_field_errors?.[0] || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen grain-texture bg-gradient-to-br from-sage-50 to-earth-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lifted border-2 border-sage-200 p-8 text-center animate-scale-in">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-sage-600" size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-earth-900 mb-4">Account created</h2>
            <p className="text-earth-600 mb-6">Your account has been created successfully. Redirecting to your dashboard...</p>
            <div className="animate-spin h-8 w-8 border-4 border-sage-200 border-t-sage-600 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grain-texture bg-gradient-to-br from-sage-50 to-earth-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lifted border-2 border-earth-200 p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center gap-3 text-sage-800 mb-4 group">
              <Sprout size={36} className="transition-transform group-hover:rotate-12" />
              <span className="text-3xl font-serif font-bold">CropAI Kenya</span>
            </Link>
            <h2 className="text-2xl font-serif font-bold text-earth-900 mb-2">Create your account</h2>
            <p className="text-earth-600">Just email and password to get started</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border-2 border-red-200 p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-earth-900 mb-2">
                <Mail size={16} />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-sage-500 focus:ring-opacity-20 text-earth-900 transition ${
                  fieldErrors.email ? 'border-red-500' : 'border-earth-300 focus:border-sage-500'
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-earth-900 mb-2">
                <Lock size={16} />
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="At least 8 characters"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-sage-500 focus:ring-opacity-20 text-earth-900 transition ${
                  fieldErrors.password ? 'border-red-500' : 'border-earth-300 focus:border-sage-500'
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="password_confirm" className="flex items-center gap-2 text-sm font-medium text-earth-900 mb-2">
                <Lock size={16} />
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                placeholder="Re-enter your password"
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-sage-500 focus:ring-opacity-20 text-earth-900 transition ${
                  fieldErrors.password_confirm ? 'border-red-500' : 'border-earth-300 focus:border-sage-500'
                }`}
                value={formData.password_confirm}
                onChange={handleChange}
              />
              {fieldErrors.password_confirm && <p className="mt-1 text-sm text-red-600">{fieldErrors.password_confirm}</p>}
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full shadow-md hover:shadow-lg">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-earth-600">
            Already have an account?{' '}
            <Link href="/login" className="text-sage-700 hover:text-sage-800 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}