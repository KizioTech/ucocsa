-- Publish all existing albums that were inserted without explicitly setting is_published
UPDATE public.gallery_albums SET is_published = true WHERE is_published = false;

-- Approve all existing photos that were inserted without explicitly setting is_approved
UPDATE public.gallery_photos SET is_approved = true WHERE is_approved = false;

-- Fix gallery_albums admin policies
DROP POLICY IF EXISTS "Admins can view all albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Admins can manage albums" ON public.gallery_albums;

CREATE POLICY "Admins can view all albums"
  ON public.gallery_albums FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage albums"
  ON public.gallery_albums FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix gallery_photos admin policies
DROP POLICY IF EXISTS "Admins can view all photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins can manage all photos" ON public.gallery_photos;

CREATE POLICY "Admins can view all photos"
  ON public.gallery_photos FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all photos"
  ON public.gallery_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
