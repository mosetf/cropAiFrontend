import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ── Refresh token lock ──────────────────────────────────────────────
// Prevents the "refresh storm" where multiple concurrent 401s each
// trigger their own refresh, causing a cascade of failures.
let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: () => void;
}> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers.forEach(({ reject }) => reject());
  refreshSubscribers = [];
}

function queueRetry(): Promise<string> {
  return new Promise((resolve, reject) => {
    refreshSubscribers.push({ resolve, reject });
  });
}

// ── Request interceptor ─────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return queueRetry().then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const response = await refreshClient.post('/api/v1/auth/refresh/');
        const { access } = response.data;

        useAuthStore.getState().setAccessToken(access);
        onRefreshed(access);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        onRefreshFailed();
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
