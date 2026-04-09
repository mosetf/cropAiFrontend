import { create } from 'zustand';
import { User, LoginResponse } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setCredentials: (response: LoginResponse, remember: boolean) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setCredentials: (response: LoginResponse, remember: boolean) => {
    set({
      accessToken: response.access,
      user: response.user,
      isAuthenticated: true,
      error: null,
    });
    // remember me → localStorage (survives browser restart)
    // default       → sessionStorage (gone on tab close)
    saveAuthCredentials(response, remember);
  },

  logout: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
    clearAuthCredentials();
  },

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),

  checkAuth: () => {
    if (typeof window === 'undefined') return;

    // Check localStorage first (remember me), then sessionStorage
    const raw =
      localStorage.getItem('cropai_auth') ||
      sessionStorage.getItem('cropai_auth');

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        accessToken: string;
        user: User;
      };
      if (parsed.accessToken && parsed.user) {
        set({
          accessToken: parsed.accessToken,
          user: parsed.user,
          isAuthenticated: true,
        });
      }
    } catch {
      clearAuthCredentials();
    }
  },
}));

export const saveAuthCredentials = (
  response: LoginResponse,
  remember = false
) => {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({
    accessToken: response.access,
    user: response.user,
  });
  if (remember) {
    localStorage.setItem('cropai_auth', payload);
    sessionStorage.removeItem('cropai_auth');
  } else {
    sessionStorage.setItem('cropai_auth', payload);
    localStorage.removeItem('cropai_auth');
  }
};

export const clearAuthCredentials = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cropai_auth');
  sessionStorage.removeItem('cropai_auth');
};
