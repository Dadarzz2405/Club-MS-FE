import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceApi } from "@/api/attendance";
import type { Attendance, AttendanceSummary, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Check, X, Clock, AlertCircle } from "lucide-react";

export default function AttendanceHistory() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isCore } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [membersList, setMembersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (userId) {
          const res = await attendanceApi.userHistory(parseInt(userId));
          setRecords(res.records);
          setSummary(res.summary);
          setTargetUser(res.user);
        } else {
          // Show list of members for admin or own history
          if (isCore) {
            const res = await attendanceApi.allMembers();
            setMembersList(res.members);
          } else {
            const res = await attendanceApi.myHistory();
            setRecords(res.records);
            setSummary(res.summary);
          }
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, isCore]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  // Admin member list view
  if (!userId && isCore && membersList.length > 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Attendance History</h1>
          <p className="page-description">Select a member to view their attendance</p>
        </div>

        {/* My own history link */}
        <Link to={`/attendance/history/${currentUser?.id}`} className="block mb-4">
          <Card className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <p className="font-semibold text-sm">📊 View My Attendance</p>
            </CardContent>
          </Card>
        </Link>

        <div className="space-y-2">
          {membersList.map((m) => (
            <Link key={m.id} to={`/attendance/history/${m.id}`}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{m.role}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "present": return "bg-success text-success-foreground";
      case "absent": return "bg-destructive text-destructive-foreground";
      case "excused": return "bg-warning text-warning-foreground";
      case "late": return "bg-info text-info-foreground";
      default: return "";
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        {(userId || isCore) && (
          <Link to="/attendance" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" />Back
          </Link>
        )}
        <h1 className="page-title">
          {targetUser ? `${targetUser.name}'s Attendance` : "My Attendance"}
        </h1>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <Card className="stat-card">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold font-display">{summary.total}</p>
          </Card>
          <Card className="stat-card">
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="text-2xl font-bold font-display text-success">{summary.present}</p>
          </Card>
          <Card className="stat-card">
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="text-2xl font-bold font-display text-destructive">{summary.absent}</p>
          </Card>
          <Card className="stat-card">
            <p className="text-xs text-muted-foreground">Excused</p>
            <p className="text-2xl font-bold font-display text-warning">{summary.excused}</p>
          </Card>
          <Card className="stat-card">
            <p className="text-xs text-muted-foreground">Late</p>
            <p className="text-2xl font-bold font-display text-info">{summary.late}</p>
          </Card>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Date</th>
                <th>Status</th>
                <th>Type</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium text-sm">{r.session_name}</td>
                  <td className="text-sm">{r.session_date}</td>
                  <td><Badge className={`capitalize text-xs ${statusColor(r.status)}`}>{r.status}</Badge></td>
                  <td className="text-xs capitalize">{r.attendance_type}</td>
                  <td className="text-xs text-muted-foreground">{r.timestamp ? new Date(r.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No attendance records</p>}
        </div>
      </Card>
    </div>
  );
}
