-- ── HYMNS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hymns (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  verses TEXT[] NOT NULL DEFAULT '{}',
  youtube_id TEXT,
  first_line TEXT,
  bio TEXT,
  submitted_by UUID,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hymns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved hymns" ON public.hymns;
CREATE POLICY "Public can view approved hymns"
  ON public.hymns FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

DROP POLICY IF EXISTS "Admins manage hymns" ON public.hymns;
CREATE POLICY "Admins manage hymns"
  ON public.hymns FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Members can submit hymns" ON public.hymns;
CREATE POLICY "Members can submit hymns"
  ON public.hymns FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid() AND is_approved = false);

DROP POLICY IF EXISTS "Members view own submissions" ON public.hymns;
CREATE POLICY "Members view own submissions"
  ON public.hymns FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

DROP POLICY IF EXISTS "Members delete own pending" ON public.hymns;
CREATE POLICY "Members delete own pending"
  ON public.hymns FOR DELETE
  TO authenticated
  USING (submitted_by = auth.uid() AND is_approved = false);

CREATE TRIGGER update_hymns_updated_at
BEFORE UPDATE ON public.hymns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ── HYMN BACKGROUNDS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hymn_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hymn_backgrounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view backgrounds" ON public.hymn_backgrounds;
CREATE POLICY "Anyone can view backgrounds"
  ON public.hymn_backgrounds FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins manage backgrounds" ON public.hymn_backgrounds;
CREATE POLICY "Admins manage backgrounds"
  ON public.hymn_backgrounds FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));