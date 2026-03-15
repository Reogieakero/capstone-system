import { sileo } from 'sileo';
import RateLimitToastBody from '../components/register/RateLimitToastBody';

export const PASSWORD_TOAST_ID = 'pass-req';

export function showSuccessToast(options) {
  return sileo.success(options);
}

export function showErrorToast(options) {
  return sileo.error(options);
}

export function showInfoToast(options) {
  return sileo.info(options);
}

export function showWarningToast(options) {
  return sileo.warning(options);
}

export function showActionToast(options) {
  return sileo.action(options);
}

export function dismissToast(id) {
  sileo.dismiss(id);
}

export function clearToasts(position) {
  sileo.clear(position);
}

export function showPromiseToast(promise, options) {
  return sileo.promise(promise, options);
}

export const notify = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
  action: showActionToast,
  dismiss: dismissToast,
  clear: clearToasts,
  promise: showPromiseToast,
};

export function dismissPasswordToast() {
  dismissToast(PASSWORD_TOAST_ID);
}

export function showPasswordRequirementsToast({ hasMismatch, requirementList }) {
  const showToast = hasMismatch ? showWarningToast : showInfoToast;
  showToast({
    id: PASSWORD_TOAST_ID,
    title: 'Password requirements',
    description: requirementList,
    duration: 4000,
  });
}

export function showPasswordSuccessToast() {
  showSuccessToast({
    id: PASSWORD_TOAST_ID,
    title: 'Security criteria met',
    description: 'Your password is strong and ready to use.',
    duration: 2000,
  });
}

export function showRegisterPromiseToast(promise) {
  return showPromiseToast(promise, {
    loading: { title: 'Creating your account...' },
    success: { title: 'Account created. Check your email to confirm sign in.' },
    error: (err) => {
      if (err?.code === 'over_email_send_rate_limit' || err?.status === 429) {
        return {
          title: 'Email rate limit reached',
          description: <RateLimitToastBody initialSeconds={Number(err?.retryAfterSeconds) || 60} />,
          duration: 7000,
        };
      }

      return { title: err?.message || 'Registration failed. Please try again.' };
    },
  });
}

export function showVerifyPromiseToast(promise) {
  return showPromiseToast(promise, {
    loading: { title: 'Verifying your code...' },
    success: { title: 'Email verified! Redirecting to login...' },
    error: { title: 'Invalid or expired code. Please try again.' },
  });
}

export function showLoginPromiseToast(promise) {
  return showPromiseToast(promise, {
    loading: { title: 'Signing you in...' },
    success: { title: 'Welcome back!' },
    error: (err) => ({ title: err?.message || 'Login failed. Check your credentials and try again.' }),
  });
}
