import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

const execTeam = [
  { name: "Grace Banda", role: "Chairperson", bio: "Final year Theology student passionate about campus ministry." },
  { name: "Samuel Chirwa", role: "Vice Chairperson", bio: "Third year Law student and worship leader." },
  { name: "Faith Kamanga", role: "Secretary General", bio: "Second year Education student coordinating all UCOCSA operations." },
  { name: "James Phiri", role: "Treasurer", bio: "Third year Commerce student managing UCOCSA finances." },
  { name: "Mercy Gondwe", role: "Prayer Secretary", bio: "Second year Nursing student leading the prayer ministry." },
  { name: "Daniel Mwale", role: "Organizing Secretary", bio: "Final year Engineering student planning events and logistics." },
];

const About = () => (
  <Layout>
    {/* Hero */}
    <section className="py-20 bg-secondary">
      <div className="container text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">About UCOCSA</h1>
          <p className="mt-4 text-secondary-foreground/70 max-w-2xl mx-auto">
            Nurturing faith and academic excellence at the University of Malawi since 1985.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-heading text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To provide a Christ-centered community where University of Malawi students can grow spiritually,
              excel academically, and develop into servant leaders who impact society for the glory of God.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-heading text-foreground mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To see every student at UNIMA encounter the transformative love of Christ and be equipped
              to serve as salt and light in Malawi and beyond.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Core Values */}
    <section className="py-16 bg-muted">
      <div className="container">
        <SectionHeading title="Our Core Values" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {["Faith", "Unity", "Service", "Excellence"].map((val, i) => (
            <motion.div
              key={val}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-xl bg-card border border-border"
            >
              <h3 className="font-heading text-lg text-foreground">{val}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Executive Committee */}
    <section className="py-16">
      <div className="container">
        <SectionHeading title="Executive Committee" subtitle="Meet the team leading UCOCSA this academic year." />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {execTeam.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-xl bg-card border border-border text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-heading text-primary">{member.name.charAt(0)}</span>
              </div>
              <h3 className="font-heading text-foreground">{member.name}</h3>
              <p className="text-sm text-primary font-medium">{member.role}</p>
              <p className="mt-2 text-xs text-muted-foreground">{member.bio}</p>
              <a href={`mailto:${member.name.toLowerCase().replace(" ", ".")}@unima.ac.mw`} className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Mail size={12} /> Contact
              </a>
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

export default About;
