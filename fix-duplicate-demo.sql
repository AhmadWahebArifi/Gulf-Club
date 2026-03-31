-- Fix the duplicate key issue for demo@test.com
-- Run this in Supabase SQL Editor

-- 1. First, check if the user actually exists in the database
SELECT id, email, email_confirmed_at, created_at, updated_at
FROM auth.users 
WHERE email = 'demo@test.com';

-- 2. If the user exists, delete it properly
DELETE FROM auth.users 
WHERE email = 'demo@test.com';

-- 3. Check if there are any orphaned sessions or tokens
DELETE FROM auth.sessions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'demo@test.com'
);

-- 4. Now create the demo user with minimal required fields
INSERT INTO auth.users (
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@test.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
);

-- 5. Verify the user was created successfully
SELECT id, email, email_confirmed_at, created_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as status
FROM auth.users 
WHERE email = 'demo@test.com';

-- 6. Test the password hash
SELECT email,
       CASE 
         WHEN encrypted_password = crypt('123456', encrypted_password) THEN 'Password matches ✅'
         ELSE 'Password mismatch ❌'
       END as password_check
FROM auth.users 
WHERE email = 'demo@test.com';
