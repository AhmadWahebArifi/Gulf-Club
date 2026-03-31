-- Create charities table with sample data
-- Run this in Supabase SQL Editor

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.charities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "charities_read" ON public.charities;
CREATE POLICY "charities_read" ON public.charities
FOR SELECT TO authenticated
USING (true);

-- Insert sample charities
INSERT INTO public.charities (name, description) VALUES
('Red Cross', 'Providing emergency assistance and disaster relief worldwide.'),
('UNICEF', 'Supporting children''s health, education, and rights globally.'),
('World Wildlife Fund', 'Conserving nature and reducing the most pressing threats to diversity.'),
('Local Food Bank', 'Fighting hunger in our local community through food distribution programs.'),
('Habitat for Humanity', 'Building affordable housing for families in need.')
ON CONFLICT DO NOTHING;

-- Verify data
SELECT * FROM public.charities ORDER BY name;
