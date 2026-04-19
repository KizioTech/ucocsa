-- RPC for searching user profiles securely
CREATE OR REPLACE FUNCTION public.search_users(search_term TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.full_name ILIKE '%' || search_term || '%'
    AND p.id != auth.uid()
  LIMIT 20;
END;
$$;

-- Page Views for analytics
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views" 
  ON public.page_views FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Admins can view page views" 
  ON public.page_views FOR SELECT 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::app_role));
