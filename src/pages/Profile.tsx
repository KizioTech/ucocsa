import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Camera, Save, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [authorPosts, setAuthorPosts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const isOwnProfile = !id || id === user?.id;
  const targetId = id || user?.id;

  useEffect(() => {
    if (!authLoading && !user && !id) {
      navigate("/auth");
      return;
    }

    if (targetId) {
      const fetchProfileData = async () => {
        setLoadingProfile(true);
        const [profileRes, postsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", targetId).single(),
          // @ts-expect-error - author_id might be missing in types.ts
          supabase.from("blog_posts").select("*").eq("author_id", targetId).eq("is_published", true).order("published_at", { ascending: false })
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
          setFullName(profileRes.data.full_name || "");
          setAvatarUrl(profileRes.data.avatar_url || "");
        }
        if (postsRes.data) {
          setAuthorPosts(postsRes.data);
        }
        setLoadingProfile(false);
      };

      fetchProfileData();
    }
  }, [targetId, authLoading, user, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(urlData.publicUrl + "?t=" + Date.now());
    setUploading(false);
    toast({ title: "Photo uploaded", description: "Don't forget to save!" });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Profile updated successfully." });
    }
    setSaving(false);
  };

  if (authLoading || loadingProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const initials = (fullName || profile?.full_name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Layout>
      <section className="py-24 bg-stone-50 min-h-screen">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-sm border-stone-200 sticky top-24">
                <CardHeader className="text-center pb-8 border-b border-stone-100">
                  <div className="flex justify-center mb-6 relative group">
                    <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4 ring-offset-stone-950">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <label className="absolute bottom-0 right-1/2 translate-x-12 translate-y-1 bg-primary text-primary-foreground rounded-full p-2.5 cursor-pointer hover:scale-110 transition-transform shadow-xl">
                        <Camera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                  <CardTitle className="font-heading text-3xl text-stone-900">
                    {isOwnProfile ? "My Profile" : profile?.full_name}
                  </CardTitle>
                  <CardDescription className="text-stone-500 mt-2">
                    {isOwnProfile ? user?.email : "Community Member"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  {isOwnProfile ? (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
                          <User size={14} /> Full Name
                        </label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="bg-stone-50 border-stone-200 text-stone-900"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
                          <Mail size={14} /> Email Address
                        </label>
                        <Input value={user?.email || ""} disabled className="bg-stone-50 border-stone-200 text-stone-900 opacity-60" />
                      </div>
                      <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        {saving ? "Saving..." : "Update Profile"}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
                          <div className="text-center flex-1">
                             <p className="text-2xl font-bold text-stone-900">{authorPosts.length}</p>
                             <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Articles</p>
                          </div>
                       </div>
                       <Button variant="outline" className="w-full rounded-2xl border-stone-200 text-stone-900 hover:bg-stone-50" asChild>
                          <Link to="/messages">Message {profile?.full_name?.split(" ")[0]}</Link>
                       </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Content / Blog Posts */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-heading text-stone-900">
                  {isOwnProfile ? "Your Contributions" : "Published Articles"}
                </h2>
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                  {authorPosts.length} Items
                </Badge>
              </div>

              <div className="grid gap-6">
                {authorPosts.length === 0 ? (
                  <Card className="bg-white shadow-sm border-stone-200 p-12 text-center">
                    <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500">No articles published yet.</p>
                  </Card>
                ) : (
                  authorPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Link to={`/blog/${post.slug}`}>
                        <Card className="bg-white shadow-sm border-stone-200 hover:border-primary/40 hover:shadow-md transition-all group overflow-hidden">
                          <div className="flex flex-col md:flex-row gap-6 p-6">
                            {post.cover_image_url && (
                              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                                <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 py-2">
                              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{post.category}</p>
                              <h3 className="text-xl font-heading text-stone-900 mb-3 group-hover:text-primary transition-colors truncate">{post.title}</h3>
                              <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">{post.excerpt}</p>
                              <div className="flex items-center gap-4 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(post.published_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1.5 ml-auto text-primary group-hover:translate-x-1 transition-transform">Read Article <ArrowRight size={12} /></span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
