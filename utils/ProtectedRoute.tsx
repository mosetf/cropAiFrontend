'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface Props {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  // Start in "checking" state so we never flash the unauthenticated content
  const [ready, setReady] = useState(false);

  useEffect(() => {
    checkAuth();
    setReady(true);
  }, [checkAuth]);

  // Still loading from storage — show nothing (avoids the flash)
  if (!ready) return null;

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  return <>{children}</>;
};
