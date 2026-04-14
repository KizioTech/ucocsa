import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Upload, 
  Image as ImageIcon, X, ArrowLeft, Send, 
  Calendar, User, MoreVertical 
} from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MarkdownEditor from "@/components/MarkdownEditor";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author_name: string;
  author_id: string | null;
  category: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

const categories = ["Devotional", "Student Life", "Testimony", "Outreach", "News", "Bible Study"];

const defaultForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author_name: "",
  author_id: "" as string | null,
  category: "Devotional",
  cover_image_url: "" as string | null,
};

const AdminBlog = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  // Fetch profiles for author selection
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .order("full_name");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const payload = { 
        ...form, 
        slug,
        author_id: form.author_id || null,
        cover_image_url: form.cover_image_url || null
      };

      if (editingId) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success(editingId ? "Post updated" : "Post created");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `post-${Date.now()}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      setForm({ ...form, cover_image_url: publicUrl });
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Status updated");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Post deleted");
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setView("list");
  };

  const startEdit = (p: BlogPost) => {
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      content: p.content,
      author_name: p.author_name,
      author_id: p.author_id,
      category: p.category,
      cover_image_url: p.cover_image_url,
    });
    setEditingId(p.id);
    setView("editor");
  };

  if (view === "editor") {
    return (
      <AdminLayout>
        <div className="animate-fade-in pb-20">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setView("list")} className="rounded-full">
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-heading text-foreground">{editingId ? "Edit Post" : "Compose New Post"}</h1>
                <p className="text-xs text-muted-foreground">{editingId ? `ID: ${editingId}` : "Drafting your next piece"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
              <Button onClick={() => upsert.mutate()} disabled={upsert.isPending || uploading} className="min-w-[120px]">
                {upsert.isPending ? "Saving..." : <><Send size={16} className="mr-2" /> {editingId ? "Update Post" : "Create Post"}</>}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Editor Side */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">Title</Label>
                    <Input 
                      value={form.title} 
                      onChange={(e) => setForm({ ...form, title: e.target.value })} 
                      placeholder="Enter a compelling title..."
                      className="text-lg font-heading h-12"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Excerpt (Summary)</Label>
                    <Textarea 
                      value={form.excerpt} 
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })} 
                      rows={3}
                      placeholder="Briefly describe what this post is about..."
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <MarkdownEditor 
                    value={form.content} 
                    onChange={(v) => setForm({ ...form, content: v })} 
                    placeholder="Start writing your masterpiece..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">Author Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Display Name (Manual)</Label>
                    <Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Link</Label>
                    <Select value={form.author_id || "none"} onValueChange={(v) => setForm({ ...form, author_id: v === "none" ? null : v })}>
                      <SelectTrigger><SelectValue placeholder="Associate with profile..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Independent / Anonymous</SelectItem>
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.full_name || "Anonymous User"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">Cover Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
                    {form.cover_image_url ? (
                      <div className="relative w-full aspect-video group">
                        <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                        <button 
                          type="button"
                          onClick={() => setForm({ ...form, cover_image_url: "" })}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center text-muted-foreground border border-border rounded-lg bg-background/50">
                        <ImageIcon size={32} className="opacity-20" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full gap-2"
                    >
                      {uploading ? "Uploading..." : <><Upload size={14} /> Change Image</>}
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading text-foreground">Blog Management</h1>
          <p className="text-sm text-muted-foreground">Draft and publish stories for the community</p>
        </div>
        <Button onClick={() => setView("editor")} className="gap-2">
          <Plus size={16} /> Write New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((v) => <div key={v} className="h-64 rounded-xl bg-muted animate-pulse border border-border" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-muted-foreground">No blog posts found. Time to write your first story!</p>
          <Button variant="outline" onClick={() => setView("editor")} className="mt-4">Start Writing</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-all border-border/60">
              <div className="relative h-40 overflow-hidden bg-muted">
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} className="text-primary/10" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant={p.is_published ? "default" : "secondary"} className="shadow-lg backdrop-blur-md">
                    {p.is_published ? "Live" : "Draft"}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">{p.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <User size={10} /> {p.author_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground opacity-50">•</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} /> {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 mt-auto">
                <div className="flex items-center gap-1 mb-4 flex-wrap">
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter px-1.5 h-5 bg-primary/5 border-primary/20 text-primary">
                    {p.category}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)} className="flex-1 h-9 text-xs gap-1.5">
                    <Edit size={14} /> Open Editor
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePublish.mutate({ id: p.id, publish: !p.is_published })}>
                        {p.is_published ? <><EyeOff size={14} className="mr-2" /> Unpublish</> : <><Eye size={14} className="mr-2" /> Publish Now</>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { if (confirm("Permanently delete this post?")) deleteMut.mutate(p.id); }} className="text-destructive focus:text-destructive">
                        <Trash2 size={14} className="mr-2" /> Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};


export default AdminBlog;


