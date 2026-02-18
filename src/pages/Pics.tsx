import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { picsApi } from "@/api/pics";
import type { Pic } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/api/client";
import { Plus, Trash2, Loader2, Users, Shield } from "lucide-react";

export default function Pics() {
  const { isCore } = useAuth();
  const { toast } = useToast();
  const [pics, setPics] = useState<Pic[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await picsApi.list();
      setPics(res.pics);
    } catch {
      toast({ title: "Error", description: "Failed to load PICs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreateLoading(true);
    try {
      await picsApi.create({ name: name.trim(), description: description.trim() || undefined });
      toast({ title: "PIC created" });
      setCreateOpen(false);
      setName(""); setDescription("");
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: number, picName: string) => {
    if (!confirm(`Delete PIC "${picName}"? All member assignments will be removed.`)) return;
    try {
      await picsApi.delete(id);
      toast({ title: "PIC deleted" });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">PICs / Divisions</h1>
          <p className="page-description">{pics.length} divisions</p>
        </div>
        {isCore && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New PIC</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create PIC / Division</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acara, Konsumsi" /></div>
                <div><Label>Description (optional)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Responsibilities..." /></div>
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pics.map((p) => (
          <Card key={p.id} className="animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />{p.member_count} members
                    </p>
                  </div>
                </div>
                {isCore && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7" onClick={() => handleDelete(p.id, p.name)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {p.description && <p className="text-xs text-muted-foreground mt-2">{p.description}</p>}
              {p.members.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.members.map((m) => (
                    <Badge key={m.id} variant="secondary" className="text-xs">{m.name}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {pics.length === 0 && <p className="text-muted-foreground text-sm col-span-full text-center py-8">No PICs created yet</p>}
      </div>
    </div>
  );
}
