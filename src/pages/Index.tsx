import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, HandHeart, BookOpen, Users, Music, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import CountdownTimer from "@/components/CountdownTimer";
import SectionHeading from "@/components/SectionHeading";
import heroBg from "@/assets/hero-bg.jpg";

const scriptureOfTheWeek = {
  verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
  reference: "Jeremiah 29:11",
};

const quickLinks = [
  { to: "/events", icon: Calendar, label: "Events", desc: "View upcoming fellowships" },
  { to: "/prayer", icon: HandHeart, label: "Prayer", desc: "Submit a prayer request" },
  { to: "/resources", icon: BookOpen, label: "Resources", desc: "Bible study materials" },
  { to: "/give", icon: HandHeart, label: "Give", desc: "Support the ministry" },
];

const upcomingEvents = [
  { title: "Midweek Service", date: "Every Wednesday", time: "5:00 PM", location: "Great Hall, UNIMA", type: "Fellowship" },
  { title: "Prayer & Worship Night", date: "April 12, 2026", time: "6:30 PM", location: "Chapel", type: "Special Service" },
  { title: "Community Outreach", date: "April 19, 2026", time: "8:00 AM", location: "Zomba Central Market", type: "Outreach" },
];

const ministries = [
  { icon: Music, title: "Hymns Ministry", desc: "Worship through hymns and praise" },
  { icon: BookOpen, title: "Bible Study", desc: "Weekly small-group discussions" },
  { icon: Users, title: "Outreach", desc: "Community service and evangelism" },
  { icon: HandHeart, title: "Prayer Team", desc: "Intercession and spiritual support" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="UCOCSA fellowship gathering" width={1920} height={1080} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-forest-deep/70" />
        </div>

        <div className="relative z-10 container text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold-light text-sm uppercase tracking-[0.2em] mb-4 font-medium">
              University of Malawi
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading text-cream mb-6 leading-tight">
              Welcome to <span className="text-gradient-gold">UCOCSA</span>
            </h1>
            <p className="text-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              A Christ-centered community nurturing faith, academic excellence, and lifelong fellowship at UNIMA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link
                to="/join"
                className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-gold-dark transition-colors shadow-lg"
              >
                Join Our Community
              </Link>
              <Link
                to="/about"
                className="px-8 py-3 rounded-lg border border-cream/30 text-cream font-medium hover:bg-cream/10 transition-colors"
              >
                Learn More
              </Link>
            </div>

            {/* Countdown */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-cream/60 text-sm uppercase tracking-wider">Next Fellowship In</p>
              <CountdownTimer />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Announcement Banner */}
      <div className="bg-primary/10 border-y border-primary/20">
        <div className="container py-3 text-center text-sm font-medium text-foreground">
          📢 <span className="text-primary font-semibold">Special Announcement:</span> Welcome Week activities start April 7th! All freshmen are invited.
        </div>
      </div>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={link.to}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card hover:bg-muted transition-colors border border-border group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <link.icon size={24} className="text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">{link.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{link.desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture of the Week */}
      <section className="py-12 bg-secondary">
        <div className="container text-center">
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-xl md:text-2xl font-heading text-secondary-foreground italic leading-relaxed">
              "{scriptureOfTheWeek.verse}"
            </p>
            <cite className="block mt-4 text-sm text-gold-light font-medium not-italic">
              — {scriptureOfTheWeek.reference}
            </cite>
          </motion.blockquote>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container">
          <SectionHeading title="Upcoming Events" subtitle="Join us for fellowship, worship, and community service." />
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((evt, i) => (
              <motion.div
                key={evt.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {evt.type}
                </span>
                <h3 className="mt-3 text-lg font-heading text-foreground">{evt.title}</h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>📅 {evt.date}</p>
                  <p>🕐 {evt.time}</p>
                  <p>📍 {evt.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/events" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              View All Events <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Ministries */}
      <section className="py-16 bg-muted">
        <div className="container">
          <SectionHeading title="Our Ministries" subtitle="Find your place in the body of Christ." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ministries.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <m.icon size={28} className="text-primary" />
                </div>
                <h3 className="font-heading text-base text-foreground">{m.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading text-secondary-foreground mb-4">
              Ready to Be Part of Something Greater?
            </h2>
            <p className="text-secondary-foreground/70 max-w-xl mx-auto mb-8">
              Join hundreds of UNIMA students who have found faith, friendship, and purpose through UCOCSA.
            </p>
            <Link
              to="/join"
              className="inline-block px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-gold-dark transition-colors shadow-lg"
            >
              Become a Member
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
