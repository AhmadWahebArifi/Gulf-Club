-- Fix email confirmation issue in Supabase
-- Run this in Supabase SQL Editor to disable email confirmation

-- Option 1: Disable email confirmation for all users (for development/demo)
UPDATE auth.config 
SET mailer_auto_confirm = true 
WHERE id = (SELECT id FROM auth.config LIMIT 1);

-- Option 2: Or create a bypass for specific email domains
-- This allows users with certain domains to auto-confirm

-- Check current email confirmation setting
SELECT mailer_auto_confirm FROM auth.config;

-- If you want to re-enable email confirmation later:
-- UPDATE auth.config SET mailer_auto_confirm = false WHERE id = (SELECT id FROM auth.config LIMIT 1);
