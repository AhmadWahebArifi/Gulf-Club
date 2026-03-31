# Fix Email Confirmation - Correct Methods

## Method 1: Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Find **"Enable email confirmations"** toggle
3. **Turn OFF** the toggle
4. Click **Save**

## Method 2: SQL Alternative (If dashboard doesn't work)

-- Check if the setting exists in a different table
SELECT * FROM auth.settings WHERE key LIKE '%email%';

-- Or try this approach for newer Supabase versions
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'your-test-email@example.com';

## Method 3: Create Auto-Confirmed Users Directly

-- Create users that are already confirmed
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
  '00000000-0000-0000-0000-000000000000', -- Replace with your instance_id
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'your-email@example.com',
  crypt('your-password', gen_salt('bf')),
  now(), -- This confirms the email immediately
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
);

## Method 4: Update Existing Users to Be Confirmed

-- Confirm all existing users
UPDATE auth.users 
SET email_confirmed_at = created_at 
WHERE email_confirmed_at IS NULL;

-- Or confirm specific user
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'specific-user@example.com';

## Quick Test

-- Check if users are confirmed
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
