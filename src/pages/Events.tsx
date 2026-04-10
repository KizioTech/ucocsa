import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalIcon, MapPin, Clock, Share2 } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";

type EventType = "Fellowship" | "Bible Study" | "Outreach" | "Special Service" | "Social" | "Other";

const typeColors: Record<string, string> = {
  Fellowship: "bg-primary/10 text-primary",
  "Bible Study": "bg-blue-100 text-blue-700",
  Outreach: "bg-green-100 text-green-700",
  "Special Service": "bg-purple-100 text-purple-700",
  Social: "bg-orange-100 text-orange-700",
  Other: "bg-muted text-muted-foreground",
};

const Events = () => {
  const [filter, setFilter] = useState<string>("All");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const types = ["All", "Fellowship", "Bible Study", "Outreach", "Special Service", "Social", "Other"];

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filtered = filter === "All" ? events : events.filter((e) => e.event_type === filter);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-MW", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
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
                  className="rounded-xl bg-card border border-border p-6 hover:shadow-lg transition-shadow">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColors[evt.event_type] || typeColors.Other}`}>
                    {evt.event_type}
                  </span>
                  <h3 className="mt-3 text-lg font-heading text-foreground">{evt.title}</h3>
                  {evt.description && <p className="mt-2 text-sm text-muted-foreground">{evt.description}</p>}
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
