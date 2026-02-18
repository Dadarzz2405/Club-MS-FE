import { api } from "./client";
import type { Session } from "@/types";

interface SessionsResponse {
  success: boolean;
  sessions: Session[];
}

interface SessionResponse {
  success: boolean;
  message: string;
  session: Session;
}

export const sessionsApi = {
  list: (type?: string) =>
    api.get<SessionsResponse>("/api/sessions", type ? { type } : undefined),

  create: (data: { name: string; date: string; session_type: string; description?: string }) =>
    api.post<SessionResponse>("/api/sessions", data),

  delete: (sessionId: number) =>
    api.delete<{ success: boolean; message: string }>(`/api/sessions/${sessionId}`),

  lock: (sessionId: number) =>
    api.post<{ success: boolean; is_locked: boolean; session: Session }>(`/api/sessions/${sessionId}/lock`),

  getStatus: (sessionId: number) =>
    api.get<{ success: boolean; is_locked: boolean; session_id: number; name: string }>(`/api/sessions/${sessionId}/status`),

  getPics: (sessionId: number) =>
    api.get<{ success: boolean; session_id: number; assigned_pics: { id: number; name: string; description: string }[] }>(
      `/api/sessions/${sessionId}/pics`
    ),

  assignPics: (sessionId: number, pic_ids: number[]) =>
    api.put<SessionResponse>(`/api/sessions/${sessionId}/pics`, { pic_ids }),

  removePic: (sessionId: number, picId: number) =>
    api.delete<{ success: boolean; message: string }>(`/api/sessions/${sessionId}/pics/${picId}`),
};
