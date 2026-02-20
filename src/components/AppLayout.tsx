import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Calendar as CalendarIcon, ClipboardList,
  FileText, Shield, Clock, User, LogOut, Menu, X, ChevronDown,
  CheckSquare, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { profileApi } from "@/api/profile";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: "all" },
  { to: "/members", label: "Members", icon: Users, roles: "all" },
  { to: "/sessions", label: "Sessions", icon: ClipboardList, roles: "all" },
  { to: "/attendance", label: "Attendance", icon: CheckSquare, roles: "all" },
  { to: "/notulensi", label: "Meeting Notes", icon: FileText, roles: "all" },
  { to: "/pics", label: "PICs / Divisions", icon: Shield, roles: "all" },
  { to: "/piket", label: "Piket Schedule", icon: Clock, roles: "all" },
  { to: "/calendar", label: "Calendar", icon: CalendarIcon, roles: "all" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isCore } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 shrink-0">
            <img
              src="/logo.png"
              alt="ILO GDA Logo"
              className="h-9 w-9 object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xs font-bold text-sidebar-primary-foreground leading-tight">Darsanian Rohis</h1>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">Global Darussalam Academy</p>
          </div>
          <button className="ml-auto lg:hidden shrink-0" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <img
              src={profileApi.getPictureUrl(user.id)}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover bg-sidebar-accent"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a7a5c&color=fff`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{user.role}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent text-xs justify-start"
              onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
            >
              <User className="h-3.5 w-3.5 mr-1.5" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent text-xs"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background/95 backdrop-blur px-4 py-3 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}