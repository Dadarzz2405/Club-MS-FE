import { api } from "./client";
import type { User } from "@/types";

export const profileApi = {
  update: (data: { username?: string; password?: string }) =>
    api.put<{ success: boolean; message: string; user: User }>("/api/profile", data),

  changePassword: (data: { old_password: string; new_password: string; confirm_password: string }) =>
    api.put<{ success: boolean; message: string }>("/api/profile/password", data),

  uploadPicture: (file: File) => {
    const formData = new FormData();
    formData.append("pfp", file);
    return api.request<{ success: boolean; message: string; url: string }>("/api/profile/picture", {
      method: "POST",
      body: formData,
    });
  },

  getPictureUrl: (userId: number) => {
    const base = import.meta.env.VITE_API_URL || "";
    return `${base}/api/profile/picture/${userId}`;
  },
};
