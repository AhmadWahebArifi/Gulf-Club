-- Fix scores table structure to include 'points' column
-- Run this in Supabase SQL Editor

-- Check current scores table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'scores' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing 'points' column if it doesn't exist
ALTER TABLE public.scores 
ADD COLUMN IF NOT EXISTS points integer;

-- If the table doesn't exist at all, create it
CREATE TABLE IF NOT EXISTS public.scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  points integer,
  score integer,
  value integer,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scores
DROP POLICY IF EXISTS "scores_read" ON public.scores;
CREATE POLICY "scores_read" ON public.scores
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_insert" ON public.scores;
CREATE POLICY "scores_insert" ON public.scores
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_update" ON public.scores;
CREATE POLICY "scores_update" ON public.scores
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'scores' 
AND table_schema = 'public'
ORDER BY ordinal_position;
