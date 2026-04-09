'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 401 — the interceptor handles that
      retry: (count, error: any) => {
        if (error?.response?.status === 401) return false;
        return count < 2;
      },
      staleTime: 30_000,
    },
  },
});

function AuthHydrator({ children }: { children: ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    // Rehydrate access token from sessionStorage / localStorage on mount
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>{children}</AuthHydrator>
    </QueryClientProvider>
  );
}
