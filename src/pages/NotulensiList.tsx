import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notulensiApi } from "@/api/notulensi";
import type { NotulensiListItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Edit } from "lucide-react";

export default function NotulensiList() {
  const [items, setItems] = useState<NotulensiListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notulensiApi.list()
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Meeting Notes (Notulensi)</h1>
        <p className="page-description">View and manage meeting minutes for each session</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Link key={item.session_id} to={`/notulensi/${item.session_id}`}>
            <Card className="hover:border-primary/30 transition-colors cursor-pointer animate-fade-in">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{item.session_name}</p>
                    {item.has_notulensi ? (
                      <Badge variant="default" className="text-xs">Has Notes</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">No Notes</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.session_date}</p>
                  {item.notulensi?.updated_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Updated: {new Date(item.notulensi.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
        {items.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No sessions found</p>}
      </div>
    </div>
  );
}
