import { api } from "./client";
import type { PiketDay, EmailLog } from "@/types";

export const piketApi = {
  getSchedule: () =>
    api.get<{ success: boolean; schedule: PiketDay[] }>("/api/piket"),

  update: (day_of_week: number, user_ids: number[]) =>
    api.post<{ success: boolean; message: string }>("/api/piket", { day_of_week, user_ids }),

  clear: (day_of_week: number) =>
    api.delete<{ success: boolean; message: string }>(`/api/piket/${day_of_week}`),

  getLogs: () =>
    api.get<{ success: boolean; logs: EmailLog[] }>("/api/piket/logs"),

  testReminder: (day_of_week?: number) =>
    api.post<{ success: boolean; message: string; failed_emails?: string[] }>("/api/piket/test", day_of_week !== undefined ? { day_of_week } : {}),
};
