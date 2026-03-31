-- Test and fix the demo user password issue
-- Run this in Supabase SQL Editor

-- 1. Check the current user and test password
SELECT email, 
       encrypted_password,
       CASE 
         WHEN encrypted_password = crypt('123456', encrypted_password) THEN 'Password matches ✅'
         ELSE 'Password mismatch ❌'
       END as password_test
FROM auth.users 
WHERE email = 'demo@test.com';

-- 2. If password doesn't match, update it with a fresh hash
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf')),
    updated_at = now()
WHERE email = 'demo@test.com';

-- 3. Test the new password
SELECT email,
       CASE 
         WHEN encrypted_password = crypt('123456', encrypted_password) THEN 'New password works ✅'
         ELSE 'New password failed ❌'
       END as password_test
FROM auth.users 
WHERE email = 'demo@test.com';

-- 4. Also make sure the user is confirmed
UPDATE auth.users 
SET email_confirmed_at = CASE 
  WHEN email_confirmed_at IS NULL THEN now()
  ELSE email_confirmed_at
END,
updated_at = now()
WHERE email = 'demo@test.com';

-- 5. Final verification
SELECT email, 
       email_confirmed_at,
       created_at,
       updated_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as confirmation_status,
       CASE 
         WHEN encrypted_password = crypt('123456', encrypted_password) THEN 'Password OK ✅'
         ELSE 'Password Failed ❌'
       END as password_status
FROM auth.users 
WHERE email = 'demo@test.com';
