import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, HandHeart, BookOpen, Users, Music, ArrowRight, Image, Church, Megaphone, CalendarDays, Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import CountdownTimer from "@/components/CountdownTimer";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroBg from "@/assets/hero-bg.jpg";

const quickLinks = [
  { to: "/events", icon: Calendar, label: "Events", desc: "View upcoming fellowships" },
  { to: "/prayer", icon: HandHeart, label: "Prayer", desc: "Submit a prayer request" },
  { to: "/resources", icon: BookOpen, label: "Resources", desc: "Bible study materials" },
  { to: "/gallery", icon: Image, label: "Gallery", desc: "View photo albums" },
];

const ministries = [
  { icon: Music, title: "Hymns Ministry", desc: "Worship through hymns and praise" },
  { icon: BookOpen, title: "Bible Study", desc: "Weekly small-group discussions" },
  { icon: Users, title: "Outreach", desc: "Community service and evangelism" },
  { icon: HandHeart, title: "Prayer Team", desc: "Intercession and spiritual support" },
];

const Index = () => {
  // Dynamic events from database
  const { data: events } = useQuery({
    queryKey: ["homepage-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Dynamic announcements
  const { data: announcements } = useQuery({
    queryKey: ["homepage-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data;
    },
  });

  // Dynamic blog posts
  const { data: blogPosts } = useQuery({
    queryKey: ["homepage-blog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Gallery highlights
  const { data: highlightedAlbums } = useQuery({
    queryKey: ["homepage-gallery-highlights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_albums")
        .select("*, gallery_photos(id, image_url, caption)")
        .eq("is_highlighted", true)
        .eq("is_published", true);
      if (error) throw error;
      return data;
    },
  });

  // Upcoming service programs
  const { data: upcomingPrograms } = useQuery({
    queryKey: ["homepage-programs"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("service_programs")
        .select("*")
        .eq("is_published", true)
        .gte("service_date", today)
        .order("service_date", { ascending: true })
        .limit(2);
      if (error) throw error;
      return data;
    },
  });

  const highlightPhotos = highlightedAlbums?.flatMap(
    (album) => (album.gallery_photos as any[])?.map((p: any) => ({ ...p, albumTitle: album.title })) ?? []
  ) ?? [];

  const latestAnnouncement = announcements?.[0];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="UCOCSA fellowship gathering" width={1920} height={1080} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-forest-deep/70" />
        </div>

        <div className="relative z-10 container text-center py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-gold-light text-sm uppercase tracking-[0.2em] mb-4 font-medium">University of Malawi</p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading text-cream mb-6 leading-tight">
              Welcome to <span className="text-gradient-gold">UCOCSA</span>
            </h1>
            <p className="text-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              A Christ-centered community nurturing faith, academic excellence, and lifelong fellowship at UNIMA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link to="/join" className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-gold-dark transition-colors shadow-lg">
                Join Our Community
              </Link>
              <Link to="/about" className="px-8 py-3 rounded-lg border border-cream/30 text-cream font-medium hover:bg-cream/10 transition-colors">
                Learn More
              </Link>
            </div>

            <CountdownTimer />

            {/* Upcoming Service Program Summary */}
            {upcomingPrograms && upcomingPrograms.length > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                {upcomingPrograms.map((prog) => (
                  <Link key={prog.id} to="/events" className="bg-cream/10 backdrop-blur border border-cream/20 rounded-xl px-5 py-3 text-left max-w-xs hover:bg-cream/20 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Church size={14} className="text-gold-light" />
                      <span className="text-xs font-medium text-gold-light uppercase tracking-wider">
                        {prog.service_type === "sunday" ? "Sunday Service" : "MidWeek Service"}
                      </span>
                    </div>
                    <p className="text-cream text-sm font-semibold">
                      {prog.title || (prog.service_type === "sunday" ? "Sunday Gathering" : "MidWeek Fellowship")}
                    </p>
                    <p className="text-cream/60 text-xs mt-1">
                      {new Date(prog.service_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {prog.theme && <> · {prog.theme}</>}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Dynamic Announcement Banner */}
      {latestAnnouncement && (
        <div className="bg-primary/10 border-y border-primary/20">
          <div className="container py-3 text-center text-sm font-medium text-foreground">
            <Megaphone size={14} className="inline mr-1 text-primary" /> <span className="text-primary font-semibold">{latestAnnouncement.title}:</span> {latestAnnouncement.content.slice(0, 120)}
            {latestAnnouncement.content.length > 120 && "…"}
          </div>
        </div>
      )}

      {/* Gallery Highlights Carousel */}
      {highlightPhotos.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-heading text-foreground">Gallery Highlights</h2>
              <Link to="/gallery" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                View Gallery <ArrowRight size={14} />
              </Link>
            </div>
            <Carousel opts={{ loop: true, align: "start" }} plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]} className="w-full">
              <CarouselContent className="-ml-3">
                {highlightPhotos.map((photo) => (
                  <CarouselItem key={photo.id} className="pl-3 basis-4/5 sm:basis-1/2 md:basis-1/3">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                      <img
                        src={photo.image_url}
                        alt={photo.caption || "Gallery highlight"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-xs text-white/90">{photo.caption || photo.albumTitle}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3 md:-left-5" />
              <CarouselNext className="-right-3 md:-right-5" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, i) => (
              <motion.div key={link.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={link.to} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card hover:bg-muted transition-colors border border-border group">
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

      {/* Upcoming Events - Dynamic */}
      <section className="py-16">
        <div className="container">
          <SectionHeading title="Upcoming Events" subtitle="Join us for fellowship, worship, and community service." />
          <div className="grid md:grid-cols-3 gap-6">
            {(events ?? []).map((evt, i) => (
              <motion.div key={evt.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card border border-border p-6 hover:shadow-lg transition-shadow">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{evt.event_type}</span>
                <h3 className="mt-3 text-lg font-heading text-foreground">{evt.title}</h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(evt.event_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                  {evt.event_time && <p className="flex items-center gap-1"><Clock size={14} /> {evt.event_time}</p>}
                  {evt.location && <p className="flex items-center gap-1"><MapPin size={14} /> {evt.location}</p>}
                </div>
              </motion.div>
            ))}
            {events?.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-8">No upcoming events. Check back soon!</p>
            )}
          </div>
          <div className="text-center mt-8">
            <Link to="/events" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              View All Events <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts - Dynamic */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container">
            <SectionHeading title="Latest From Our Blog" subtitle="Devotionals, testimonies, and updates from the community." />
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/blog/${post.slug}`} className="block rounded-xl bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow group">
                    {post.cover_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs font-medium text-primary">{post.category}</span>
                      <h3 className="mt-1 text-base font-heading text-foreground line-clamp-2">{post.title}</h3>
                      {post.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                      <p className="mt-3 text-xs text-muted-foreground">{post.author_name}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                Read More <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Ministries */}
      <section className="py-16 bg-muted">
        <div className="container">
          <SectionHeading title="Our Ministries" subtitle="Find your place in the body of Christ." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ministries.map((m, i) => (
              <motion.div key={m.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border">
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-heading text-secondary-foreground mb-4">Ready to Be Part of Something Greater?</h2>
            <p className="text-secondary-foreground/70 max-w-xl mx-auto mb-8">
              Join hundreds of UNIMA students who have found faith, friendship, and purpose through UCOCSA.
            </p>
            <Link to="/join" className="inline-block px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-gold-dark transition-colors shadow-lg">
              Become a Member
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
