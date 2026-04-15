import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Music } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  whatsapp_number: string | null;
  image_url: string | null;
}

const About = () => {
  const [execTeam, setExecTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await (supabase as any)
        .from("team_members")
        .select("*")
        .order("order_index", { ascending: true });
      if (data) setExecTeam(data);
    };
    fetchTeam();
  }, []);

  return (
  <Layout>
    {/* Hero */}
    <section className="py-24 bg-gradient-to-b from-secondary to-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48" />
      
      <div className="container relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge variant="outline" className="mb-6 px-4 py-1 border-primary/20 text-primary bg-primary/5">Since 1985</Badge>
          <h1 className="text-5xl md:text-7xl font-heading text-foreground tracking-tight leading-tight">
            Rooted in Christ, <br/><span className="text-gradient-gold">Nurturing Leaders</span>
          </h1>
          <p className="mt-8 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            The UNIMA Church of Christ Student Association (UCOCSA) has been a beacon of faith and spiritual growth at the University of Malawi for nearly four decades.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-24 border-y border-border/40">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="p-10 rounded-[2rem] bg-card border border-border/60 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <h2 className="text-3xl font-heading text-foreground mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              To provide a Christ-centered community where University of Malawi students can grow spiritually,
              excel academically, and develop into servant leaders who impact society for the glory of God.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="p-10 rounded-[2rem] bg-card border border-border/60 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
            <h2 className="text-3xl font-heading text-foreground mb-6 text-right">Our Vision</h2>
            <p className="text-muted-foreground text-lg leading-relaxed text-right">
              To see every student at UNIMA encounter the transformative love of Christ and be equipped
              to serve as salt and light in Malawi and beyond.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Executive Committee */}
    <section className="py-24 bg-muted/30">
      <div className="container">
        <SectionHeading 
          title="Executive Committee" 
          subtitle="A dedicated group of student leaders committed to serving the UCOCSA family and steering our collective vision forward." 
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          {execTeam.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-[2.5rem] bg-background border border-border/60 text-center hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-32 h-32 rounded-full ring-4 ring-muted group-hover:ring-primary/20 bg-muted flex items-center justify-center mx-auto mb-6 shadow-inner relative overflow-hidden transition-all duration-500">
                {member.image_url ? (
                  <img src={member.image_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <span className="text-4xl font-heading text-primary">{member.name.charAt(0)}</span>
                )}
              </div>
              
              <h3 className="text-xl font-heading text-foreground mb-1">{member.name}</h3>
              <p className="text-sm text-primary font-bold uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 rounded-full mb-4">{member.role}</p>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                {member.bio || "Growing in faith and serving the student body at the University of Malawi."}
              </p>
              
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-border/40">
                {member.whatsapp_number ? (
                  <a 
                    href={`https://wa.me/${member.whatsapp_number.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-bold hover:scale-105 transition-transform"
                  >
                    <Music size={14} className="rotate-90" /> WhatsApp
                  </a>
                ) : (
                  <a 
                    href={`mailto:${member.name.toLowerCase().replace(" ", ".")}@unima.ac.mw`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-secondary text-foreground text-xs font-bold hover:bg-muted transition-colors"
                  >
                    <Mail size={14} /> Email
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* History */}
    <section className="py-16 bg-secondary">
      <div className="container max-w-3xl">
        <SectionHeading title="Our History" />
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-secondary-foreground/80 leading-relaxed">
            Founded in 1985 by a small group of devoted Christian students at the University of Malawi,
            UCOCSA has grown into one of the largest and most active student organizations on campus.
            Over the decades, UCOCSA has mentored thousands of students, planted churches, launched
            community outreach programs, and produced alumni who serve in leadership positions across
            Malawi and the world.
          </p>
        </motion.div>
      </div>
    </section>
  </Layout>
  );
};

export default About;
