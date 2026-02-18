import { api } from "./client";
import type { Notulensi, NotulensiListItem, Session } from "@/types";

export const notulensiApi = {
  list: () =>
    api.get<{ success: boolean; items: NotulensiListItem[] }>("/api/notulensi"),

  get: (sessionId: number) =>
    api.get<{
      success: boolean;
      session: Session;
      notulensi: Notulensi | null;
      can_edit: boolean;
    }>(`/api/notulensi/${sessionId}`),

  save: (sessionId: number, content: string) =>
    api.post<{ success: boolean; notulensi: Notulensi }>(`/api/notulensi/${sessionId}`, { content }),

  delete: (notulensiId: number) =>
    api.delete<{ success: boolean; message: string }>(`/api/notulensi/by-id/${notulensiId}`),
};
