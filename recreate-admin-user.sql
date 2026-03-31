-- Delete and recreate admin@golfclub.com user with new password
-- Run this in Supabase SQL Editor

-- 1. Delete the existing admin user (if exists)
DELETE FROM auth.users WHERE email = 'admin@golfclub.com';

-- 2. Clean up any related sessions or tokens
DELETE FROM auth.sessions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@golfclub.com'
);
DELETE FROM auth.refresh_tokens WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@golfclub.com'
);

-- 3. Create fresh admin user with password 'admin123'
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
  'admin@golfclub.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
);

-- 4. Verify the user was created successfully
SELECT email, 
       email_confirmed_at,
       created_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as status,
       CASE 
         WHEN encrypted_password = crypt('admin123', encrypted_password) THEN 'Password OK ✅'
         ELSE 'Password Failed ❌'
       END as password_check
FROM auth.users 
WHERE email = 'admin@golfclub.com';
