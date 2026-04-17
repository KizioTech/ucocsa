import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmAction } from "@/components/ConfirmAction";

const defaultForm = { title: "", content: "", expires_at: "" };

const AdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        expires_at: form.expires_at || null,
      };
      if (editingId) {
        const { error } = await supabase.from("announcements").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert({ ...payload, author_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success(editingId ? "Announcement updated" : "Announcement created");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase
        .from("announcements")
        .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Status updated");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement deleted");
    },
  });

  const resetForm = () => { setForm(defaultForm); setEditingId(null); setOpen(false); };

  const startEdit = (a: any) => {
    setForm({ title: a.title, content: a.content, expires_at: a.expires_at || "" });
    setEditingId(a.id);
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-foreground flex items-center gap-2">
          <Megaphone size={24} /> Announcements
        </h1>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button><Plus size={16} /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} required />
              </div>
              <div>
                <Label>Expires At (Optional)</Label>
                <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                <p className="text-[10px] text-muted-foreground mt-1">Announcement will be deleted after this date.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={upsert.isPending}>{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : announcements.length === 0 ? (
        <p className="text-muted-foreground">No announcements yet.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <Badge variant={a.is_published ? "default" : "secondary"}>
                    {a.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{a.content}</p>
                {a.expires_at && (
                  <p className="text-[10px] text-destructive font-medium mb-3">Expires: {new Date(a.expires_at).toLocaleDateString()}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => startEdit(a)}>
                    <Edit size={14} /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => togglePublish.mutate({ id: a.id, publish: !a.is_published })}>
                    {a.is_published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                  </Button>
                  <ConfirmAction onConfirm={() => deleteMut.mutate(a.id)} description="Permanently delete this announcement?">
                    <Button size="sm" variant="destructive">
                      <Trash2 size={14} /> Delete
                    </Button>
                  </ConfirmAction>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnnouncements;
