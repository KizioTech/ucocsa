import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Lock } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PrayerRow {
  id: string;
  name: string | null;
  category: string;
  request: string;
  is_anonymous: boolean;
  is_private: boolean;
  status: string;
  prayed_count: number;
  created_at: string;
}

const AdminPrayers = () => {
  const [prayers, setPrayers] = useState<PrayerRow[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const fetchPrayers = async () => {
    let query = supabase.from("prayer_requests").select("*").order("created_at", { ascending: false });
    if (filter === "pending") query = query.eq("status", "pending");
    if (filter === "approved") query = query.eq("status", "approved");
    const { data } = await query;
    if (data) setPrayers(data);
  };

  useEffect(() => {
    fetchPrayers();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("prayer_requests").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Request marked as ${status}`);
      fetchPrayers();
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-heading text-foreground mb-6">Prayer Requests</h1>

        <div className="flex gap-2 mb-6">
          {["all", "pending", "approved", "archived"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {prayers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No prayer requests found.</p>
          )}
          {prayers.map((prayer) => (
            <div key={prayer.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[prayer.status] || ""}`}>{prayer.status}</span>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{prayer.category}</span>
                    {prayer.is_private && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Lock size={10} /> Private</span>}
                    {prayer.is_anonymous && <span className="flex items-center gap-1 text-xs text-muted-foreground"><EyeOff size={10} /> Anonymous</span>}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{prayer.request}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>From: {prayer.is_anonymous ? "Anonymous" : prayer.name || "Not provided"}</span>
                    <span>{new Date(prayer.created_at).toLocaleDateString()}</span>
                    <span>🙏 {prayer.prayed_count}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {prayer.status === "pending" && (
                    <button onClick={() => updateStatus(prayer.id, "approved")}
                      className="p-2 rounded-lg hover:bg-green-100 text-green-600" title="Approve">
                      <Check size={16} />
                    </button>
                  )}
                  {prayer.status !== "archived" && (
                    <button onClick={() => updateStatus(prayer.id, "archived")}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Archive">
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPrayers;
