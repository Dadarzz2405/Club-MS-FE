import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { ChatWidget } from "@/components/ChatWidget";
import Login from "@/pages/Login";
import ChangePassword from "@/pages/ChangePassword";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import Sessions from "@/pages/Sessions";
import SessionAttendance from "@/pages/SessionAttendance";
import AttendanceHistory from "@/pages/AttendanceHistory";
import Pics from "@/pages/Pics";
import NotulensiList from "@/pages/NotulensiList";
import NotulensiEditor from "@/pages/NotulensiEditor";
import Piket from "@/pages/Piket";
import PiketLogs from "@/pages/PiketLogs";
import CalendarPage from "@/pages/CalendarPage";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
    <ChatWidget />
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/members" element={<ProtectedLayout><Members /></ProtectedLayout>} />
            <Route path="/sessions" element={<ProtectedLayout><Sessions /></ProtectedLayout>} />
            <Route path="/attendance" element={<ProtectedLayout><AttendanceHistory /></ProtectedLayout>} />
            <Route path="/attendance/session/:sessionId" element={<ProtectedLayout><SessionAttendance /></ProtectedLayout>} />
            <Route path="/attendance/history/:userId" element={<ProtectedLayout><AttendanceHistory /></ProtectedLayout>} />
            <Route path="/notulensi" element={<ProtectedLayout><NotulensiList /></ProtectedLayout>} />
            <Route path="/notulensi/:sessionId" element={<ProtectedLayout><NotulensiEditor /></ProtectedLayout>} />
            <Route path="/pics" element={<ProtectedLayout><Pics /></ProtectedLayout>} />
            <Route path="/piket" element={<ProtectedLayout><Piket /></ProtectedLayout>} />
            <Route path="/piket/logs" element={<ProtectedLayout><PiketLogs /></ProtectedLayout>} />
            <Route path="/calendar" element={<ProtectedLayout><CalendarPage /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
