
-- Profiles table for storing user display info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Members table (public registration, no auth required)
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  faculty TEXT NOT NULL,
  year_of_study INTEGER NOT NULL DEFAULT 1,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Anyone can register (insert), only authenticated users can read
CREATE POLICY "Anyone can register" ON public.members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view members" ON public.members FOR SELECT TO authenticated USING (true);

-- Prayer requests table (public submission, no auth required)
CREATE TABLE public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  category TEXT NOT NULL DEFAULT 'Personal',
  request TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_private BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  prayed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit prayer requests
CREATE POLICY "Anyone can submit prayer requests" ON public.prayer_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Public (non-private) requests visible to all, private ones only to authenticated
CREATE POLICY "Public requests visible to all" ON public.prayer_requests FOR SELECT TO anon, authenticated USING (is_private = false AND status = 'approved');
CREATE POLICY "Authenticated can view all requests" ON public.prayer_requests FOR SELECT TO authenticated USING (true);
-- Only authenticated can update (for prayed_count, status)
CREATE POLICY "Authenticated can update requests" ON public.prayer_requests FOR UPDATE TO authenticated USING (true);

-- Praise reports table
CREATE TABLE public.praise_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Thanksgiving',
  prayed_count INTEGER NOT NULL DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.praise_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved praise reports" ON public.praise_reports FOR SELECT TO anon, authenticated USING (is_approved = true);
CREATE POLICY "Authenticated can insert praise reports" ON public.praise_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update praise reports" ON public.praise_reports FOR UPDATE TO authenticated USING (true);
