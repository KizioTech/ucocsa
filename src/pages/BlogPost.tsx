import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, MessageCircle, ArrowLeft, Send, Trash2, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: likes = [] } = useQuery({
    queryKey: ["blog-likes", post?.id],
    enabled: !!post,
    queryFn: async () => {
      const { data } = await supabase.from("blog_likes").select("*").eq("post_id", post!.id);
      return data || [];
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["blog-comments", post?.id],
    enabled: !!post,
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_comments")
        .select("*, profiles(full_name, avatar_url)")
        .eq("post_id", post!.id)
        .order("created_at", { ascending: true });
      return data || [];
    },
  });

  const userLiked = likes.some((l: any) => l.user_id === user?.id);

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Sign in to like"); return; }
      if (userLiked) {
        await supabase.from("blog_likes").delete().eq("post_id", post!.id).eq("user_id", user.id);
      } else {
        await supabase.from("blog_likes").insert({ post_id: post!.id, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog-likes", post?.id] }),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Sign in to comment"); return; }
      const { error } = await supabase.from("blog_comments").insert({
        post_id: post!.id,
        user_id: user.id,
        content: comment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", post?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("blog_comments").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog-comments", post?.id] }),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Post not found.</p>
          <Link to="/blog" className="text-primary hover:underline">← Back to Blog</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Cover image */}
      {post.cover_image_url && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article className="py-12">
        <div className="container max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              {post.category}
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-heading text-foreground leading-tight">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User size={14} /> {post.author_name}</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
              </span>
            </div>
          </motion.div>

          {/* Content */}
          <div className="mt-8 prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Like & stats bar */}
          <div className="mt-10 flex items-center gap-6 py-4 border-t border-b border-border">
            <button
              onClick={() => toggleLike.mutate()}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                userLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart size={18} fill={userLiked ? "currentColor" : "none"} />
              {likes.length} {likes.length === 1 ? "like" : "likes"}
            </button>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle size={18} /> {comments.length} comments
            </span>
          </div>

          {/* Comments */}
          <section className="mt-8">
            <h2 className="text-lg font-heading text-foreground mb-4">Comments</h2>

            {user && (
              <div className="flex gap-3 mb-6">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts…"
                  rows={2}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  disabled={!comment.trim() || addComment.isPending}
                  onClick={() => addComment.mutate()}
                  className="self-end"
                >
                  <Send size={14} />
                </Button>
              </div>
            )}

            {!user && (
              <p className="text-sm text-muted-foreground mb-4">
                <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to leave a comment.
              </p>
            )}

            <div className="space-y-4">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-card border border-border">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={c.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {(c.profiles?.full_name || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {c.profiles?.full_name || "Anonymous"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        {c.user_id === user?.id && (
                          <button onClick={() => deleteComment.mutate(c.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
              )}
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
