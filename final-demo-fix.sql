-- Final fix for demo user password issue
-- Run this in Supabase SQL Editor

-- 1. Delete the demo user completely
DELETE FROM auth.users WHERE email = 'demo@test.com';

-- 2. Also clean up any related sessions or tokens
DELETE FROM auth.sessions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'demo@test.com'
);

-- 3. Create a fresh demo user with a simple, known working password
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
  is_super_admin
) VALUES (
  (SELECT id FROM auth.instances LIMIT 1),
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@test.com',
  crypt('demo123', gen_salt('bf')),  -- Using 'demo123' instead of '123456'
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
);

-- 4. Verify the user was created and password works
SELECT email, 
       email_confirmed_at,
       created_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as status,
       CASE 
         WHEN encrypted_password = crypt('demo123', encrypted_password) THEN 'Password OK ✅'
         ELSE 'Password Failed ❌'
       END as password_check
FROM auth.users 
WHERE email = 'demo@test.com';
