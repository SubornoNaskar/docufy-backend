import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loginUser, registerUser, UNAUTHORIZED_EVENT } from '../api/apiClient';
import { clearAuth, getStoredAuth, saveAuth } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const applyAuth = useCallback((nextAuth) => {
    const normalized = saveAuth(nextAuth);
    setAuth(normalized);
    return normalized;
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await loginUser(credentials);
      const token = response?.accessToken;

      if (!token) {
        throw new Error('The server did not return an access token.');
      }

      return applyAuth({ token, user: response.user || null });
    },
    [applyAuth]
  );

  // Register returns only UserDto, so sign in with the same credentials immediately.
  const register = useCallback(
    async (values) => {
      await registerUser(values);
      return login({ username: values.username, password: values.password });
    },
    [login]
  );

  const logout = useCallback(() => {
    clearAuth();
    setAuth(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
      setAuth(null);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      user: auth?.user || null,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout,
    }),
    [auth, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
