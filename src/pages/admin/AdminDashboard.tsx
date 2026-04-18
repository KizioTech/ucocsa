import { useEffect, useState } from "react";
import { Calendar, Heart, Users, TrendingUp, Trash2, Info } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ConfirmAction";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ members: 0, events: 0, prayers: 0, pendingPrayers: 0 });
  const [cleaning, setCleaning] = useState(false);

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

  useEffect(() => {
    fetchStats();
  }, []);

  const handleManualCleanup = async () => {
    setCleaning(true);
    try {
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

      if (eventError || programError || annError) {
        throw new Error("One or more cleanup tasks failed");
      }

      toast.success("Cleanup completed successfully");
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Cleanup failed");
    } finally {
      setCleaning(false);
    }
  };

  const cards = [
    { label: "Total Members", value: stats.members, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Events", value: stats.events, icon: Calendar, color: "text-primary bg-primary/10" },
    { label: "Prayer Requests", value: stats.prayers, icon: Heart, color: "text-red-500 bg-red-100" },
    { label: "Pending Prayers", value: stats.pendingPrayers, icon: TrendingUp, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading text-foreground">Dashboard Overview</h1>
          
          <ConfirmAction 
            onConfirm={handleManualCleanup}
            title="Cleanup Old Data?"
            description="This will permanently delete past events, service programs, and expired announcements. This action cannot be undone."
          >
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 gap-2" disabled={cleaning}>
              <Trash2 size={16} /> {cleaning ? "Cleaning..." : "Cleanup Old Data"}
            </Button>
          </ConfirmAction>
        </div>

        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">Data Management Tip</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Auto-deletion is disabled to preserve historical records. Use the <strong>Cleanup</strong> button above to manually remove expired content when needed.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <card.icon size={20} />
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
