-- Troubleshoot Demo User Login Issues
-- Run this in Supabase SQL Editor

-- 1. Check if demo user exists
SELECT email, 
       email_confirmed_at,
       created_at,
       updated_at,
       last_sign_in_at,
       raw_app_meta_data
FROM auth.users 
WHERE email = 'demo@test.com';

-- 2. Check all users to see what exists
SELECT email, 
       email_confirmed_at,
       created_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as status
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Create/Update demo user if needed
-- First, delete existing demo user (if exists)
DELETE FROM auth.users WHERE email = 'demo@test.com';

-- Then create confirmed demo user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
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
  '00000000-0000-0000-0000-000000000000', -- Replace with your actual instance_id
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@test.com',
  crypt('123456', gen_salt('bf')),
  now(), -- Confirmed immediately
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

-- 4. Verify demo user was created
SELECT email, 
       email_confirmed_at,
       created_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as status
FROM auth.users 
WHERE email = 'demo@test.com';

-- 5. Test password verification
SELECT email,
       CASE 
         WHEN encrypted_password = crypt('123456', encrypted_password) THEN 'Password matches ✅'
         ELSE 'Password mismatch ❌'
       END as password_check
FROM auth.users 
WHERE email = 'demo@test.com';

-- 6. Check if required tables exist for the demo user
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('scores', 'charities', 'user_charity', 'subscriptions', 'draw_events', 'draw_winners')
ORDER BY table_name;
