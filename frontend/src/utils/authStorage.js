export const AUTH_STORAGE_KEY = 'docufy.auth';

function normalizeAuth(value) {
  if (!value || typeof value !== 'object') return null;

  const token = typeof value.token === 'string' ? value.token.trim() : '';
  if (!token) return null;

  const user = value.user && typeof value.user === 'object' ? value.user : null;
  return { token, user };
}

export function getStoredAuth() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return normalizeAuth(JSON.parse(raw));
  } catch {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Storage may be unavailable in privacy mode; ignore.
    }
    return null;
  }
}

export function getStoredToken() {
  return getStoredAuth()?.token || null;
}

export function saveAuth(auth) {
  const normalized = normalizeAuth(auth);
  if (!normalized) return null;

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
