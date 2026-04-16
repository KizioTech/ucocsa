-- Migration: Hymn background images table
-- Stores the paths to background images used on the Hymns welcome screen.
-- Images are served from /public/backgrounds/ and referenced by URL path.

CREATE TABLE IF NOT EXISTS public.hymn_backgrounds (
  id          SERIAL       PRIMARY KEY,
  url         TEXT         NOT NULL,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE public.hymn_backgrounds ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'hymn_backgrounds'
      AND policyname = 'Anyone can view hymn backgrounds'
  ) THEN
    CREATE POLICY "Anyone can view hymn backgrounds"
      ON public.hymn_backgrounds
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'hymn_backgrounds'
      AND policyname = 'Admins can manage hymn backgrounds'
  ) THEN
    CREATE POLICY "Admins can manage hymn backgrounds"
      ON public.hymn_backgrounds
      FOR ALL
      TO authenticated
      USING     (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;

-- Seed: 18 background images (served from /public/backgrounds/)
INSERT INTO public.hymn_backgrounds (url, sort_order) VALUES
  ('/backgrounds/img1.jpg',  1),
  ('/backgrounds/img2.jpg',  2),
  ('/backgrounds/img3.jpg',  3),
  ('/backgrounds/img4.jpg',  4),
  ('/backgrounds/img5.jpg',  5),
  ('/backgrounds/img6.jpg',  6),
  ('/backgrounds/img7.jpg',  7),
  ('/backgrounds/img8.jpg',  8),
  ('/backgrounds/img9.jpg',  9),
  ('/backgrounds/img10.jpg', 10),
  ('/backgrounds/img11.jpg', 11),
  ('/backgrounds/img12.jpg', 12),
  ('/backgrounds/img13.jpg', 13),
  ('/backgrounds/img14.jpg', 14),
  ('/backgrounds/img15.jpg', 15),
  ('/backgrounds/img16.jpg', 16),
  ('/backgrounds/img17.jpg', 17),
  ('/backgrounds/img18.jpg', 18)
ON CONFLICT DO NOTHING;
