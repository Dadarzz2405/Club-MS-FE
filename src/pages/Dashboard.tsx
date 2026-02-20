import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { feedApi } from "@/api/misc";
import type { FeedUpcoming, FeedRecent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, ClipboardList, CheckSquare, FileText,
  Shield, Clock, Calendar, ArrowRight, Loader2,
  TrendingUp, BookOpen, CalendarDays,
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

  const stats = [
    {
      label: "Upcoming Sessions",
      value: upcoming.length,
      icon: CalendarDays,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Meeting Notes",
      value: recent.length,
      icon: BookOpen,
      color: "text-accent-foreground",
      bg: "bg-accent/15",
    },
    {
      label: "Next Session",
      value: upcoming[0]?.date
        ? new Date(upcoming[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
        : "—",
      icon: TrendingUp,
      color: "text-info-foreground",
      bg: "bg-info/15",
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Assalamu'alaikum, {user?.name} 👋</h1>
        <p className="page-description">Welcome to the Darsanian Rohis dashboard</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="border-none shadow-md bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
        {/* Upcoming Sessions — highlighted */}
        <Card className="border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/40" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Upcoming Sessions
              </CardTitle>
              <Link to="/sessions" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
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
                {upcoming.map((s, i) => (
                  <div
                    key={s.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      i === 0
                        ? "bg-primary/5 border border-primary/15"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {new Date(s.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PIC: {s.pic}</p>
                    </div>
                    {i === 0 && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Next
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Meeting Notes — highlighted */}
        <Card className="border-accent/20 shadow-lg shadow-accent/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent/40" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent-foreground" />
                Latest Notulensi
              </CardTitle>
              <Link to="/notulensi" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
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
                {recent.map((n, i) => (
                  <Link key={n.id} to={`/notulensi/${n.id}`} className="block">
                    <div className={`p-3 rounded-lg transition-colors ${
                      i === 0
                        ? "bg-accent/10 border border-accent/20 hover:bg-accent/15"
                        : "bg-muted/50 hover:bg-muted"
                    }`}>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{n.session_name}</p>
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
