import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

const Blog = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">Blog & Student Voices</h1>
            <p className="mt-4 text-secondary-foreground/70">Stories, devotionals, and reflections from our community.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading posts…</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, i) => (
                <Link to={`/blog/${post.slug}`} key={post.id}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow group cursor-pointer flex gap-4"
                  >
                    {post.cover_image_url && (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-24 h-24 rounded-lg object-cover shrink-0 hidden sm:block"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <h2 className="mt-3 text-xl font-heading text-foreground group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User size={12} /> {post.author_name}</span>
                          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-primary font-medium group-hover:underline">
                          Read more <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
