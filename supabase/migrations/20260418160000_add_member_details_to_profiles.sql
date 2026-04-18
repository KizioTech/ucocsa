-- Add member-specific fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faculty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year_of_study INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update existing profiles with emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Migrate data from members table to profiles if emails match
UPDATE public.profiles p
SET 
  faculty = m.faculty,
  year_of_study = m.year_of_study,
  interests = m.interests,
  phone = m.phone
FROM public.members m
WHERE p.email = m.email;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;
