import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Send, Lock, Eye, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import PrayerComments from "@/components/PrayerComments";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Personal", "Academic", "Family", "Health", "National", "Thanksgiving"];

const Prayer = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", category: "Personal", request: "", anonymous: false, private: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [praiseReports, setPraiseReports] = useState<any[]>([]);
  const [approvedPrayers, setApprovedPrayers] = useState<any[]>([]);
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);
  const [expandedPraise, setExpandedPraise] = useState<string | null>(null);

  useEffect(() => {
    fetchPraiseReports();
    fetchApprovedPrayers();
  }, []);

  const fetchPraiseReports = async () => {
    const { data } = await supabase
      .from("praise_reports")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setPraiseReports(data);
  };

  const fetchApprovedPrayers = async () => {
    const { data } = await supabase
      .from("prayer_requests")
      .select("*")
      .eq("is_private", false)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setApprovedPrayers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("prayer_requests").insert({
        name: form.anonymous ? null : form.name || null,
        category: form.category,
        request: form.request,
        is_anonymous: form.anonymous,
        is_private: form.private,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Your prayer request has been submitted. We are praying with you. 🙏");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit prayer request");
    } finally {
      setLoading(false);
    }
  };

  const handlePray = async (id: string, currentCount: number, type: "prayer" | "praise") => {
    const table = type === "prayer" ? "prayer_requests" : "praise_reports";
    await supabase.from(table).update({ prayed_count: currentCount + 1 }).eq("id", id);
    if (type === "praise") {
      setPraiseReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, prayed_count: r.prayed_count + 1 } : r))
      );
    } else {
      setApprovedPrayers((prev) =>
        prev.map((r) => (r.id === id ? { ...r, prayed_count: r.prayed_count + 1 } : r))
      );
    }
  };

  return (
    <Layout>
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">Prayer Portal</h1>
            <p className="mt-4 text-secondary-foreground/70">Share your burdens. We carry them together in prayer.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Submission Form */}
            <div>
              <SectionHeading title="Submit a Request" centered={false} />
              {submitted ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-xl bg-primary/10 text-center">
                  <Heart size={48} className="text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-lg text-foreground">Request Received</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Our prayer team has been notified. God is listening.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: "", category: "Personal", request: "", anonymous: false, private: false }); }} className="mt-4 text-sm text-primary hover:underline">
                    Submit Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Your Name (optional)</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Leave blank to stay anonymous"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Your Prayer Request</label>
                    <textarea required rows={4} value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} placeholder="Share what's on your heart..."
                      className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} className="rounded" />
                      <Lock size={14} /> Submit anonymously
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={form.private} onChange={(e) => setForm({ ...form, private: e.target.checked })} className="rounded" />
                      <Eye size={14} /> Keep private (leadership only)
                    </label>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-gold-dark transition-colors disabled:opacity-50">
                    <Send size={16} /> {loading ? "Submitting..." : "Submit Prayer Request"}
                  </button>
                </form>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-12">
              {/* Public Prayer Requests */}
              <div>
                <SectionHeading title="Prayer Wall" subtitle="Join others in prayer." centered={false} />
                <div className="space-y-4">
                  {approvedPrayers.length === 0 && (
                    <p className="text-sm text-muted-foreground">No public prayer requests yet.</p>
                  )}
                  {approvedPrayers.map((req, i) => (
                    <motion.div key={req.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-xl bg-card border border-border">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{req.category}</span>
                      {req.name && <p className="mt-2 text-xs text-muted-foreground">By {req.name}</p>}
                      <p className="mt-2 text-sm text-foreground leading-relaxed">{req.request}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button onClick={() => handlePray(req.id, req.prayed_count, "prayer")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Heart size={12} /> {req.prayed_count} praying
                        </button>
                        <button onClick={() => setExpandedPrayer(expandedPrayer === req.id ? null : req.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle size={12} /> Comments
                        </button>
                      </div>
                      {expandedPrayer === req.id && <PrayerComments parentId={req.id} type="prayer" />}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Praise Reports */}
              <div>
                <SectionHeading title="Praise Reports" subtitle="Celebrating answered prayers." centered={false} />
                <div className="space-y-4">
                  {praiseReports.length === 0 && (
                    <p className="text-sm text-muted-foreground">No praise reports yet. Be the first to share!</p>
                  )}
                  {praiseReports.map((report, i) => (
                    <motion.div key={report.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-xl bg-card border border-border">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{report.category}</span>
                      <p className="mt-3 text-sm text-foreground leading-relaxed">{report.text}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button onClick={() => handlePray(report.id, report.prayed_count, "praise")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Heart size={12} /> {report.prayed_count} praying
                        </button>
                        <button onClick={() => setExpandedPraise(expandedPraise === report.id ? null : report.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle size={12} /> Comments
                        </button>
                      </div>
                      {expandedPraise === report.id && <PrayerComments parentId={report.id} type="praise" />}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Prayer;
