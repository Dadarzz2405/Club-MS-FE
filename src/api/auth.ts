import { api } from "./client";
import type { User } from "@/types";

interface LoginResponse {
  success: boolean;
  token: string;       // ← add this
  user: User;
  must_change_password: boolean;
}

interface MeResponse {
  success: boolean;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/api/auth/login", { email, password }),

  logout: () => api.post<{ success: boolean }>("/api/auth/logout"),

  me: () => api.get<MeResponse>("/api/auth/me"),
};