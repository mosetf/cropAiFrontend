import type { ApiError } from '@/types';

type FailedRequest = {
  response?: { status?: number; data?: unknown };
};

/**
 * Text for a failed sign-in. It separates "the server answered and said no"
 * from "no answer came back at all", so a network or deployment problem is not
 * reported to the user as a wrong password.
 */
export function loginErrorMessage(err: unknown): string {
  const failed = (err ?? {}) as FailedRequest;
  const status = failed.response?.status;

  if (!status) {
    return "Can't reach the server. Check your connection and try again.";
  }
  if (status === 429) {
    return 'Too many requests. Please wait a few minutes and try again.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'The service is temporarily unavailable. Please try again in a moment.';
  }
  if (status >= 500) {
    return 'Something went wrong on our side. Please try again.';
  }

  const data = (failed.response?.data ?? {}) as ApiError;
  if (status === 401) {
    return 'Wrong email or password.';
  }
  if (status === 400 && (data.email || data.password)) {
    return 'Enter your email address and password.';
  }
  return data.detail || data.non_field_errors?.[0] || 'Could not sign in. Please try again.';
}
