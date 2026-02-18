import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { piketApi } from "@/api/piket";
import type { EmailLog } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";

export default function PiketLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    piketApi.getLogs()
      .then((res) => setLogs(res.logs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/piket" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" />Back to Piket
        </Link>
        <h1 className="page-title">Email Reminder Logs</h1>
        <p className="page-description">History of sent piket reminders</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Recipients</th>
                <th>Status</th>
                <th>Sent At</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-medium text-sm">{log.day_name}</td>
                  <td className="text-sm">{log.recipients_count} ({log.recipients.join(", ")})</td>
                  <td>
                    <Badge variant={log.status === "success" ? "default" : log.status === "skipped" ? "secondary" : "destructive"} className="text-xs capitalize">
                      {log.status}
                    </Badge>
                  </td>
                  <td className="text-xs text-muted-foreground">{log.sent_at ? new Date(log.sent_at).toLocaleString() : "—"}</td>
                  <td className="text-xs text-muted-foreground max-w-[200px] truncate">{log.error_message || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No email logs yet</p>}
        </div>
      </Card>
    </div>
  );
}
