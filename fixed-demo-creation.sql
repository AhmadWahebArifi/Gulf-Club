-- Fixed demo user creation with all required fields
-- Run this in Supabase SQL Editor

DELETE FROM auth.users WHERE email = 'demo@test.com';

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
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
);

-- Verify the user was created
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
