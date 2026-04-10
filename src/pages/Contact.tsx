import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Facebook, Instagram, Youtube } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const contactInfo = [
  { icon: MapPin, label: "Location", value: "University of Malawi, Zomba Campus, Malawi" },
  { icon: Mail, label: "Email", value: "ucocsa@unima.ac.mw" },
  { icon: Phone, label: "Phone", value: "+265 999 123 456" },
  { icon: Clock, label: "Office Hours", value: "Mon–Fri, 8:00 AM – 5:00 PM" },
];

const socials = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/ucocsa" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/ucocsa" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@ucocsa" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/265999123456" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // For now, open WhatsApp with the message
    const text = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`;
    window.open(`https://wa.me/265999123456?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Redirecting to WhatsApp…");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">Contact Us</h1>
            <p className="mt-4 text-secondary-foreground/70 max-w-xl mx-auto">
              We'd love to hear from you. Reach out with questions, prayer requests, or just to say hello!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <item.icon className="mx-auto h-8 w-8 text-primary mb-3" />
                    <h3 className="font-heading text-sm font-semibold text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionHeading title="Send a Message" subtitle="Fill out the form and we'll get back to you soon." />
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    maxLength={100}
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    maxLength={255}
                  />
                </div>
                <Input
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  maxLength={200}
                />
                <Textarea
                  placeholder="Your message…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  required
                  maxLength={1000}
                />
                <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                  <Send size={16} /> Send via WhatsApp
                </Button>
              </form>
            </motion.div>

            {/* Map & Social */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionHeading title="Find Us" subtitle="University of Malawi, Zomba Campus" />
              <div className="mt-6 rounded-xl overflow-hidden border border-border aspect-video">
                <iframe
                  title="UCOCSA Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3846.5!2d35.3194!3d-15.3875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDIzJzE1LjAiUyAzNcKwMTknMDkuOCJF!5e0!3m2!1sen!2smw!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="mt-8">
                <h3 className="font-heading text-lg text-foreground mb-4">Connect With Us</h3>
                <div className="flex gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      aria-label={s.label}
                    >
                      <s.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
