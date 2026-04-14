CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members" ON public.team_members
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed data
INSERT INTO public.team_members (name, role, bio, order_index) VALUES
('Grace Banda', 'Chairperson', 'Final year Theology student passionate about campus ministry.', 1),
('Samuel Chirwa', 'Vice Chairperson', 'Third year Law student and worship leader.', 2),
('Faith Kamanga', 'Secretary General', 'Second year Education student coordinating all UCOCSA operations.', 3),
('James Phiri', 'Treasurer', 'Third year Commerce student managing UCOCSA finances.', 4),
('Mercy Gondwe', 'Prayer Secretary', 'Second year Nursing student leading the prayer ministry.', 5),
('Daniel Mwale', 'Organizing Secretary', 'Final year Engineering student planning events and logistics.', 6);
