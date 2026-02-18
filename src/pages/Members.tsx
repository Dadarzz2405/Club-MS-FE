import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { membersApi } from "@/api/members";
import { picsApi } from "@/api/pics";
import type { User, Pic } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/api/client";
import {
  Plus, Trash2, Upload, Search, Loader2, UserPlus, Shield, Check,
} from "lucide-react";
import { profileApi } from "@/api/profile";

export default function Members() {
  const { isCore, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<User[]>([]);
  const [pics, setPics] = useState<Pic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Add member form
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newRole, setNewRole] = useState("member");
  const [addLoading, setAddLoading] = useState(false);

  // Batch add
  const [batchOpen, setBatchOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [membersRes, picsRes] = await Promise.all([membersApi.list(), picsApi.list()]);
      setMembers(membersRes.members);
      setPics(picsRes.pics);
    } catch {
      toast({ title: "Error", description: "Failed to load members", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredMembers = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAddMember = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setAddLoading(true);
    try {
      await membersApi.add({ name: newName.trim(), email: newEmail.trim(), class_name: newClass.trim() || undefined, role: newRole });
      toast({ title: "Success", description: "Member added" });
      setAddOpen(false);
      setNewName(""); setNewEmail(""); setNewClass(""); setNewRole("member");
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed to add member", variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  const handleBatchAdd = async () => {
    if (!bulkText.trim()) return;
    setBatchLoading(true);
    try {
      const res = await membersApi.batchAdd(bulkText.trim());
      toast({ title: "Done", description: `Added ${res.added} members. ${res.errors.length} errors.` });
      setBatchOpen(false);
      setBulkText("");
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Delete this member?")) return;
    try {
      await membersApi.deleteMember(userId);
      toast({ title: "Deleted" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0 || !confirm(`Delete ${selectedIds.size} members?`)) return;
    try {
      const res = await membersApi.batchDelete(Array.from(selectedIds));
      toast({ title: "Done", description: `Deleted ${res.deleted} members` });
      setSelectedIds(new Set());
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await membersApi.changeRole(userId, role);
      toast({ title: "Role updated" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const handlePicAssign = async (userId: number, picId: string) => {
    try {
      await membersApi.assignPic(userId, picId === "none" ? null : parseInt(picId));
      toast({ title: "PIC updated" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const handleToggleAttendance = async (userId: number) => {
    try {
      await membersApi.toggleAttendancePermission(userId);
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "default";
      case "ketua": return "secondary";
      case "pembina": return "outline";
      default: return "outline";
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-description">{members.length} total members</p>
        </div>
        {isCore && (
          <div className="flex gap-2">
            <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1.5" />Batch Add</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Batch Add Members</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">One per line: name, email, class, role</p>
                <Textarea rows={6} placeholder="John Doe, john@example.com, XII-A, member" value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleBatchAdd} disabled={batchLoading}>
                    {batchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Members
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Member</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" /></div>
                  <div><Label>Email</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" /></div>
                  <div><Label>Class</Label><Input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="e.g. XII-A" /></div>
                  <div><Label>Role</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="pembina">Pembina</SelectItem>
                        <SelectItem value="ketua">Ketua</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleAddMember} disabled={addLoading}>
                    {addLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="ketua">Ketua</SelectItem>
            <SelectItem value="pembina">Pembina</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        {isCore && selectedIds.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
            <Trash2 className="h-4 w-4 mr-1.5" />Delete ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {isCore && <th className="w-10"><Checkbox checked={selectedIds.size === filteredMembers.length && filteredMembers.length > 0} onCheckedChange={(checked) => {
                  if (checked) setSelectedIds(new Set(filteredMembers.filter(m => m.id !== currentUser?.id).map(m => m.id)));
                  else setSelectedIds(new Set());
                }} /></th>}
                <th>Member</th>
                <th>Class</th>
                <th>Role</th>
                <th>PIC</th>
                <th>Attendance</th>
                {isCore && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id}>
                  {isCore && <td><Checkbox checked={selectedIds.has(m.id)} onCheckedChange={() => toggleSelect(m.id)} disabled={m.id === currentUser?.id} /></td>}
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={profileApi.getPictureUrl(m.id)}
                        alt={m.name}
                        className="h-8 w-8 rounded-full object-cover bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=1a7a5c&color=fff&size=32`;
                        }}
                      />
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{m.class_name || "—"}</td>
                  <td>
                    {isCore && m.id !== currentUser?.id ? (
                      <Select value={m.role} onValueChange={(v) => handleRoleChange(m.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-[100px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="pembina">Pembina</SelectItem>
                          <SelectItem value="ketua">Ketua</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={roleBadgeVariant(m.role)} className="capitalize text-xs">{m.role}</Badge>
                    )}
                  </td>
                  <td>
                    {isCore ? (
                      <Select value={m.pic_id?.toString() || "none"} onValueChange={(v) => handlePicAssign(m.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {pics.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{m.pic_name || "—"}</span>
                    )}
                  </td>
                  <td>
                    {isCore ? (
                      <Button variant={m.can_mark_attendance ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => handleToggleAttendance(m.id)}>
                        {m.can_mark_attendance ? <><Check className="h-3 w-3 mr-1" />Can Mark</> : "Cannot Mark"}
                      </Button>
                    ) : (
                      <span className="text-sm">{m.can_mark_attendance ? "✓ Can Mark" : "—"}</span>
                    )}
                  </td>
                  {isCore && (
                    <td>
                      {m.id !== currentUser?.id && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No members found</div>
          )}
        </div>
      </Card>
    </div>
  );
}
