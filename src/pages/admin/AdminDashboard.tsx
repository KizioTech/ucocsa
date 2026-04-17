import { useEffect, useState } from "react";
import { Calendar, Heart, Users, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ members: 0, events: 0, prayers: 0, pendingPrayers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [members, events, prayers, pending] = await Promise.all([
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("prayer_requests").select("id", { count: "exact", head: true }),
        supabase.from("prayer_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        members: members.count ?? 0,
        events: events.count ?? 0,
        prayers: prayers.count ?? 0,
        pendingPrayers: pending.count ?? 0,
      });
    };
    const cleanupExpired = async () => {
      const today = new Date().toISOString().split("T")[0];
      
      // Cleanup events
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .lt("event_date", today);
      
      // Cleanup programs
      const { error: programError } = await supabase
        .from("service_programs")
        .delete()
        .lt("service_date", today);

      // Cleanup announcements that had a specific end date
      const { error: annError } = await supabase
        .from("announcements")
        .delete()
        .lt("expires_at", today);
    };

    fetchStats();
    cleanupExpired();
  }, []);

  const cards = [
    { label: "Total Members", value: stats.members, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Events", value: stats.events, icon: Calendar, color: "text-primary bg-primary/10" },
    { label: "Prayer Requests", value: stats.prayers, icon: Heart, color: "text-red-500 bg-red-100" },
    { label: "Pending Prayers", value: stats.pendingPrayers, icon: TrendingUp, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-heading text-foreground mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon size={18} />
                </div>
              </div>
              <p className="text-3xl font-heading text-foreground">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
