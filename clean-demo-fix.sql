-- Clean SQL for Demo User Fix (Copy only the SQL statements below)

SELECT email, 
       created_at,
       email_confirmed_at,
       last_sign_in_at
FROM auth.users 
WHERE email = 'demo@test.com';

DELETE FROM auth.users WHERE email = 'demo@test.com';

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

SELECT email, 
       email_confirmed_at,
       created_at,
       CASE 
         WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed ✅'
         ELSE 'Not Confirmed ❌'
       END as status
FROM auth.users 
WHERE email = 'demo@test.com';
