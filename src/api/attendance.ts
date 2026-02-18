import { api } from "./client";
import type { Attendance, AttendanceSummary, User } from "@/types";

interface AttendanceResponse {
  success: boolean;
  attendance: Attendance;
}

interface HistoryResponse {
  success: boolean;
  records: Attendance[];
  summary: AttendanceSummary;
}

interface UserHistoryResponse extends HistoryResponse {
  user: User;
}

export const attendanceApi = {
  mark: (data: { session_id: number; user_id: number; status: string }) =>
    api.post<AttendanceResponse>("/api/attendance", data),

  markCore: (data: { session_id: number; user_id: number; status: string }) =>
    api.post<AttendanceResponse>("/api/attendance/core", data),

  myHistory: () => api.get<HistoryResponse>("/api/attendance/history"),

  allMembers: () =>
    api.get<{ success: boolean; members: User[] }>("/api/attendance/history/all"),

  userHistory: (userId: number) =>
    api.get<UserHistoryResponse>(`/api/attendance/history/${userId}`),

  exportDocx: (sessionId: number) =>
    api.request<Blob>(`/api/export/attendance/${sessionId}`, { method: "GET" }),
};
