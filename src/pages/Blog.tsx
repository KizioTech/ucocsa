import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Blog = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("blog_posts")
        .select("*, profiles!blog_posts_author_id_fkey(full_name, avatar_url)")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <SEO 
        title="Blog & Student Voices"
        description="Read stories, devotionals, and reflections from the UCOCSA student community at the University of Malawi."
      />
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">Blog & Student Voices</h1>
            <p className="mt-4 text-secondary-foreground/70">Stories, devotionals, and reflections from our community.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-8">
              {posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <Link to={`/blog/${post.slug}`} className="relative h-56 overflow-hidden">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                        <User size={48} className="text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-semibold text-primary shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <Link to={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-heading text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    
                    {post.excerpt && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
                      <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2 group/author">
                        <Avatar className="h-8 w-8 transition-ring group-hover/author:ring-2 ring-primary/30">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {(post.profiles?.full_name || post.author_name || "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-foreground group-hover/author:text-primary transition-colors">
                            {post.profiles?.full_name || post.author_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </Link>

                      <Link 
                        to={`/blog/${post.slug}`}
                        className="p-2 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;

