-- Create storage bucket for team members
INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-members', 'team-members', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for the team-members bucket
CREATE POLICY "Anyone can view team member images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-members');

CREATE POLICY "Admins can upload team member images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'team-members' 
    AND (SELECT public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can update team member images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'team-members' 
    AND (SELECT public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can delete team member images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'team-members' 
    AND (SELECT public.has_role(auth.uid(), 'admin'))
  );
