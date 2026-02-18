import { api } from "./client";
import type { CalendarEvent, FeedUpcoming, FeedRecent, ChatReply } from "@/types";

export const feedApi = {
  get: () =>
    api.get<{ success: boolean; upcoming: FeedUpcoming[]; recent: FeedRecent[] }>("/api/feed"),
};

export const calendarApi = {
  getEvents: () => api.get<CalendarEvent[]>("/api/calendar"),
};

export const chatApi = {
  send: (message: string) =>
    api.post<{ reply: ChatReply }>("/api/chat", { message }),
};
