import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar as CalIcon, MapPin, Clock, Share2, Church, BookOpen, User, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

type EventType = "Fellowship" | "Bible Study" | "Outreach" | "Special Service" | "Social" | "Other";

const typeColors: Record<string, string> = {
  Fellowship: "bg-primary/10 text-primary",
  "Bible Study": "bg-blue-100 text-blue-700",
  Outreach: "bg-green-100 text-green-700",
  "Special Service": "bg-purple-100 text-purple-700",
  Social: "bg-orange-100 text-orange-700",
  "MidWeek Service": "bg-amber-100 text-amber-700",
  "Sunday Service": "bg-indigo-100 text-indigo-700",
  Other: "bg-muted text-muted-foreground",
};

const Events = () => {
  const [filter, setFilter] = useState<string>("All");
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const { user } = useAuth();
  const types = ["All", "Fellowship", "Bible Study", "Outreach", "Special Service", "Social", "MidWeek Service", "Sunday Service", "Other"];

  const { data: dbEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["events-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["events-page-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_programs")
        .select("*")
        .eq("is_published", true)
        .gte("service_date", new Date().toISOString().split("T")[0])
        .order("service_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const allEvents = useMemo(() => {
    const regular = (dbEvents ?? []).map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      event_date: e.event_date,
      event_time: e.event_time,
      location: e.location,
      event_type: e.event_type,
      is_fixed: false,
      program: null as any,
    }));

    const fixed = (programs ?? []).map((p) => ({
      id: `program-${p.id}`,
      title: p.title || (p.service_type === "sunday" ? "Sunday Gathering" : "MidWeek Fellowship"),
      description: p.theme ? `Theme: ${p.theme}` : (p.leading_verses ? `Scripture: ${p.leading_verses}` : null),
      event_date: p.service_date,
      event_time: p.service_type === "sunday" ? "08:00" : "18:00",
      location: null,
      event_type: p.service_type === "sunday" ? "Sunday Service" : "MidWeek Service",
      is_fixed: true,
      program: p,
    }));

    return [...regular, ...fixed].sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [dbEvents, programs]);

  const filtered = filter === "All" ? allEvents : allEvents.filter((e) => e.event_type === filter);
  const loading = eventsLoading || programsLoading;

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-MW", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
  };

  const toggleProgram = (id: string) => {
    setExpandedProgram(expandedProgram === id ? null : id);
  };

  return (
    <Layout>
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">Events</h1>
            <p className="mt-4 text-secondary-foreground/70">Fellowship, worship, outreach, and more.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {types.map((t) => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading events...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No events scheduled yet. Check back soon!</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {filtered.map((evt, i) => (
                <motion.div key={evt.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className={`rounded-xl bg-card border p-6 hover:shadow-lg transition-shadow ${
                    evt.is_fixed ? "border-primary/30 bg-primary/5" : "border-border"
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColors[evt.event_type] || typeColors.Other}`}>
                      {evt.event_type}
                    </span>
                    {evt.is_fixed && (
                      <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                        {evt.program?.service_type === "sunday" ? <Church size={10} className="mr-1" /> : <BookOpen size={10} className="mr-1" />}
                        Fixed
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-heading text-foreground">{evt.title}</h3>
                  {evt.description && <p className="mt-2 text-sm text-muted-foreground">{evt.description}</p>}

                  {/* Public summary for fixed services */}
                  {evt.is_fixed && evt.program && (
                    <div className="mt-3 text-xs text-muted-foreground space-y-1 border-t border-border pt-2">
                      {evt.program.facilitator && <p className="flex items-center gap-1"><User size={14} /> Facilitator: {evt.program.facilitator}</p>}
                      {evt.program.leading_verses && <p className="flex items-center gap-1"><BookOpen size={14} /> {evt.program.leading_verses}</p>}
                    </div>
                  )}

                  {/* Full program details for logged-in members */}
                  {evt.is_fixed && evt.program && user && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleProgram(evt.id)}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {expandedProgram === evt.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expandedProgram === evt.id ? "Hide" : "View"} Full Program
                      </button>

                      {expandedProgram === evt.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="mt-2 bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1.5 border border-border"
                        >
                          <p className="font-semibold text-foreground text-sm mb-2">Order of Service</p>
                          {evt.program.service_type === "sunday" ? (
                            <>
                              {evt.program.convener && <p><span className="font-medium text-foreground">Convener:</span> {evt.program.convener}</p>}
                              {evt.program.first_prayer && <p><span className="font-medium text-foreground">First Prayer:</span> {evt.program.first_prayer}</p>}
                              {evt.program.teaching && <p><span className="font-medium text-foreground">Teaching:</span> {evt.program.teaching}</p>}
                              {evt.program.preaching && <p><span className="font-medium text-foreground">Preaching:</span> {evt.program.preaching}</p>}
                              {evt.program.alter_call && <p><span className="font-medium text-foreground">Altar Call:</span> {evt.program.alter_call}</p>}
                              {evt.program.holy_communion && <p><span className="font-medium text-foreground">Holy Communion:</span> {evt.program.holy_communion}</p>}
                              {evt.program.bearers && evt.program.bearers.length > 0 && evt.program.bearers.some((b: string) => b) && (
                                <p><span className="font-medium text-foreground">Bearers:</span> {evt.program.bearers.filter((b: string) => b).join(", ")}</p>
                              )}
                              {evt.program.last_prayer && <p><span className="font-medium text-foreground">Last Prayer:</span> {evt.program.last_prayer}</p>}
                              {evt.program.announcements && <p><span className="font-medium text-foreground">Announcements:</span> {evt.program.announcements}</p>}
                            </>
                          ) : (
                            <>
                              {evt.program.facilitator && <p><span className="font-medium text-foreground">Facilitator:</span> {evt.program.facilitator}</p>}
                              {evt.program.leading_verses && <p><span className="font-medium text-foreground">Scripture:</span> {evt.program.leading_verses}</p>}
                              {evt.program.theme && <p><span className="font-medium text-foreground">Theme:</span> {evt.program.theme}</p>}
                              {evt.program.first_prayer && <p><span className="font-medium text-foreground">Opening Prayer:</span> {evt.program.first_prayer}</p>}
                              {evt.program.last_prayer && <p><span className="font-medium text-foreground">Closing Prayer:</span> {evt.program.last_prayer}</p>}
                              {evt.program.announcements && <p><span className="font-medium text-foreground">Announcements:</span> {evt.program.announcements}</p>}
                            </>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalIcon size={14} /> {formatDate(evt.event_date)}</span>
                    {evt.event_time && <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(evt.event_time)}</span>}
                    {evt.location && <span className="flex items-center gap-1"><MapPin size={14} /> {evt.location}</span>}
                  </div>
                  <button onClick={() => navigator.share?.({ title: evt.title, text: evt.description || evt.title })}
                    className="mt-4 flex items-center gap-1 text-xs text-primary hover:underline">
                    <Share2 size={12} /> Share
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Events;
