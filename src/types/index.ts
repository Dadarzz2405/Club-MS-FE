export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "ketua" | "pembina" | "member";
  class_name: string | null;
  can_mark_attendance: boolean;
  must_change_password: boolean;
  pic_id: number | null;
  pic_name: string | null;
  profile_picture_url: string;
}

export interface Session {
  id: number;
  name: string;
  date: string;
  is_locked: boolean;
  session_type: "all" | "core" | "event";
  description: string | null;
  created_at: string | null;
  assigned_pics: { id: number; name: string }[];
  attendance_count: number;
}

export interface Attendance {
  id: number;
  session_id: number;
  session_name: string | null;
  session_date: string | null;
  user_id: number;
  status: "present" | "absent" | "excused" | "late";
  attendance_type: "regular" | "core";
  timestamp: string | null;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  excused: number;
  late: number;
  total: number;
}

export interface Pic {
  id: number;
  name: string;
  description: string | null;
  created_at: string | null;
  member_count: number;
  members: { id: number; name: string }[];
}

export interface Notulensi {
  id: number;
  session_id: number;
  session_name: string | null;
  session_date: string | null;
  content: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotulensiListItem {
  session_id: number;
  session_name: string;
  session_date: string;
  has_notulensi: boolean;
  notulensi: Notulensi | null;
}

export interface PiketDay {
  day_of_week: number;
  day_name: string;
  is_today: boolean;
  assignments: PiketAssignment[];
  updated_at: string | null;
}

export interface PiketAssignment {
  user_id: number;
  name: string;
  class_name: string | null;
  email: string;
  is_current_user: boolean;
}

export interface EmailLog {
  id: number;
  day_of_week: number;
  day_name: string;
  recipients_count: number;
  recipients: string[];
  sent_at: string | null;
  status: string;
  error_message: string | null;
}

export interface FeedUpcoming {
  id: number;
  name: string;
  date: string;
  pic: string;
}

export interface FeedRecent {
  id: number;
  session_name: string;
  session_date: string;
  summary: string;
  updated_at: string;
}

export interface CalendarEvent {
  title: string;
  start: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    type: "rohis_session" | "islamic_holiday";
    session_id?: number;
    hijri?: string;
  };
}

export interface ChatReply {
  action: string;
  message: string;
  route?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: T | boolean | string | undefined;
}
