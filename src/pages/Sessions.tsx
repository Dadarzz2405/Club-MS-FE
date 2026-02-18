import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sessionsApi } from "@/api/sessions";
import { picsApi } from "@/api/pics";
import type { Session, Pic } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/api/client";
import { Plus, Trash2, Lock, Calendar, Loader2, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sessions() {
  const { isCore } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pics, setPics] = useState<Pic[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all_types");

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [sessionType, setSessionType] = useState("all");
  const [description, setDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // PIC assignment dialog
  const [picDialogSession, setPicDialogSession] = useState<Session | null>(null);
  const [selectedPicIds, setSelectedPicIds] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      const [sessRes, picsRes] = await Promise.all([sessionsApi.list(), picsApi.list()]);
      setSessions(sessRes.sessions);
      setPics(picsRes.pics);
    } catch {
      toast({ title: "Error", description: "Failed to load sessions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = sessions.filter((s) => typeFilter === "all_types" || s.session_type === typeFilter);

  const handleCreate = async () => {
    if (!name.trim() || !date) return;
    setCreateLoading(true);
    try {
      await sessionsApi.create({ name: name.trim(), date, session_type: sessionType, description: description.trim() || undefined });
      toast({ title: "Session created" });
      setCreateOpen(false);
      setName(""); setDate(""); setSessionType("all"); setDescription("");
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this session and all its data?")) return;
    try {
      await sessionsApi.delete(id);
      toast({ title: "Session deleted" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const handleLock = async (id: number) => {
    if (!confirm("Lock this session? Attendance can no longer be modified.")) return;
    try {
      await sessionsApi.lock(id);
      toast({ title: "Session locked" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const openPicDialog = (s: Session) => {
    setPicDialogSession(s);
    setSelectedPicIds(new Set(s.assigned_pics.map(p => p.id)));
  };

  const handleSavePics = async () => {
    if (!picDialogSession) return;
    try {
      await sessionsApi.assignPics(picDialogSession.id, Array.from(selectedPicIds));
      toast({ title: "PICs updated" });
      setPicDialogSession(null);
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case "all": return "All Members";
      case "core": return "Core Only";
      case "event": return "Event";
      default: return t;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Sessions</h1>
          <p className="page-description">{sessions.length} total sessions</p>
        </div>
        {isCore && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New Session</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Session</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Session name" /></div>
                <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <div><Label>Type</Label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="core">Core Only</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description (optional)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleCreate} disabled={createLoading}>
                  {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all_types">All Types</SelectItem>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="core">Core Only</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((s) => (
          <Card key={s.id} className="animate-fade-in">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{s.name}</h3>
                    <Badge variant="outline" className="text-xs">{typeLabel(s.session_type)}</Badge>
                    {s.is_locked && <Badge variant="secondary" className="text-xs"><Lock className="h-3 w-3 mr-1" />Locked</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.date}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.attendance_count} attendees</span>
                    {s.assigned_pics.length > 0 && (
                      <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{s.assigned_pics.map(p => p.name).join(", ")}</span>
                    )}
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/attendance/session/${s.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">Attendance</Button>
                  </Link>
                  {isCore && (
                    <>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => openPicDialog(s)}>PICs</Button>
                      {!s.is_locked && <Button variant="outline" size="sm" className="text-xs" onClick={() => handleLock(s.id)}><Lock className="h-3 w-3" /></Button>}
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No sessions found</p>}
      </div>

      {/* PIC Assignment Dialog */}
      <Dialog open={!!picDialogSession} onOpenChange={(open) => !open && setPicDialogSession(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign PICs to {picDialogSession?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pics.map((p) => (
              <label key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer">
                <Checkbox
                  checked={selectedPicIds.has(p.id)}
                  onCheckedChange={(checked) => {
                    setSelectedPicIds((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(p.id);
                      else next.delete(p.id);
                      return next;
                    });
                  }}
                />
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                </div>
              </label>
            ))}
            {pics.length === 0 && <p className="text-sm text-muted-foreground">No PICs created yet</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPicDialogSession(null)}>Cancel</Button>
            <Button onClick={handleSavePics}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
