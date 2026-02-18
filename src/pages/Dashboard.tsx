import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { feedApi } from "@/api/misc";
import type { FeedUpcoming, FeedRecent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard, Users, ClipboardList, CheckSquare, FileText,
  Shield, Clock, Calendar, ArrowRight, Loader2,
} from "lucide-react";

const quickLinks = [
  { to: "/members", label: "Members", icon: Users, description: "Manage members" },
  { to: "/sessions", label: "Sessions", icon: ClipboardList, description: "View sessions" },
  { to: "/attendance", label: "Attendance", icon: CheckSquare, description: "Track attendance" },
  { to: "/notulensi", label: "Notes", icon: FileText, description: "Meeting minutes" },
  { to: "/pics", label: "PICs", icon: Shield, description: "Divisions" },
  { to: "/piket", label: "Piket", icon: Clock, description: "Duty schedule" },
  { to: "/calendar", label: "Calendar", icon: Calendar, description: "View calendar" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<FeedUpcoming[]>([]);
  const [recent, setRecent] = useState<FeedRecent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedApi.get()
      .then((res) => {
        setUpcoming(res.upcoming);
        setRecent(res.recent);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Assalamu'alaikum, {user?.name} 👋</h1>
        <p className="page-description">Welcome to the Rohis Management System dashboard</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-start gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <link.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      {new Date(s.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PIC: {s.pic}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Meeting Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">Recent Meeting Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No meeting notes yet</p>
            ) : (
              <div className="space-y-3">
                {recent.map((n) => (
                  <Link key={n.id} to={`/notulensi/${n.id}`} className="block">
                    <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{n.session_name}</p>
                        <span className="text-xs text-muted-foreground">{n.updated_at}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
