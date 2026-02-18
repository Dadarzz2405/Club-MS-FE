import { api } from "./client";
import type { User } from "@/types";

interface MembersResponse {
  success: boolean;
  members: User[];
}

interface MemberResponse {
  success: boolean;
  message: string;
  member: User;
}

export const membersApi = {
  list: () => api.get<MembersResponse>("/api/members"),

  add: (data: { name: string; email: string; class_name?: string; role?: string }) =>
    api.post<MemberResponse>("/api/members", data),

  batchAdd: (bulk_text: string) =>
    api.post<{ success: boolean; added: number; errors: string[] }>("/api/members/batch-add", { bulk_text }),

  batchAddCsv: (formData: FormData) =>
    api.request<{ success: boolean; added: number; errors: string[] }>("/api/members/batch-add", {
      method: "POST",
      body: formData,
    }),

  batchDelete: (ids: number[]) =>
    api.post<{ success: boolean; deleted: number; failed: string[] }>("/api/members/batch-delete", { ids }),

  deleteMember: (userId: number) =>
    api.delete<{ success: boolean; message: string }>(`/api/members/${userId}`),

  changeRole: (userId: number, role: string) =>
    api.put<MemberResponse>(`/api/members/${userId}/role`, { role }),

  assignPic: (userId: number, pic_id: number | null) =>
    api.put<MemberResponse>(`/api/members/${userId}/pic`, { pic_id }),

  toggleAttendancePermission: (userId: number, can_mark?: boolean) =>
    api.put<{ success: boolean; can_mark_attendance: boolean; member: User }>(
      `/api/members/${userId}/attendance-permission`,
      can_mark !== undefined ? { can_mark } : {}
    ),
};
