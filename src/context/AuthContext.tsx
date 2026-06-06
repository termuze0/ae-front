import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import API, { getMe, loginUser, registerUser, refreshAccessToken } from '../services/api';
import type { AuthUser } from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = 'ae_auth_token';
const REFRESH_KEY = 'ae_refresh_token';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setAuthToken = (nextToken: string | null) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      API.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      setToken(nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      delete API.defaults.headers.common.Authorization;
      setToken(null);
    }
  };

  const setRefreshToken = (nextToken: string | null) => {
    if (nextToken) {
      localStorage.setItem(REFRESH_KEY, nextToken);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
  };

  const setTokens = (accessToken: string | null, refreshToken: string | null) => {
    setAuthToken(accessToken);
    setRefreshToken(refreshToken);
  };

  const refreshUser = async (authToken?: string) => {
    let accessToken = authToken || token;
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    if (!accessToken && refreshToken) {
      try {
        accessToken = await refreshAccessToken(refreshToken);
        setAuthToken(accessToken);
      } catch (refreshError) {
        console.warn('Unable to refresh access token:', refreshError);
        setTokens(null, null);
        setLoading(false);
        return;
      }
    }

    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const profile = await getMe();
      setUser(profile);
      setError(null);
    } catch (err: any) {
      console.warn('Unable to refresh user session:', err);
      setTokens(null, null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      API.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      refreshUser(storedToken);
    } else {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const tokens = await loginUser(identifier, password);
      setTokens(tokens.access, tokens.refresh);
      const profile = await getMe();
      setUser(profile);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await registerUser(name, email, password);
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setTokens(null, null);
    setUser(null);
    setError(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      error,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
