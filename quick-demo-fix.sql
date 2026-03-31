-- Quick Fix for Demo User Login
-- Run this in Supabase SQL Editor

-- 1. First, let's see what's happening with the demo user
SELECT email, 
       created_at,
       email_confirmed_at,
       last_sign_in_at
FROM auth.users 
WHERE email = 'demo@test.com';

-- 2. Delete and recreate demo user with a simpler approach
DELETE FROM auth.users WHERE email = 'demo@test.com';

-- 3. Create demo user with a known working password hash
-- This uses a simpler method that's more reliable
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
  (SELECT id FROM auth.instances LIMIT 1),
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

-- 4. Verify the user was created
SELECT email, 
       email_confirmed_at,
       created_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as status
FROM auth.users 
WHERE email = 'demo@test.com';

-- 5. Test the password hash
SELECT email,
       CASE 
         WHEN encrypted_password = crypt('123456', encrypted_password) THEN 'Password matches ✅'
         ELSE 'Password mismatch ❌'
       END as password_check
FROM auth.users 
WHERE email = 'demo@test.com';

-- 6. Alternative: If the above doesn't work, try this simpler method
-- Delete the user again and create with a different approach
-- DELETE FROM auth.users WHERE email = 'demo@test.com';

-- Then use the Supabase Dashboard to create the user manually:
-- Go to Authentication → Users → Add user
-- Email: demo@test.com
-- Password: 123456
-- Toggle "Auto-confirm user"
