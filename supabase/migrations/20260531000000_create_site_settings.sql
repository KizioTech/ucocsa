-- Create site_settings table
CREATE TABLE public.site_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_open       BOOLEAN NOT NULL DEFAULT true,
  opens_at      DATE,
  closure_msg   TEXT,
  timezone      TEXT NOT NULL DEFAULT 'Africa/Blantyre',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow write/update/delete access only to admins
CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings" ON public.site_settings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default row
INSERT INTO public.site_settings (is_open, timezone)
VALUES (true, 'Africa/Blantyre');
