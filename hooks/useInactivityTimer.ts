import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { clearAuthCredentials } from '@/store/auth';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export const useInactivityTimer = () => {
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logout();
        clearAuthCredentials();
        window.location.href = '/login?reason=timeout';
      }, INACTIVITY_TIMEOUT);
    };

    // Events that reset the inactivity timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Set initial timer
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, logout]);
};
