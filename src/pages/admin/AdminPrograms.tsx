import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Edit, Trash2, Church, BookOpen } from "lucide-react";
import { toast } from "sonner";

type ServiceProgram = {
  id: string;
  service_type: string;
  service_date: string;
  title: string | null;
  theme: string | null;
  leading_verses: string | null;
  facilitator: string | null;
  first_prayer: string | null;
  convener: string | null;
  teaching: string | null;
  preaching: string | null;
  alter_call: string | null;
  holy_communion: string | null;
  bearers: string[] | null;
  last_prayer: string | null;
  announcements: string | null;
  location: string | null;
  is_modified: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  service_type: "sunday" as string,
  service_date: "",
  title: "",
  theme: "",
  leading_verses: "",
  facilitator: "",
  first_prayer: "",
  convener: "",
  teaching: "",
  preaching: "",
  alter_call: "",
  holy_communion: "",
  bearers: ["", "", "", ""],
  last_prayer: "",
  announcements: "",
  location: "Lecture Theater 2",
  is_published: false,
};

const AdminPrograms = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceProgram | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<string>("all");

  const { data: programs, isLoading } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_programs")
        .select("*")
        .order("service_date", { ascending: false });
      if (error) throw error;
      return data as ServiceProgram[];
    },
  });

  // Upcoming unmodified programs for alerts
  const unmodifiedUpcoming = programs?.filter(
    (p) => !p.is_modified && new Date(p.service_date) >= new Date()
  ) ?? [];

  // Recently-used locations (most-recent first, deduped, capped at 6)
  const recentLocations = (() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const p of programs ?? []) {
      const loc = (p.location || "").trim();
      if (loc && !seen.has(loc)) {
        seen.add(loc);
        list.push(loc);
        if (list.length >= 6) break;
      }
    }
    // Always include the default if not present
    if (!seen.has("Lecture Theater 2")) list.push("Lecture Theater 2");
    return list;
  })();

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form & { id?: string }) => {
      const payload = {
        service_type: data.service_type,
        service_date: data.service_date,
        title: data.title || null,
        theme: data.theme || null,
        leading_verses: data.leading_verses || null,
        facilitator: data.facilitator || null,
        first_prayer: data.first_prayer || null,
        convener: data.convener || null,
        teaching: data.teaching || null,
        preaching: data.preaching || null,
        alter_call: data.alter_call || null,
        holy_communion: data.holy_communion || null,
        bearers: data.bearers.filter(Boolean),
        last_prayer: data.last_prayer || null,
        announcements: data.announcements || null,
        location: data.location || null,
        is_published: data.is_published,
        is_modified: true,
      };

      if (data.id) {
        const { error } = await supabase.from("service_programs").update(payload).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("service_programs").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      toast.success(editing ? "Program updated" : "Program created");
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      toast.success("Program deleted");
    },
  });

  const openEdit = (p: ServiceProgram) => {
    setEditing(p);
    setForm({
      service_type: p.service_type,
      service_date: p.service_date,
      title: p.title || "",
      theme: p.theme || "",
      leading_verses: p.leading_verses || "",
      facilitator: p.facilitator || "",
      first_prayer: p.first_prayer || "",
      convener: p.convener || "",
      teaching: p.teaching || "",
      preaching: p.preaching || "",
      alter_call: p.alter_call || "",
      holy_communion: p.holy_communion || "",
      bearers: [...(p.bearers || []), "", "", "", ""].slice(0, 4),
      last_prayer: p.last_prayer || "",
      announcements: p.announcements || "",
      location: p.location || (p.service_type === "sunday" ? "Lecture Theater 2" : ""),
      is_published: p.is_published,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const filtered = programs?.filter((p) => filter === "all" || p.service_type === filter) ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading text-foreground">Service Programs</h1>
          <Button onClick={openNew}><Plus size={16} className="mr-1" /> New Program</Button>
        </div>

        {/* Alerts for unmodified programs */}
        {unmodifiedUpcoming.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-destructive mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-destructive">Programs need attention</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {unmodifiedUpcoming.length} upcoming program(s) have not been updated yet:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {unmodifiedUpcoming.map((p) => (
                      <li key={p.id} className="text-sm flex items-center gap-2">
                        <span className="font-medium">{p.service_type === "sunday" ? "Sunday" : "MidWeek"}</span>
                        — {new Date(p.service_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => openEdit(p)}>Edit</Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {["all", "sunday", "midweek"].map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "sunday" ? "Sunday" : "MidWeek"}
            </Button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">No programs found.</p>
        ) : (
          <div className="grid gap-4">
            {filtered.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {p.service_type === "sunday" ? <Church size={18} className="text-primary" /> : <BookOpen size={18} className="text-primary" />}
                      <CardTitle className="text-base">
                        {p.title || (p.service_type === "sunday" ? "Sunday Service" : "MidWeek Service")}
                      </CardTitle>
                      <Badge variant={p.is_published ? "default" : "secondary"}>
                        {p.is_published ? "Published" : "Draft"}
                      </Badge>
                      {!p.is_modified && new Date(p.service_date) >= new Date() && (
                        <Badge variant="destructive" className="text-xs">Not Updated</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {new Date(p.service_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    {p.facilitator && <> · {p.facilitator}</>}
                    {p.theme && <> · {p.theme}</>}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "New"} Service Program</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(editing ? { ...form, id: editing.id } : form);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Service Type</Label>
                <Select value={form.service_type} onValueChange={(v) => setForm({ ...form, service_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday Service</SelectItem>
                    <SelectItem value="midweek">MidWeek Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.service_date} onChange={(e) => setForm({ ...form, service_date: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Praise & Worship Night" />
              </div>
              <div>
                <Label>Theme</Label>
                <Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="Service theme" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Leading Verse(s)</Label>
                <Input value={form.leading_verses} onChange={(e) => setForm({ ...form, leading_verses: e.target.value })} placeholder="e.g. Romans 8:28" />
              </div>
              <div>
                <Label>Facilitator</Label>
                <Input value={form.facilitator} onChange={(e) => setForm({ ...form, facilitator: e.target.value })} placeholder="Name" />
              </div>
            </div>

            <div>
              <Label>Location / Room</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Lecture Theater 2"
              />
              {recentLocations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-muted-foreground self-center">Recent:</span>
                  {recentLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setForm({ ...form, location: loc })}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        form.location === loc
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Default for Sunday Gatherings: Lecture Theater 2.</p>
            </div>

            {form.service_type === "sunday" && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-sm text-foreground mb-3">Sunday Order of Service</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>First Prayer</Label><Input value={form.first_prayer} onChange={(e) => setForm({ ...form, first_prayer: e.target.value })} /></div>
                    <div><Label>Convener</Label><Input value={form.convener} onChange={(e) => setForm({ ...form, convener: e.target.value })} /></div>
                    <div><Label>Teaching</Label><Input value={form.teaching} onChange={(e) => setForm({ ...form, teaching: e.target.value })} /></div>
                    <div><Label>Preaching</Label><Input value={form.preaching} onChange={(e) => setForm({ ...form, preaching: e.target.value })} /></div>
                    <div><Label>Alter Call</Label><Input value={form.alter_call} onChange={(e) => setForm({ ...form, alter_call: e.target.value })} /></div>
                    <div><Label>Holy Communion</Label><Input value={form.holy_communion} onChange={(e) => setForm({ ...form, holy_communion: e.target.value })} /></div>
                  </div>
                  <div className="mt-4">
                    <Label>Bearers (up to 4)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {form.bearers.map((b, i) => (
                        <Input
                          key={i}
                          value={b}
                          onChange={(e) => {
                            const updated = [...form.bearers];
                            updated[i] = e.target.value;
                            setForm({ ...form, bearers: updated });
                          }}
                          placeholder={`Bearer ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div><Label>Last Prayer</Label><Input value={form.last_prayer} onChange={(e) => setForm({ ...form, last_prayer: e.target.value })} /></div>
                    <div><Label>Announcements</Label><Input value={form.announcements} onChange={(e) => setForm({ ...form, announcements: e.target.value })} /></div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <Label>Publish (summary visible to public, details to members)</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Program"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPrograms;
