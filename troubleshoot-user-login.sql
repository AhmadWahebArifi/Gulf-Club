-- Troubleshoot Login Issues for Specific User
-- Run this in Supabase SQL Editor

-- 1. Check if user exists and their confirmation status
SELECT email, 
       email_confirmed_at,
       created_at,
       updated_at,
       last_sign_in_at,
       raw_app_meta_data
FROM auth.users 
WHERE email = 'ahmadarifi9wb@gmail.com';

-- 2. Check if there are any authentication issues
SELECT * 
FROM auth.audit_log_entries 
WHERE actor_email = 'ahmadarifi9wb@gmail.com' 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Reset the user's password (fix method)
-- This will allow you to set a new password
UPDATE auth.users 
SET encrypted_password = crypt('newpassword123', gen_salt('bf'))
WHERE email = 'ahmadarifi9wb@gmail.com';

-- 4. Alternative: Create a fresh confirmed user
-- Delete the old user first (if needed)
DELETE FROM auth.users WHERE email = 'ahmadarifi9wb@gmail.com';

-- Then create new confirmed user
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
  'ahmadarifi9wb@gmail.com',
  crypt('password123', gen_salt('bf')),
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

-- 5. Verify the user was created correctly
SELECT email, 
       email_confirmed_at,
       created_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as status
FROM auth.users 
WHERE email = 'ahmadarifi9wb@gmail.com';

-- 6. Test password verification (for debugging)
-- This checks if the password hash matches
SELECT email,
       CASE 
         WHEN encrypted_password = crypt('password123', encrypted_password) THEN 'Password matches ✅'
         ELSE 'Password mismatch ❌'
       END as password_check
FROM auth.users 
WHERE email = 'ahmadarifi9wb@gmail.com';
