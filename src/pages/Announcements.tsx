import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Megaphone, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";

const Announcements = () => {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-3xl">
          <SectionHeading
            title="Announcements"
            subtitle="Stay updated with the latest news and notices from the fellowship."
          />

          {isLoading ? (
            <p className="text-muted-foreground text-center py-12">Loading announcements…</p>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p>No announcements at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {announcements.map((a, i) => (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Megaphone size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-heading text-foreground">{a.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(a.published_at || a.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <div className="mt-3 text-sm text-foreground/85 whitespace-pre-line leading-relaxed">
                        {a.content}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Announcements;
