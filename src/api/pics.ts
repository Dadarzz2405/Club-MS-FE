import { api } from "./client";
import type { Pic } from "@/types";

interface PicsResponse {
  success: boolean;
  pics: Pic[];
}

export const picsApi = {
  list: () => api.get<PicsResponse>("/api/pics"),

  create: (data: { name: string; description?: string }) =>
    api.post<{ success: boolean; message: string; pic: Pic }>("/api/pics", data),

  delete: (picId: number) =>
    api.delete<{ success: boolean; message: string }>(`/api/pics/${picId}`),
};
