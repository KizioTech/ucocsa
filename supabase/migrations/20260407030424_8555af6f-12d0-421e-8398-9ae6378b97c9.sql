
-- Blog post likes
CREATE TABLE public.blog_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.blog_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth users can like" ON public.blog_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unlike own" ON public.blog_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Blog post comments
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.blog_comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth users can comment" ON public.blog_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON public.blog_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Prayer request comments (conversations)
CREATE TABLE public.prayer_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id uuid NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prayer comments" ON public.prayer_comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth users can add prayer comments" ON public.prayer_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own prayer comments" ON public.prayer_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Praise report comments
CREATE TABLE public.praise_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  praise_id uuid NOT NULL REFERENCES public.praise_reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.praise_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view praise comments" ON public.praise_comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth users can add praise comments" ON public.praise_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own praise comments" ON public.praise_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Avatar storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Auth users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
