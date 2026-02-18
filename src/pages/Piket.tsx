import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { piketApi } from "@/api/piket";
import { membersApi } from "@/api/members";
import type { PiketDay, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/api/client";
import { Loader2, Edit, Trash2, TestTube, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Piket() {
  const { isCore, isAdmin } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<PiketDay[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit dialog
  const [editDay, setEditDay] = useState<PiketDay | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [schedRes, membRes] = await Promise.all([piketApi.getSchedule(), membersApi.list()]);
      setSchedule(schedRes.schedule);
      setMembers(membRes.members);
    } catch {
      toast({ title: "Error", description: "Failed to load piket schedule", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (day: PiketDay) => {
    setEditDay(day);
    setSelectedUserIds(new Set(day.assignments.map(a => a.user_id)));
  };

  const handleSave = async () => {
    if (!editDay) return;
    setSaveLoading(true);
    try {
      await piketApi.update(editDay.day_of_week, Array.from(selectedUserIds));
      toast({ title: "Schedule updated" });
      setEditDay(null);
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleClear = async (dow: number) => {
    if (!confirm("Clear all assignments for this day?")) return;
    try {
      await piketApi.clear(dow);
      toast({ title: "Cleared" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const handleTest = async (dow: number) => {
    try {
      const res = await piketApi.testReminder(dow);
      toast({ title: res.success ? "Test sent" : "Failed", description: res.message });
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Piket Schedule</h1>
          <p className="page-description">Weekly duty roster • Reminders sent at 06:00 WIB</p>
        </div>
        {isCore && (
          <Link to="/piket/logs">
            <Button variant="outline" size="sm"><Mail className="h-4 w-4 mr-1.5" />Email Logs</Button>
          </Link>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schedule.map((day) => (
          <Card key={day.day_of_week} className={`animate-fade-in ${day.is_today ? "border-primary ring-1 ring-primary/20" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">
                  {day.day_name}
                  {day.is_today && <Badge className="ml-2 text-xs">Today</Badge>}
                </CardTitle>
                {isCore && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(day)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {day.assignments.length > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleClear(day.day_of_week)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {day.assignments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No assignments</p>
              ) : (
                <div className="space-y-2">
                  {day.assignments.map((a) => (
                    <div key={a.user_id} className={`text-sm p-2 rounded ${a.is_current_user ? "bg-primary/10 font-medium" : "bg-muted/50"}`}>
                      <p>{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.class_name || a.email}</p>
                    </div>
                  ))}
                </div>
              )}
              {isAdmin && day.assignments.length > 0 && (
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs" onClick={() => handleTest(day.day_of_week)}>
                  <TestTube className="h-3 w-3 mr-1" />Test Reminder
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editDay} onOpenChange={(open) => !open && setEditDay(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {editDay?.day_name} Assignments</DialogTitle></DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer">
                <Checkbox
                  checked={selectedUserIds.has(m.id)}
                  onCheckedChange={(checked) => {
                    setSelectedUserIds((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(m.id);
                      else next.delete(m.id);
                      return next;
                    });
                  }}
                />
                <div>
                  <p className="text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.class_name || m.email}</p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDay(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
