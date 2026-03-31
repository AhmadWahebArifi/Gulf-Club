-- Create user_charity table for charity preferences
-- Run this in Supabase SQL Editor

-- Create user_charity table
CREATE TABLE IF NOT EXISTS public.user_charity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id uuid NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  percentage integer NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id) -- One charity preference per user
);

-- Enable RLS
ALTER TABLE public.user_charity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "user_charity_read" ON public.user_charity;
CREATE POLICY "user_charity_read" ON public.user_charity
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_charity_insert" ON public.user_charity;
CREATE POLICY "user_charity_insert" ON public.user_charity
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_charity_update" ON public.user_charity;
CREATE POLICY "user_charity_update" ON public.user_charity
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_charity_delete" ON public.user_charity;
CREATE POLICY "user_charity_delete" ON public.user_charity
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_charity' 
AND table_schema = 'public'
ORDER BY ordinal_position;
