import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Image, Plus, Trash2, X, Star, StarOff, Eye, EyeOff } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmAction } from "@/components/ConfirmAction";

const AdminGallery = () => {
  const queryClient = useQueryClient();
  const [newAlbum, setNewAlbum] = useState({ title: "", description: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const { data: albums, isLoading } = useQuery({
    queryKey: ["admin-gallery-albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_albums")
        .select("*, gallery_photos(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: pendingPhotos } = useQuery({
    queryKey: ["admin-pending-photos", selectedAlbum],
    queryFn: async () => {
      let query = supabase.from("gallery_photos").select("*").eq("is_approved", false).order("created_at", { ascending: false });
      if (selectedAlbum) query = query.eq("album_id", selectedAlbum);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createAlbumMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("gallery_albums").insert({
        title: newAlbum.title,
        description: newAlbum.description || null,
        is_published: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Album created");
      setCreateOpen(false);
      setNewAlbum({ title: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-albums"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleAlbumField = async (id: string, field: "is_published" | "is_highlighted", value: boolean) => {
    const updateData = field === "is_published" ? { is_published: !value } : { is_highlighted: !value };
    const { error } = await supabase.from("gallery_albums").update(updateData).eq("id", id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["admin-gallery-albums"] });
  };

  const deleteAlbum = async (id: string) => {
    const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Album deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-gallery-albums"] });
  };

  const approvePhoto = async (id: string) => {
    const { error } = await supabase.from("gallery_photos").update({ is_approved: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Photo approved");
    queryClient.invalidateQueries({ queryKey: ["admin-pending-photos"] });
  };

  const rejectPhoto = async (id: string) => {
    const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Photo rejected");
    queryClient.invalidateQueries({ queryKey: ["admin-pending-photos"] });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading text-foreground">Gallery Management</h1>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> New Album</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Album</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Album title" value={newAlbum.title} onChange={(e) => setNewAlbum((p) => ({ ...p, title: e.target.value }))} />
                <Textarea placeholder="Description (optional)" value={newAlbum.description} onChange={(e) => setNewAlbum((p) => ({ ...p, description: e.target.value }))} />
                <Button onClick={() => createAlbumMutation.mutate()} disabled={!newAlbum.title || createAlbumMutation.isPending} className="w-full">
                  Create Album
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending photos */}
        {(pendingPhotos?.length ?? 0) > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Pending Moderation ({pendingPhotos?.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {pendingPhotos?.map((photo) => (
                  <div key={photo.id} className="relative rounded-lg overflow-hidden border border-border">
                    <img src={photo.image_url} alt={photo.caption || "Pending"} className="aspect-square object-cover w-full" />
                    {photo.caption && <p className="text-xs p-2 truncate text-muted-foreground">{photo.caption}</p>}
                    <div className="flex">
                      <button onClick={() => approvePhoto(photo.id)} className="flex-1 py-2 bg-primary text-primary-foreground text-xs flex items-center justify-center gap-1 hover:bg-primary/90">
                        <Check size={14} /> Approve
                      </button>
                      <button onClick={() => rejectPhoto(photo.id)} className="flex-1 py-2 bg-destructive text-destructive-foreground text-xs flex items-center justify-center gap-1 hover:bg-destructive/90">
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Albums list */}
        <div className="grid gap-4">
          {albums?.map((album) => (
            <div key={album.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {album.cover_image_url ? (
                  <img src={album.cover_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Image size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{album.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {(album.gallery_photos as any)?.[0]?.count ?? 0} photos
                  {album.is_highlighted && " • Highlighted"}
                  {!album.is_published && " • Draft"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => toggleAlbumField(album.id, "is_highlighted", album.is_highlighted)} title="Toggle highlight">
                  {album.is_highlighted ? <Star size={16} className="text-primary fill-primary" /> : <StarOff size={16} />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => toggleAlbumField(album.id, "is_published", album.is_published)} title="Toggle publish">
                  {album.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
                <ConfirmAction onConfirm={() => deleteAlbum(album.id)} description="Delete this album and all its photos?">
                  <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                    <Trash2 size={16} />
                  </Button>
                </ConfirmAction>
              </div>
            </div>
          ))}
          {!isLoading && albums?.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No albums yet. Create one to get started!</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;
