import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    try {
      const data = await authAPI.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || "Login failed" };
    }
  }

  async function signup(username, email, password) {
    try {
      const data = await authAPI.signup({ username, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || "Signup failed" };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  }

  const value = useMemo(
    () => ({ user, isAuthenticated, loading, login, signup, logout }),
    [user, isAuthenticated, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

