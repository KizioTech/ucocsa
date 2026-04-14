-- Add author_id to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN author_id UUID REFERENCES public.profiles(id);

-- Add parent_id to blog_comments for threaded replies
ALTER TABLE public.blog_comments ADD COLUMN parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE;

-- Create blog_comment_likes table
CREATE TABLE public.blog_comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS for comment likes
ALTER TABLE public.blog_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comment likes" ON public.blog_comment_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth users can like comments" ON public.blog_comment_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unlike comments" ON public.blog_comment_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Update profiles RLS to allow public viewing of avatars and names
-- (Assuming public.profiles already exists and has RLS enabled)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);

-- Ensure cover_image_url is in blog_posts (it should be, based on previous check)
-- DO NOTHING if already exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='cover_image_url') THEN
    ALTER TABLE public.blog_posts ADD COLUMN cover_image_url TEXT;
  END IF;
END $$;
