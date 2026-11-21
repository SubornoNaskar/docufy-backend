export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (!error?.response) {
    return 'Unable to reach the server. Please check that the backend is running and try again.';
  }

  if (status === 401) {
    return 'Invalid username or password. Please try again.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    const firstFieldError = Object.values(data.data).find(Boolean);
    if (typeof firstFieldError === 'string') return firstFieldError;
  }

  const message =
    (typeof data === 'string' && data.trim()) ||
    data?.message ||
    data?.error ||
    data?.title ||
    error?.message;

  if (typeof message !== 'string' || !message.trim()) return fallback;

  if (/bad credentials|invalid username or password/i.test(message)) {
    return 'Invalid username or password. Please try again.';
  }

  return message;
}
