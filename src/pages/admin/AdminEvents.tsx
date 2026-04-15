import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/ConfirmAction";

const eventTypes = ["Fellowship", "Bible Study", "Outreach", "Special Service", "Social", "Other"];

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  event_type: string;
  is_recurring: boolean;
  organizer_contact: string | null;
}

const emptyForm = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  location: "",
  event_type: "Fellowship",
  is_recurring: false,
  organizer_contact: "",
};

const AdminEvents = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    if (data) setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (evt: EventRow) => {
    setForm({
      title: evt.title,
      description: evt.description || "",
      event_date: evt.event_date,
      event_time: evt.event_time || "",
      location: evt.location || "",
      event_type: evt.event_type,
      is_recurring: evt.is_recurring,
      organizer_contact: evt.organizer_contact || "",
    });
    setEditingId(evt.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        event_date: form.event_date,
        event_time: form.event_time || null,
        location: form.location || null,
        event_type: form.event_type,
        is_recurring: form.is_recurring,
        organizer_contact: form.organizer_contact || null,
      };

      if (editingId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Event updated!");
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        toast.success("Event created!");
      }
      setShowForm(false);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Event deleted.");
      fetchEvents();
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading text-foreground">Events</h1>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-gold-dark transition-colors">
            <Plus size={16} /> New Event
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-foreground">{editingId ? "Edit Event" : "Create Event"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date *</label>
                <input required type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Time</label>
                <input type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Event Type</label>
                <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Organizer Contact</label>
                <input value={form.organizer_contact} onChange={(e) => setForm({ ...form, organizer_contact: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} className="rounded" />
                <label className="text-sm text-foreground">Recurring event</label>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={loading}
                  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-gold-dark transition-colors disabled:opacity-50">
                  {loading ? "Saving..." : editingId ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Location</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No events yet. Create your first event!</td></tr>
                )}
                {events.map((evt) => (
                  <tr key={evt.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{evt.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{evt.event_date}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{evt.event_type}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{evt.location || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(evt)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground mr-1"><Pencil size={14} /></button>
                      <ConfirmAction onConfirm={() => handleDelete(evt.id)} description="Delete this event?">
                        <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                      </ConfirmAction>
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

export default AdminEvents;
