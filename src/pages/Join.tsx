import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Check, GraduationCap } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const faculties = [
  "Faculty of Education",
  "Faculty of Humanities",
  "Faculty of Law",
  "Faculty of Science",
  "Faculty of Social Science",
  "College of Medicine",
  "The Polytechnic",
  "Kamuzu College of Nursing",
];

const Join = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", faculty: "", year: "1",
    interests: [] as string[],
  });

  const interests = ["Choir", "Bible Study", "Outreach", "Prayer Team", "Organizing Committee", "Media"];

  const toggleInterest = (val: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(val)
        ? prev.interests.filter((i) => i !== val)
        : [...prev.interests, val],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("members").insert({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || null,
        faculty: form.faculty,
        year_of_study: parseInt(form.year),
        interests: form.interests,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Welcome to the UCOCSA family!");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">Join UCOCSA</h1>
            <p className="mt-4 text-secondary-foreground/70 max-w-lg mx-auto">
              Become part of a vibrant Christian community at UNIMA. Registration is free!
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-2xl">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 rounded-xl bg-primary/10">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-heading text-foreground">Welcome to UCOCSA!</h2>
              <p className="mt-3 text-muted-foreground">
                You've been registered successfully. Check your email for a welcome message with next steps.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://wa.me/265999000000" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-2 rounded-lg bg-[#25D366] text-[#fff] font-medium text-sm">
                  Join WhatsApp Group
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit}
              className="space-y-6 bg-card p-8 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-2">
                <UserPlus size={24} className="text-primary" />
                <h2 className="text-xl font-heading text-foreground">Membership Form</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
                  <input required type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
                  <input required type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="student@unima.ac.mw"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone (WhatsApp)</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+265 999 000 000"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Faculty *</label>
                  <select required value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select faculty</option>
                    {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Year of Study *</label>
                  <select required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    {[1, 2, 3, 4, 5].map((y) => <option key={y} value={String(y)}>Year {y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ministry Interests</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((int) => (
                    <button key={int} type="button" onClick={() => toggleInterest(int)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        form.interests.includes(int)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}>
                      {int}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-gold-dark transition-colors disabled:opacity-50">
                <GraduationCap size={20} /> {loading ? "Registering..." : "Register as Member"}
              </button>
            </motion.form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Join;
