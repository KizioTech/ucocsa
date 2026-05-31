import { useEffect, useState } from "react";
import { Calendar, Heart, Users, TrendingUp, Trash2, Info, ArrowUpRight, ArrowDownRight, Activity, FileText, School, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ConfirmAction";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  StatSparkline, 
  MonthlyActivityChart, 
  DistributionDonutChart 
} from "@/components/admin/DashboardCharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
    members: 0, 
    events: 0, 
    prayers: 0, 
    pendingPrayers: 0,
    pageViews: 0,
    articleViews: 0,
    memberTrend: [] as { value: number }[],
    activityData: [] as { month: string, members: number, prayers: number }[],
    prayerDistribution: [] as { name: string, value: number, fill: string }[]
  });
  const [cleaning, setCleaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  const [statusForm, setStatusForm] = useState({
    is_open: true,
    opens_at: "",
    closure_msg: "",
    timezone: "Africa/Blantyre"
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const sixMonthsAgo = subMonths(startOfMonth(today), 5);

      const [
        membersRes, 
        eventsRes, 
        prayersRes, 
        pendingRes,
        historicalMembers,
        historicalPrayers,
        pageViewsRes,
        settingsRes
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("prayer_requests").select("id", { count: "exact", head: true }),
        supabase.from("prayer_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("created_at").gte("created_at", sixMonthsAgo.toISOString()),
        supabase.from("prayer_requests").select("created_at, status").gte("created_at", sixMonthsAgo.toISOString()),
        supabase.from("page_views").select("path"),
        supabase.from("site_settings").select("*").maybeSingle()
      ]);

      if (settingsRes.data) {
        setStatusForm({
          is_open: settingsRes.data.is_open ?? true,
          opens_at: settingsRes.data.opens_at || "",
          closure_msg: settingsRes.data.closure_msg || "",
          timezone: settingsRes.data.timezone || "Africa/Blantyre"
        });
      }

      // Process Activity Chart Data
      const activityData = [];
      const memberTrend = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthLabel = format(monthDate, "MMM");

        const mCount = historicalMembers.data?.filter(m => 
          isWithinInterval(new Date(m.created_at), { start: monthStart, end: monthEnd })
        ).length || 0;

        const pCount = historicalPrayers.data?.filter(p => 
          isWithinInterval(new Date(p.created_at), { start: monthStart, end: monthEnd })
        ).length || 0;

        activityData.push({ month: monthLabel, members: mCount, prayers: pCount });
        memberTrend.push({ value: mCount });
      }

      // Process Distribution Data
      const statuses = ["pending", "answered", "praying"];
      const colors = ["hsl(var(--warning))", "hsl(var(--primary))", "hsl(var(--gold, 45 93% 47%))"];
      
      const prayerDistribution = statuses.map((status, idx) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: historicalPrayers.data?.filter(p => p.status === status).length || 0,
        fill: colors[idx]
      }));

      let totalPageViews = 0;
      let totalArticleViews = 0;
      if (pageViewsRes.data) {
        totalPageViews = pageViewsRes.data.length;
        totalArticleViews = pageViewsRes.data.filter(pv => pv.path.startsWith("/blog")).length;
      }

      setStats({
        members: membersRes.count ?? 0,
        events: eventsRes.count ?? 0,
        prayers: prayersRes.count ?? 0,
        pendingPrayers: pendingRes.count ?? 0,
        pageViews: totalPageViews,
        articleViews: totalArticleViews,
        memberTrend,
        activityData,
        prayerDistribution
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleManualCleanup = async () => {
    setCleaning(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error: eventError } = await supabase.from("events").delete().lt("event_date", today);
      const { error: programError } = await supabase.from("service_programs").delete().lt("service_date", today);
      const { error: annError } = await supabase.from("announcements").delete().lt("expires_at", today);

      if (eventError || programError || annError) throw new Error("Cleanup failed");
      toast.success("Cleanup completed");
      fetchStats();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCleaning(false);
    }
  };

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          id: "00000000-0000-0000-0000-000000000000",
          is_open: statusForm.is_open,
          opens_at: statusForm.opens_at || null,
          closure_msg: statusForm.closure_msg || null,
          timezone: statusForm.timezone
        });
      if (error) throw error;
      toast.success("School status updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update school status");
    } finally {
      setSavingStatus(false);
    }
  };

  const cards = [
    { 
      label: "Total Members", 
      value: stats.members, 
      icon: Users, 
      color: "text-blue-600 bg-blue-100",
      trend: "+12%",
      isPositive: true,
      sparkline: stats.memberTrend
    },
    { 
      label: "Web Visits", 
      value: stats.pageViews, 
      icon: Activity, 
      color: "text-indigo-600 bg-indigo-100",
      trend: "+15%",
      isPositive: true,
      sparkline: [{ value: 10 }, { value: 15 }, { value: 20 }, { value: 18 }, { value: Math.max(stats.pageViews, 25) }]
    },
    { 
      label: "Article Views", 
      value: stats.articleViews, 
      icon: FileText, 
      color: "text-teal-600 bg-teal-100",
      trend: "Active",
      isPositive: true,
      sparkline: [{ value: 5 }, { value: 8 }, { value: 12 }, { value: 10 }, { value: Math.max(stats.articleViews, 15) }]
    },
    { 
      label: "Events", 
      value: stats.events, 
      icon: Calendar, 
      color: "text-primary bg-primary/10",
      trend: "Stable",
      isPositive: true,
      sparkline: [{ value: 2 }, { value: 3 }, { value: 2 }, { value: 4 }, { value: 3 }, { value: 5 }]
    },
    { 
      label: "Prayer Requests", 
      value: stats.prayers, 
      icon: Heart, 
      color: "text-red-500 bg-red-100",
      trend: "+5%",
      isPositive: true,
      sparkline: stats.activityData.map(d => ({ value: d.prayers }))
    },
    { 
      label: "Pending Prayers", 
      value: stats.pendingPrayers, 
      icon: TrendingUp, 
      color: "text-orange-600 bg-orange-100",
      trend: "-2%",
      isPositive: false,
      sparkline: [{ value: 10 }, { value: 8 }, { value: 12 }, { value: 9 }, { value: 7 }, { value: 5 }]
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening in UCOCSA.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <ConfirmAction 
              onConfirm={handleManualCleanup}
              title="Cleanup Old Data?"
              description="Permanently delete past events and programs."
            >
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 gap-2" disabled={cleaning}>
                <Trash2 size={16} /> {cleaning ? "Cleaning..." : "Cleanup"}
              </Button>
            </ConfirmAction>
            <Button size="sm" onClick={fetchStats} disabled={loading} className="gap-2">
              <TrendingUp size={16} /> Refresh
            </Button>
          </div>
        </div>

        {/* School Status Settings */}
        <Card className="border-border/50 border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <School size={18} className="text-amber-500" />
              School Session Status
            </CardTitle>
            <CardDescription>
              Toggle whether UCOCSA regular services are active (e.g. during semester breaks).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base">School is in session</Label>
                    <p className="text-xs text-muted-foreground">
                      Turn off during semester breaks to hide weekly programs and show a closure notice.
                    </p>
                  </div>
                  <Switch 
                    checked={statusForm.is_open} 
                    onCheckedChange={(c) => setStatusForm(prev => ({ ...prev, is_open: c }))} 
                  />
                </div>
              </div>

              {!statusForm.is_open && (
                <div className="space-y-4 border rounded-lg p-4 bg-amber-500/5 border-amber-500/20">
                  <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 mb-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p className="text-xs font-medium">The homepage will display a closure banner and hide regular services.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Reopening Date (Optional)</Label>
                    <Input 
                      type="date" 
                      value={statusForm.opens_at} 
                      onChange={(e) => setStatusForm(prev => ({ ...prev, opens_at: e.target.value }))} 
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Custom Banner Message (Optional)</Label>
                    <Input 
                      type="text" 
                      placeholder="e.g. Regular services resume in October."
                      value={statusForm.closure_msg} 
                      onChange={(e) => setStatusForm(prev => ({ ...prev, closure_msg: e.target.value }))} 
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={handleSaveStatus} disabled={savingStatus}>
                {savingStatus ? "Saving..." : "Save Status"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Card key={card.label} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${card.color}`}>
                    <card.icon size={20} />
                  </div>
                  <div className={`flex items-center text-xs font-medium ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {card.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {card.trend}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                  <h3 className="text-3xl font-bold">{loading ? "..." : card.value}</h3>
                </div>
                <div className="mt-4 h-[40px]">
                  <StatSparkline data={card.sparkline} color={card.isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Monthly signups and prayer requests over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
                  <p className="text-muted-foreground text-sm">Loading charts...</p>
                </div>
              ) : (
                <MonthlyActivityChart data={stats.activityData} />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Prayer Requests</CardTitle>
              <CardDescription>Current status distribution.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
                  <p className="text-muted-foreground text-sm">Loading distribution...</p>
                </div>
              ) : (
                <DistributionDonutChart data={stats.prayerDistribution} />
              )}
            </CardContent>
          </Card>
        </div>

        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">Historical Records</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Auto-deletion is disabled. Use the cleanup tool periodically to keep the database optimal while preserving important historical trends.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
