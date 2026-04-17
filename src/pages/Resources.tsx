import { motion } from "framer-motion";
import { BookOpen, Download, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";

const studyNotes = [
  { title: "Romans Series — Week 1: The Gospel", topic: "Salvation", book: "Romans", date: "March 2026" },
  { title: "Psalms of Lament", topic: "Worship", book: "Psalms", date: "February 2026" },
  { title: "Sermon on the Mount", topic: "Discipleship", book: "Matthew", date: "January 2026" },
  { title: "Spiritual Warfare", topic: "Faith", book: "Ephesians", date: "December 2025" },
];

const externalResources = [
  { name: "YouVersion Bible App", url: "https://www.bible.com", desc: "Read the Bible in multiple languages" },
  { name: "Bible Gateway", url: "https://www.biblegateway.com", desc: "Search and study Scripture online" },
  { name: "The Bible Project", url: "https://bibleproject.com", desc: "Visual summaries of every book of the Bible" },
];

const Resources = () => (
  <Layout>
    <SEO 
      title="Bible Study Resources"
      description="Access Bible study materials, devotionals, and spiritual growth tools from UCOCSA."
    />
    <section className="py-20 bg-secondary">
      <div className="container text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">Resources</h1>
          <p className="mt-4 text-secondary-foreground/70">Study materials, devotionals, and spiritual growth tools.</p>
        </motion.div>
      </div>
    </section>

    {/* Scripture of the Week */}
    <section className="py-12 bg-primary/5">
      <div className="container text-center max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-primary font-medium mb-3">Scripture of the Week</p>
        <blockquote className="text-xl md:text-2xl font-heading text-foreground italic">
          "Trust in the Lord with all your heart and lean not on your own understanding."
        </blockquote>
        <cite className="block mt-3 text-sm text-primary font-medium not-italic">— Proverbs 3:5</cite>
      </div>
    </section>

    {/* Study Notes */}
    <section className="py-16">
      <div className="container">
        <SectionHeading title="Bible Study Notes" subtitle="Download notes from our weekly study sessions." />
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {studyNotes.map((note, i) => (
            <motion.div
              key={note.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">{note.title}</h3>
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{note.book}</span>·<span>{note.topic}</span>·<span>{note.date}</span>
                </div>
              </div>
              <button className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors text-primary" title="Download">
                <Download size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* External Resources */}
    <section className="py-16 bg-muted">
      <div className="container">
        <SectionHeading title="Recommended Resources" />
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {externalResources.map((res, i) => (
            <motion.a
              key={res.name}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl bg-card border border-border text-center hover:shadow-md transition-shadow group"
            >
              <ExternalLink size={20} className="text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground text-sm">{res.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{res.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Resources;
