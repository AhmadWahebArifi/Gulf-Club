-- Ultimate demo user fix - try multiple approaches
-- Run this in Supabase SQL Editor

-- Approach 1: Check what instance_id actually exists
SELECT id, created_at FROM auth.instances LIMIT 5;

-- Approach 2: Try without specifying instance_id (let Supabase handle it)
DELETE FROM auth.users WHERE email = 'demo@test.com';

INSERT INTO auth.users (
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
  'authenticated',
  'authenticated',
  'demo@test.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
);

-- Approach 3: If that doesn't work, try the original method with explicit instance_id
-- DELETE FROM auth.users WHERE email = 'demo@test.com';
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   last_sign_in_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   is_super_admin
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'demo@test.com',
--   crypt('demo123', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   now(),
--   '{"provider":"email","providers":["email"]}',
--   '{}',
--   false
-- );

-- Verify the user
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
