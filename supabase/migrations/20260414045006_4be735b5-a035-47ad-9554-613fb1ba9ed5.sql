
-- Create the function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create service_programs table
CREATE TABLE public.service_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL DEFAULT 'sunday' CHECK (service_type IN ('midweek', 'sunday')),
  service_date DATE NOT NULL,
  title TEXT,
  theme TEXT,
  leading_verses TEXT,
  facilitator TEXT,
  first_prayer TEXT,
  convener TEXT,
  teaching TEXT,
  preaching TEXT,
  alter_call TEXT,
  holy_communion TEXT,
  bearers TEXT[] DEFAULT '{}',
  last_prayer TEXT,
  announcements TEXT,
  is_modified BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (service_type, service_date)
);

ALTER TABLE public.service_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published programs"
ON public.service_programs FOR SELECT TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Admins can view all programs"
ON public.service_programs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert programs"
ON public.service_programs FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update programs"
ON public.service_programs FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete programs"
ON public.service_programs FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_service_programs_updated_at
BEFORE UPDATE ON public.service_programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
