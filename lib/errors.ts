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

export type SignupField = 'email' | 'password' | 'password_confirm';

export type SignupFailure = {
  /** Message for the form as a whole (empty when the field messages say it all). */
  message: string;
  /** Messages to show under individual fields. */
  fieldErrors: Partial<Record<SignupField, string>>;
};

function firstMessages(value: unknown, count = 1): string {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  const unique = [...new Set(value.filter((v): v is string => typeof v === 'string'))];
  return unique.slice(0, count).join(' ');
}

/**
 * What to show after a failed sign-up. Field problems are put under the field
 * they belong to (the backend reports them as email, password and
 * password_confirm), and "no answer at all" is not reported as a bad form.
 */
export function signupFailure(err: unknown): SignupFailure {
  const failed = (err ?? {}) as FailedRequest;
  const status = failed.response?.status;
  const none: SignupFailure['fieldErrors'] = {};

  if (!status) {
    return { message: "Can't reach the server. Check your connection and try again.", fieldErrors: none };
  }
  if (status === 429) {
    return { message: 'Too many requests. Please wait a few minutes and try again.', fieldErrors: none };
  }
  if (status === 502 || status === 503 || status === 504) {
    return { message: 'The service is temporarily unavailable. Please try again in a moment.', fieldErrors: none };
  }
  if (status >= 500) {
    return { message: 'Something went wrong on our side. Please try again.', fieldErrors: none };
  }

  const data = (failed.response?.data ?? {}) as ApiError;
  const fieldErrors: SignupFailure['fieldErrors'] = {};

  const email = firstMessages(data.email);
  if (email) {
    fieldErrors.email = /already exists/i.test(email)
      ? 'An account with this email already exists. Try signing in instead.'
      : email;
  }
  const password = firstMessages(data.password, 2);
  if (password) fieldErrors.password = password;
  const confirm = firstMessages(data.password_confirm);
  if (confirm) fieldErrors.password_confirm = confirm;

  if (Object.keys(fieldErrors).length > 0) {
    return { message: 'Please fix the highlighted fields.', fieldErrors };
  }
  return {
    message: firstMessages(data.detail) || firstMessages(data.non_field_errors) || 'Could not create your account. Please try again.',
    fieldErrors,
  };
}
