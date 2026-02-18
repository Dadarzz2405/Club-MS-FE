import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { notulensiApi } from "@/api/notulensi";
import type { Notulensi, Session } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/api/client";
import { Loader2, Save, Trash2, ArrowLeft, AlertCircle } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["link"],
    ["clean"],
  ],
};

export default function NotulensiEditor() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [notulensi, setNotulensi] = useState<Notulensi | null>(null);
  const [content, setContent] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    notulensiApi.get(parseInt(sessionId))
      .then((res) => {
        setSession(res.session);
        setNotulensi(res.notulensi);
        setContent(res.notulensi?.content || "");
        setCanEdit(res.can_edit);
      })
      .catch(() => toast({ title: "Error", description: "Failed to load", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleSave = useCallback(async () => {
    if (!sessionId || !content.trim()) return;
    setSaving(true);
    try {
      const res = await notulensiApi.save(parseInt(sessionId), content);
      setNotulensi(res.notulensi);
      setHasUnsaved(false);
      toast({ title: "Saved" });
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [sessionId, content]);

  const handleDelete = async () => {
    if (!notulensi || !confirm("Delete this note?")) return;
    try {
      await notulensiApi.delete(notulensi.id);
      toast({ title: "Deleted" });
      setNotulensi(null);
      setContent("");
      setHasUnsaved(false);
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    }
  };

  // Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/notulensi" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" />Back to Notes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{session?.name || "Meeting Notes"}</h1>
            <p className="page-description">{session?.date}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsaved && (
              <span className="text-xs text-warning flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />Unsaved changes
              </span>
            )}
            {canEdit && notulensi && (
              <Button variant="outline" size="sm" className="text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />Delete
              </Button>
            )}
            {canEdit && (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {canEdit ? (
            <ReactQuill
              theme="snow"
              value={content}
              onChange={(val) => {
                setContent(val);
                setHasUnsaved(true);
              }}
              modules={QUILL_MODULES}
              placeholder="Start writing meeting notes..."
            />
          ) : content ? (
            <div className="p-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">No notes for this session yet</div>
          )}
        </CardContent>
      </Card>

      {notulensi?.updated_at && (
        <p className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date(notulensi.updated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
