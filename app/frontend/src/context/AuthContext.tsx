/**
 * context/AuthContext.tsx — Global auth state.
 *
 * Provides:
 *   user         — the logged-in user object (null if not authenticated)
 *   loading      — true while the initial /api/me check is in flight
 *   login()      — store token + set user
 *   logout()     — clear token + reset user
 *   refreshUser()— re-fetch /api/me (useful after profile updates)
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

import { ApiError, type AuthUser, authApi } from "../lib/apiClient";
import { clearToken, getToken, setToken } from "../lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Start loading=true so ProtectedRoute waits for the initial check
  const [loading, setLoading] = useState(true);

  /**
   * On mount, try to validate an existing token by calling /api/me.
   * This handles page refreshes — the user stays logged in if the token is valid.
   */
  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.data.user);
    } catch (err) {
      // Token expired or invalid — clear it and treat as logged out
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback((token: string, newUser: AuthUser) => {
    setToken(token);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
