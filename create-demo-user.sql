-- Create demo user for reviewers
-- This creates a user with email demo@test.com and password 123456
-- Run this in Supabase SQL Editor

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  phone,
  phone_confirmed_at,
  phone_change,
  email_change,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with your actual instance_id from auth.instances table
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@test.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  null,
  null,
  null,
  null,
  null
);

-- Alternative approach: Use Supabase Dashboard to create the user
-- Go to Authentication > Users > Add user
-- Email: demo@test.com
-- Password: 123456
-- Toggle "Auto-confirm user" to skip email verification
