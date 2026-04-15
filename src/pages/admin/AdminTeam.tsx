import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Users, Upload, Image as ImageIcon } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  whatsapp_number: string | null;
  order_index: number;
}

const emptyForm = {
  name: "",
  role: "",
  bio: "",
  image_url: "",
  whatsapp_number: "",
  order_index: 0,
};

const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = async () => {
    const { data } = await (supabase as any)
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true });
    if (data) setMembers(data as TeamMember[]);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, order_index: members.length + 1 });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (member: TeamMember) => {
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      image_url: member.image_url || "",
      whatsapp_number: member.whatsapp_number || "",
      order_index: member.order_index,
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("team-members")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("team-members")
        .getPublicUrl(filePath);

      setForm({ ...form, image_url: publicUrl });
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        role: form.role,
        bio: form.bio || null,
        image_url: form.image_url || null,
        whatsapp_number: form.whatsapp_number || null,
        order_index: form.order_index,
      };

      if (editingId) {
        const { error } = await (supabase as any).from("team_members").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Team member updated!");
      } else {
        const { error } = await (supabase as any).from("team_members").insert(payload);
        if (error) throw error;
        toast.success("Team member added!");
      }
      setShowForm(false);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    const { error } = await (supabase as any).from("team_members").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Team member removed.");
      fetchMembers();
    }
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
            <h1 className="text-2xl font-heading text-foreground">Executive Team</h1>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-gold-dark transition-colors">
            <Plus size={16} /> Add Member
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-foreground">{editingId ? "Edit Member" : "Add Member"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Role *</label>
                  <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Chairperson"
                    className="w-full px-4 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">WhatsApp Number</label>
                    <input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                      placeholder="e.g. 265999000000"
                      className="w-full px-4 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Display Order</label>
                    <input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) })}
                      className="w-full px-4 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-foreground mb-2">Member Photo</label>
                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  {form.image_url ? (
                    <div className="relative w-32 h-32 group">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover rounded-full border-2 border-primary" />
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : <><Upload size={16} /> Choose Photo</>}
                    </button>
                    <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest">JPG, PNG or WEBP. Max 2MB.</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm leading-relaxed" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading || uploading}
                  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-gold-dark transition-colors disabled:opacity-50 min-w-[120px]">
                  {loading ? "Saving..." : editingId ? "Update" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Order</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Member</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground hidden md:table-cell">Bio</th>
                  <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No team members found.</td></tr>
                )}
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground font-mono">{member.order_index}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border border-border">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-primary">{member.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-medium text-foreground">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                      {member.bio || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(member)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(member.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTeam;

