import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/types";
import { authApi } from "@/api/auth";
import { api, ApiError } from "@/api/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isCore: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!api.getToken()) {
      setUser(null);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.user);
    } catch {
      setUser(null);
      api.clearToken();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    api.setToken(res.token);
    setUser(res.user);
    return { mustChangePassword: res.must_change_password };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    api.clearToken();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isCore = ["admin", "ketua", "pembina"].includes(user?.role || "");

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAdmin, isCore }}>
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}