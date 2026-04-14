import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, HandHeart, MessageSquare, Bell, User, ArrowRight, Clock,
} from "lucide-react";
import { format } from "date-fns";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [myPrayers, setMyPrayers] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchDashboardData();
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    const [profileRes, prayersRes, eventsRes, announcementsRes, messagesRes] = await Promise.all([
      supabase.from("profiles").select("full_name, avatar_url, created_at").eq("id", user!.id).single(),
      supabase.from("prayer_requests").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("events").select("*").gte("event_date", new Date().toISOString().split("T")[0]).order("event_date").limit(5),
      supabase.from("announcements").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(5),
      supabase.from("conversation_participants").select("conversation_id").eq("user_id", user!.id),
    ]);

    setProfile(profileRes.data);
    setMyPrayers(prayersRes.data || []);
    setUpcomingEvents(eventsRes.data || []);
    setAnnouncements(announcementsRes.data || []);
    setUnreadMessages(messagesRes.data?.length || 0);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <Layout>
      <section className="py-20 px-4">
        <div className="container max-w-5xl mx-auto space-y-8">
          {/* Profile summary */}
          <Card className="bg-secondary text-secondary-foreground">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h1 className="font-heading text-2xl">{profile?.full_name || "Welcome!"}</h1>
                <p className="text-sm opacity-80">{user?.email}</p>
                {profile?.created_at && (
                  <p className="text-xs opacity-60 mt-1">
                    Member since {format(new Date(profile.created_at), "MMMM yyyy")}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                  <Link to="/profile"><User size={14} /> Edit Profile</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                  <Link to="/messages"><MessageSquare size={14} /> Messages</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: "Upcoming Events", value: upcomingEvents.length, link: "/events" },
              { icon: HandHeart, label: "Prayer Requests", value: myPrayers.length, link: "/prayer" },
              { icon: MessageSquare, label: "Conversations", value: unreadMessages, link: "/messages" },
              { icon: Bell, label: "Announcements", value: announcements.length, link: "/dashboard" },
            ].map((stat) => (
              <Link key={stat.label} to={stat.link}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="mx-auto mb-2 text-primary" size={24} />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upcoming events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar size={18} className="text-primary" /> Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events.</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Calendar size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} />
                          {format(new Date(event.event_date), "MMM d, yyyy")}
                          {event.event_time && ` • ${event.event_time}`}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{event.event_type}</Badge>
                    </div>
                  ))
                )}
                <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                  <Link to="/events">View all events <ArrowRight size={14} /></Link>
                </Button>
              </CardContent>
            </Card>

            {/* Prayer requests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HandHeart size={18} className="text-primary" /> Recent Prayers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myPrayers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No prayer requests yet.</p>
                ) : (
                  myPrayers.slice(0, 4).map((prayer) => (
                    <div key={prayer.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-foreground line-clamp-2">{prayer.request}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={prayer.status === "approved" ? "default" : "secondary"} className="text-xs">
                          {prayer.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {prayer.prayed_count} prayed
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                  <Link to="/prayer">View all prayers <ArrowRight size={14} /></Link>
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell size={18} className="text-primary" /> Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No announcements at the moment.</p>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="p-4 rounded-lg border border-border">
                      <h3 className="font-semibold text-foreground">{ann.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                      {ann.published_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(ann.published_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
