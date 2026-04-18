import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, ArrowLeft, Send, Trash2, 
  Calendar, User, Reply, Share2, MoreVertical, EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("blog_posts")
        .select("*, profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: postsLikes = [] } = useQuery({
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
      const { data, error } = await (supabase
        .from("blog_comments") as any)
        .select(`
          id,
          content,
          created_at,
          user_id,
          post_id,
          parent_id,
          profiles:user_id(id, full_name, avatar_url),
          blog_comment_likes(user_id)
        `)
        .eq("post_id", post!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const userPostLiked = postsLikes.some((l: any) => l.user_id === user?.id);

  const togglePostLike = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Sign in to like"); return; }
      if (userPostLiked) {
        await supabase.from("blog_likes").delete().eq("post_id", post!.id).eq("user_id", user.id);
      } else {
        await supabase.from("blog_likes").insert({ post_id: post!.id, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog-likes", post?.id] }),
  });

  const toggleCommentLike = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) { toast.error("Sign in to like"); return; }
      const commentLikes = (comments.find((c: any) => c.id === commentId) as any)?.blog_comment_likes || [];
      const userLiked = commentLikes.some((l: any) => l.user_id === user.id);

      if (userLiked) {
        await (supabase as any).from("blog_comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id);
      } else {
        await (supabase as any).from("blog_comment_likes").insert({ comment_id: commentId, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog-comments", post?.id] }),
  });

  const handleAddComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string, parentId?: string }) => {
      if (!user) { toast.error("Sign in to comment"); return; }
      const { error } = await (supabase.from("blog_comments") as any).insert({
        post_id: post!.id,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      setReplyTo(null);
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", post?.id] });
      toast.success("Comment posted!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDeleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog-comments", post?.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <EyeOff size={32} />
          </div>
          <h2 className="text-xl font-heading">Post Not Found</h2>
          <p className="text-muted-foreground">This post may have been removed or unpublished.</p>
          <Link to="/blog">
            <Button variant="outline" className="mt-2">← Back to Blog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const parentComments = comments.filter((c: any) => !c.parent_id);

  return (
    <Layout>
      <SEO 
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160)}
        image={post.cover_image_url || undefined}
        type="article"
        url={`https://ucocsa.vercel.app/blog/${post.slug}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": [post.cover_image_url],
          "datePublished": post.published_at,
          "author": [{
            "@type": "Person",
            "name": post.profiles?.full_name || post.author_name,
            "url": `https://ucocsa.org/profile/${post.author_id}`
          }]
        }}
      />
      {/* Hero Header Selection */}
      <section className="relative w-full h-[60vh] md:h-[70vh] min-h-[400px] overflow-hidden">
        {post.cover_image_url ? (
          <img 
            src={post.cover_image_url} 
            alt={post.title} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <User size={120} className="text-primary/20" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container max-w-4xl pb-12 md:pb-20">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8 bg-background/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 text-white hover:bg-background/40 transition-all">
              <ArrowLeft size={16} /> Back to Blog
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary border-primary/30 backdrop-blur-md">
                {post.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading text-foreground leading-[1.1] tracking-tight mb-8 drop-shadow-sm">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8">
                <Link to={`/profile/${post.author_id}`} className="flex items-center gap-4 group">
                  <div className="relative">
                    <Avatar className="h-14 w-14 ring-4 ring-background shadow-xl transition-transform group-hover:scale-110">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                        {(post.profiles?.full_name || post.author_name || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary border-4 border-background rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {post.profiles?.full_name || post.author_name}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calendar size={14} />
                      {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : ""}
                    </span>
                  </div>
                </Link>

                <div className="hidden sm:block h-10 w-px bg-border/40 mx-2" />

                <div className="flex items-center gap-6 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-foreground">{postsLikes.length}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Applause</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-foreground">{comments.length}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Insights</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <article className="relative -mt-16 pb-24 z-10">
        <div className="container max-w-3xl bg-background rounded-t-[3rem] shadow-2xl p-8 md:p-16 border-x border-t border-border/40">
          {/* Content */}
          <div className="prose prose-zinc dark:prose-invert lg:prose-xl max-w-none text-foreground leading-[1.8] selection:bg-primary/20">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={{
                table: ({node, ...props}) => (
                  <div className="w-full overflow-x-auto pb-4 mb-8">
                    <table className="min-w-full m-0 border-collapse" {...props} />
                  </div>
                )
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Interaction Bar */}
          <div className="mt-16 flex items-center justify-between py-6 border-t border-b border-border">
            <div className="flex items-center gap-8">
              <button
                onClick={() => togglePostLike.mutate()}
                className={`flex items-center gap-2 group transition-all duration-300 ${
                  userPostLiked ? "text-red-500 scale-110" : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <div className={`p-2 rounded-full transition-colors ${userPostLiked ? "bg-red-500/10" : "group-hover:bg-red-500/10"}`}>
                  <Heart size={24} fill={userPostLiked ? "currentColor" : "none"} />
                </div>
                <span className="font-bold">{postsLikes.length}</span>
              </button>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="p-2 rounded-full bg-muted/50">
                  <MessageCircle size={24} />
                </div>
                <span className="font-bold">{comments.length}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: post.excerpt || post.title,
                    url: window.location.href,
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard");
                }
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-muted/50"
            >
              <Share2 size={20} />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          {/* Comments Section */}
          <section className="mt-16 bg-muted/30 rounded-3xl p-6 md:p-10 border border-border/50 shadow-inner">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-heading text-foreground">Community Reflections</h2>
              <Badge variant="secondary" className="px-3 py-1">{comments.length} Thoughts</Badge>
            </div>

            {user ? (
              <div className="mb-12 group focus-within:ring-2 ring-primary/20 rounded-2xl transition-all">
                <div className="bg-background rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {user.user_metadata?.full_name?.[0] || user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="min-h-[100px] border-none focus-visible:ring-0 text-base p-0 resize-none bg-transparent"
                      />
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground">Be respectful and kind.</p>
                        <Button
                          disabled={!comment.trim() || handleAddComment.isPending}
                          onClick={() => handleAddComment.mutate({ content: comment })}
                          className="px-6 rounded-full"
                        >
                          {handleAddComment.isPending ? "Posting..." : <><Send size={16} className="mr-2" /> Post</>}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-12 p-8 text-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/20">
                <p className="text-muted-foreground flex flex-col items-center gap-3">
                  <User size={32} className="opacity-20" />
                  <span>Join the conversation</span>
                  <Link to="/auth">
                    <Button variant="outline" className="rounded-full">Sign in to Comment</Button>
                  </Link>
                </p>
              </div>
            )}

            <div className="space-y-8">
              {parentComments.map((c: any) => {
                const replies = comments.filter((r: any) => r.parent_id === c.id);
                return (
                  <CommentItem 
                    key={c.id} 
                    comment={c} 
                    replies={replies} 
                    currentUser={user}
                    onDelete={(id) => handleDeleteComment.mutate(id)}
                    onLike={(id) => toggleCommentLike.mutate(id)}
                    onReply={(parentId, content) => handleAddComment.mutate({ content, parentId })}
                  />
                );
              })}
              {parentComments.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No reflections shared yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
};

interface CommentItemProps {
  comment: any;
  replies: any[];
  currentUser: any;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onReply: (parentId: string, content: string) => void;
}

const CommentItem = ({ comment, replies, currentUser, onDelete, onLike, onReply }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const userLiked = (comment.blog_comment_likes || []).some((l: any) => l.user_id === currentUser?.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
      <div className="flex gap-4">
        <Link to={`/profile/${comment.profiles?.id}`}>
          <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            <AvatarImage src={comment.profiles?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {(comment.profiles?.full_name || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border p-4 rounded-2xl group/card shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${comment.profiles?.id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                  {comment.profiles?.full_name || "Anonymous"}
                </Link>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 hover:bg-muted rounded-full transition-colors opacity-0 group-hover/card:opacity-100">
                  <MoreVertical size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-xs">Report</DropdownMenuItem>
                  {currentUser?.id === comment.user_id && (
                    <DropdownMenuItem 
                      className="text-xs text-destructive focus:text-destructive"
                      onClick={() => onDelete(comment.id)}
                    >
                      Delete Reflection
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          </div>

          <div className="mt-2 flex items-center gap-4 px-2">
            <button 
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1.5 text-[10px] font-bold transition-all ${
                userLiked ? "text-red-500 scale-105" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart size={14} fill={userLiked ? "currentColor" : "none"} />
              {(comment.blog_comment_likes || []).length > 0 && (comment.blog_comment_likes || []).length}
              {userLiked ? "Liked" : "Like"}
            </button>
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply size={14} />
              Reply
            </button>
          </div>

          <AnimatePresence>
            {isReplying && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 ml-2 pl-4 border-l-2 border-primary/20 overflow-hidden"
              >
                <div className="bg-background rounded-xl border border-border p-3">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.profiles?.full_name || 'Anonymous'}...`}
                    className="min-h-[60px] border-none focus-visible:ring-0 text-sm p-0 resize-none bg-transparent"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 pt-2 mt-2 border-t border-border/40">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold" onClick={() => setIsReplying(false)}>Cancel</Button>
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] uppercase font-bold"
                      disabled={!replyContent.trim()}
                      onClick={() => {
                        onReply(comment.id, replyContent);
                        setIsReplying(false);
                        setReplyContent("");
                      }}
                    >
                      Post Reply
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render Replies */}
          {replies.length > 0 && (
            <div className="mt-4 ml-6 space-y-4 border-l border-border/60 pl-6">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3 group/reply">
                  <Link to={`/profile/${reply.profiles?.id}`}>
                    <Avatar className="h-7 w-7 ring-1 ring-transparent group-hover/reply:ring-primary/20 transition-all">
                      <AvatarImage src={reply.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
                        {(reply.profiles?.full_name || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="bg-background border border-border/80 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/profile/${reply.profiles?.id}`} className="text-xs font-bold text-foreground hover:text-primary transition-colors">
                            {reply.profiles?.full_name || "Anonymous"}
                          </Link>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {currentUser?.id === reply.user_id && (
                          <button onClick={() => onDelete(reply.id)} className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover/reply:opacity-100 transition-opacity">
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BlogPost;

