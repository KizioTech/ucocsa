import React, { useEffect, useState } from "react";
import { CircularTestimonials } from "./ui/circular-testimonials";
import SectionHeading from "./SectionHeading";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
}

const ExecutiveTeam = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("id, name, role, bio, image_url")
          .order("order_index", { ascending: true });
        
        if (error) throw error;
        if (data) setTeam(data);
      } catch (err) {
        console.error("Error fetching executive team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const testimonials = team.map(m => ({
    name: m.name,
    designation: m.role,
    quote: m.bio || "Growing in faith and serving the student body at the University of Malawi.",
    src: m.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`
  }));

  if (!loading && team.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30 overflow-hidden text-center">
      <div className="container">
        <SectionHeading 
          title="Our Executive Team" 
          subtitle="Meet the dedicated leaders serving the UCOCSA community at the University of Malawi."
        />
        
        {loading ? (
          <div className="flex justify-center mt-12 py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mt-12"
          >
            <div className="w-full max-w-5xl">
              <CircularTestimonials
                testimonials={testimonials}
                autoplay={true}
                colors={{
                  name: "hsl(var(--primary))",
                  designation: "hsl(var(--muted-foreground))",
                  testimony: "hsl(var(--foreground))",
                  arrowBackground: "hsl(var(--primary))",
                  arrowForeground: "hsl(var(--primary-foreground))",
                  arrowHoverBackground: "hsl(var(--gold-dark, #856404))",
                }}
                fontSizes={{
                  name: "1.75rem",
                  designation: "1rem",
                  quote: "1.125rem",
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ExecutiveTeam;
