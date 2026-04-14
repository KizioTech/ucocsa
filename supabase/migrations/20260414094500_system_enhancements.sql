-- Fix blog_comments user_id relationship
ALTER TABLE public.blog_comments 
ADD CONSTRAINT blog_comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Add whatsapp_number to team_members
ALTER TABLE public.team_members 
ADD COLUMN whatsapp_number TEXT;

-- Fix prayer_comments user_id relationship
ALTER TABLE public.prayer_comments 
ADD CONSTRAINT prayer_comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Fix praise_comments user_id relationship
ALTER TABLE public.praise_comments 
ADD CONSTRAINT praise_comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;
