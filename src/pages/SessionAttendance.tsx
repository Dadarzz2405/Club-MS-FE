import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceApi } from "@/api/attendance";
import { membersApi } from "@/api/members";
import { sessionsApi } from "@/api/sessions";
import type { User, Attendance } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/api/client";
import { Loader2, Download, Lock, ArrowLeft, Check, X, Clock, AlertCircle } from "lucide-react";

const STATUS_OPTIONS = ["present", "absent", "excused", "late"] as const;

const statusIcon = (s: string) => {
  switch (s) {
    case "present": return <Check className="h-3.5 w-3.5" />;
    case "absent": return <X className="h-3.5 w-3.5" />;
    case "excused": return <AlertCircle className="h-3.5 w-3.5" />;
    case "late": return <Clock className="h-3.5 w-3.5" />;
    default: return null;
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "present": return "bg-success text-success-foreground";
    case "absent": return "bg-destructive text-destructive-foreground";
    case "excused": return "bg-warning text-warning-foreground";
    case "late": return "bg-info text-info-foreground";
    default: return "";
  }
};

export default function SessionAttendance() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user: currentUser, isCore } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<{ id: number; name: string; is_locked: boolean; session_type: string } | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [marked, setMarked] = useState<Map<number, Attendance>>(new Map());
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const sid = parseInt(sessionId);

    const fetchAll = async () => {
      try {
        const [statusRes, membersRes] = await Promise.all([
          sessionsApi.getStatus(sid),
          membersApi.list(),
        ]);
        setSession({ id: statusRes.session_id, name: statusRes.name, is_locked: statusRes.is_locked, session_type: "" });
        setMembers(membersRes.members);

        // Get existing attendance by checking each user's history (simplified)
        // We'll work with the mark endpoint which returns 409 if already marked
      } catch {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [sessionId]);

  const handleMark = async (userId: number, status: string) => {
    if (!sessionId || session?.is_locked) return;
    setMarkingId(userId);
    try {
      const res = await attendanceApi.mark({ session_id: parseInt(sessionId), user_id: userId, status });
      setMarked((prev) => new Map(prev).set(userId, res.attendance));
      toast({ title: "Attendance marked" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkCore = async (userId: number, status: string) => {
    if (!sessionId || session?.is_locked) return;
    setMarkingId(userId);
    try {
      const res = await attendanceApi.markCore({ session_id: parseInt(sessionId), user_id: userId, status });
      setMarked((prev) => new Map(prev).set(userId, res.attendance));
      toast({ title: "Core attendance marked" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setMarkingId(null);
    }
  };

  const handleExport = async () => {
    if (!sessionId) return;
    try {
      const blob = await attendanceApi.exportDocx(parseInt(sessionId));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${session?.name || sessionId}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Export failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!session) return <div className="page-container"><p>Session not found</p></div>;

  const regularMembers = members.filter(m => m.role === "member");
  const coreMembers = members.filter(m => ["admin", "ketua", "pembina"].includes(m.role));

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/sessions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" />Back to Sessions
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{session.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {session.is_locked && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Locked</Badge>}
            </div>
          </div>
          {isCore && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1.5" />Export DOCX
            </Button>
          )}
        </div>
      </div>

      {/* Regular Attendance */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Regular Attendance</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {regularMembers.map((m) => {
                  const att = marked.get(m.id);
                  return (
                    <tr key={m.id}>
                      <td>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.class_name || ""}</p>
                      </td>
                      <td>
                        {att ? (
                          <Badge className={`capitalize ${statusColor(att.status)}`}>
                            {statusIcon(att.status)} {att.status}
                          </Badge>
                        ) : session.is_locked ? (
                          <span className="text-xs text-muted-foreground">Not marked</span>
                        ) : (
                          <div className="flex gap-1.5 flex-wrap">
                            {STATUS_OPTIONS.map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs capitalize"
                                disabled={markingId === m.id}
                                onClick={() => handleMark(m.id, s)}
                              >
                                {markingId === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : statusIcon(s)}
                                <span className="ml-1">{s}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Core Attendance */}
      {isCore && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Core Team Attendance</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coreMembers.map((m) => {
                    const att = marked.get(m.id);
                    return (
                      <tr key={m.id}>
                        <td className="font-medium text-sm">{m.name}</td>
                        <td><Badge variant="outline" className="capitalize text-xs">{m.role}</Badge></td>
                        <td>
                          {att ? (
                            <Badge className={`capitalize ${statusColor(att.status)}`}>
                              {statusIcon(att.status)} {att.status}
                            </Badge>
                          ) : session.is_locked ? (
                            <span className="text-xs text-muted-foreground">Not marked</span>
                          ) : (
                            <div className="flex gap-1.5 flex-wrap">
                              {STATUS_OPTIONS.map((s) => (
                                <Button
                                  key={s}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs capitalize"
                                  disabled={markingId === m.id}
                                  onClick={() => handleMarkCore(m.id, s)}
                                >
                                  {statusIcon(s)}
                                  <span className="ml-1">{s}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
