import React from "react";
import { CircularTestimonials } from "./ui/circular-testimonials";
import SectionHeading from "./SectionHeading";
import { motion } from "framer-motion";

const executiveTeam = [
  {
    quote:
      "Serving as President has been a journey of faith and leadership. My goal is to see every student rooted in Christ while excelling in their academics.",
    name: "Blessings Phiri",
    designation: "President",
    src:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop",
  },
  {
    quote:
      "Communication is key to our fellowship. I am dedicated to keeping our community informed and connected through every event and announcement.",
    name: "Grace Banda",
    designation: "General Secretary",
    src:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop",
  },
  {
    quote:
      "Stewarding our resources is a sacred trust. I ensure that every contribution to UCOCSA is used effectively for the glory of God and the growth of our members.",
    name: "Chifundo Kawale",
    designation: "Treasurer",
    src:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop",
  },
  {
    quote:
      "Deepening our spiritual lives through hymns and worship is my passion. Let us raise our voices together in praise to the Almighty.",
    name: "Tiwonge Kumwenda",
    designation: "Music Ministry Lead",
    src:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1374&auto=format&fit=crop",
  },
];

const ExecutiveTeam = () => {
  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="container">
        <SectionHeading 
          title="Our Executive Team" 
          subtitle="Meet the dedicated leaders serving the UCOCSA community at the University of Malawi."
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mt-12"
        >
          <div className="w-full max-w-5xl">
            <CircularTestimonials
              testimonials={executiveTeam}
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
      </div>
    </section>
  );
};

export default ExecutiveTeam;
