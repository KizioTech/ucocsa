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
  Calendar, HandHeart, MessageSquare, Bell, User, ArrowRight, Clock, MapPin
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

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
  const [recentBlogPosts, setRecentBlogPosts] = useState<any[]>([]);
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
    const [profileRes, prayersRes, eventsRes, announcementsRes, blogRes, messagesRes] = await Promise.all([
      supabase.from("profiles").select("full_name, avatar_url, created_at").eq("id", user!.id).single(),
      supabase.from("prayer_requests").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("events").select("*").gte("event_date", new Date().toISOString().split("T")[0]).order("event_date").limit(5),
      supabase.from("announcements").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(5),
      supabase.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(3),
      supabase.from("conversation_participants").select("conversation_id").eq("user_id", user!.id),
    ]);

    setProfile(profileRes.data);
    setMyPrayers(prayersRes.data || []);
    setUpcomingEvents(eventsRes.data || []);
    setAnnouncements(announcementsRes.data || []);
    setRecentBlogPosts(blogRes.data || []);
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
      <section className="py-24 bg-gradient-to-tr stone-50 min-h-screen relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen" />
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10 space-y-12">
          {/* Header & welcome */}
          <motion.div 
             initial={{ opacity: 0, y: -20 }} 
             animate={{ opacity: 1, y: 0 }}
             className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-stone-200"
          >
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20 ring-offset-4 ring-offset-stone-950">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl md:text-5xl font-heading text-stone-900">
                  Welcome, <span className="text-gradient-gold">{profile?.full_name?.split(" ")[0] || "Believer"}!</span>
                </h1>
                <p className="text-stone-400 mt-2 font-medium flex items-center gap-2">
                  <User size={14} className="text-primary" /> {user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild className="rounded-2xl bg-primary text-primary-foreground group hover:scale-105 active:scale-95 transition-all">
                <Link to="/messages" className="flex items-center gap-2">
                   Message Center <MessageSquare size={16} className="group-hover:rotate-12 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-2xl border-stone-200 text-stone-900 hover:bg-white shadow-sm h-10 px-6">
                <Link to="/profile">Edit Profile</Link>
              </Button>
            </div>
          </motion.div>

          {/* Quick stats with glassmorphism */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Calendar, label: "Upcoming Events", value: upcomingEvents.length, link: "/events" },
              { icon: HandHeart, label: "Prayer Requests", value: myPrayers.length, link: "/prayer" },
              { icon: MessageSquare, label: "Active Threads", value: unreadMessages, link: "/messages" },
              { icon: Bell, label: "Announcements", value: announcements.length, link: "#" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={stat.link}>
                  <Card className="bg-white shadow-sm backdrop-blur-xl border-stone-200 hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 group relative overflow-hidden py-4">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                       <stat.icon size={64} />
                    </div>
                    <CardHeader className="pb-2">
                      <p className="text-4xl font-bold text-stone-900 tracking-tighter">{stat.value}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs uppercase font-bold text-stone-500 tracking-widest">{stat.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {/* Left Column: Events & Prayers */}
             <div className="lg:col-span-2 space-y-8">
                {/* Events */}
                <Card className="bg-white shadow-sm backdrop-blur-md border-stone-200 overflow-hidden rounded-[2rem]">
                  <CardHeader className="p-8 border-b border-stone-200 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-stone-900 flex items-center gap-2">
                      <Calendar size={20} className="text-primary" /> Upcoming Fellowship
                    </CardTitle>
                    <Link to="/events" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline tracking-widest">
                       VIEW ALL <ArrowRight size={10} />
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                      {upcomingEvents.length === 0 ? (
                        <div className="p-12 text-center text-stone-500">No upcoming events found.</div>
                      ) : (
                        upcomingEvents.map((event) => (
                          <div key={event.id} className="p-6 flex items-center gap-6 group hover:bg-stone-50 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary font-bold shrink-0">
                               <span className="text-lg leading-none">{new Date(event.event_date).getDate()}</span>
                               <span className="text-[10px] uppercase">{new Date(event.event_date).toLocaleDateString("en-US", { month: "short" })}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-heading text-lg text-stone-900 group-hover:text-primary transition-colors truncate">{event.title}</p>
                              <p className="text-sm text-stone-500 flex items-center gap-2 mt-1">
                                <Clock size={12} /> {event.event_time || "TBA"} • <MapPin size={12} /> {event.location || "On Campus"}
                              </p>
                            </div>
                            <Badge variant="secondary" className="bg-white text-stone-900 tracking-tighter border-0">{event.event_type}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Blog Posts */}
                <div className="grid md:grid-cols-3 gap-6">
                   <div className="md:col-span-3 flex items-center justify-between mb-2">
                       <h3 className="text-xl font-heading text-stone-900">From the Journal</h3>
                       <Link to="/blog" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Read More</Link>
                   </div>
                   {recentBlogPosts.map((post) => (
                      <Link key={post.id} to={`/blog/${post.slug}`}>
                         <Card className="bg-white shadow-sm border-stone-200 hover:border-primary/20 transition-all group overflow-hidden h-full rounded-2xl">
                            <div className="aspect-video relative overflow-hidden">
                               <img src={post.cover_image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                               <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ArrowRight className="text-stone-900" />
                               </div>
                            </div>
                            <CardContent className="p-4">
                               <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{post.category}</p>
                               <h4 className="text-stone-900 text-sm font-bold line-clamp-2 leading-tight">{post.title}</h4>
                            </CardContent>
                         </Card>
                      </Link>
                   ))}
                </div>
             </div>

             {/* Right Column: Prayers & Announcements */}
             <div className="space-y-8">
                {/* Announcements */}
                <Card className="bg-white shadow-sm border-stone-200 rounded-[2rem] overflow-hidden">
                   <CardHeader className="p-8 border-b border-stone-200">
                      <CardTitle className="text-xl text-stone-900 flex items-center gap-2 font-heading">
                         <Bell size={20} className="text-primary" /> Bulletins
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-6 space-y-6">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="relative pl-6 border-l border-primary/30 group">
                           <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary" />
                           <h4 className="text-stone-900 font-bold text-sm mb-1 group-hover:text-primary transition-colors truncate">{ann.title}</h4>
                           <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                           <p className="text-[10px] text-stone-600 mt-2 font-bold uppercase tracking-widest">{format(new Date(ann.published_at), "MMM d, yyyy")}</p>
                        </div>
                      ))}
                   </CardContent>
                </Card>

                {/* Prayer List */}
                <Card className="bg-white shadow-sm backdrop-blur-md border-stone-200 rounded-[2rem] overflow-hidden">
                  <CardHeader className="p-8 border-b border-stone-200">
                    <CardTitle className="text-xl text-stone-900 flex items-center gap-2 font-heading">
                      <HandHeart size={20} className="text-primary" /> Prayer Wall
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {myPrayers.slice(0, 3).map((prayer) => (
                      <div key={prayer.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-primary/20 transition-all">
                        <p className="text-stone-600 text-xs italic line-clamp-2 leading-relaxed">"{prayer.request}"</p>
                        <div className="flex items-center justify-between mt-4">
                           <Badge variant="outline" className="text-[9px] uppercase border-stone-200 text-stone-500 tracking-tighter">
                              {prayer.status}
                           </Badge>
                           <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                              <HandHeart size={10} /> {prayer.prayed_count}
                           </span>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-xs text-stone-500 hover:text-stone-900 uppercase tracking-[0.2em] font-bold" asChild>
                       <Link to="/prayer">Visit Prayer Wall</Link>
                    </Button>
                  </CardContent>
                </Card>
             </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
