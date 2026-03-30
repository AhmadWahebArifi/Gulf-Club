# Database Setup for Winner Verification

## Required Setup Steps

### 1. Create Supabase Storage Bucket

Run this SQL in your Supabase SQL editor:

```sql
-- Create storage bucket for verification files
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Create policy for admins to manage all files
CREATE POLICY "Admins can manage all verification files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'verifications' AND
    auth.jwt() ->> 'email' = 'admin@golfclub.com'
  );

-- Create policy for users to upload their own files
CREATE POLICY "Users can upload own verification files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verifications' AND
    auth.jwt() ->> 'email' = 'owner'
  );

-- Create policy for users to view their own files
CREATE POLICY "Users can view own verification files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verifications' AND
    auth.jwt() ->> 'email' = 'owner'
  );
```

### 2. Create Database Table

Run the `setup-verifications.sql` file in your Supabase SQL editor.

### 3. Update Admin Email

Change the hardcoded admin email in:
- `app/admin/page.tsx` (line 6)
- `app/dashboard/page.tsx` (line 63)

## Features

- **File Upload**: Winners can upload verification documents (images, PDFs, docs)
- **Admin Review**: Admins can approve/reject submissions with one click
- **Status Tracking**: Visual status indicators (pending/approved/rejected)
- **Secure Storage**: Files stored in Supabase Storage with proper access policies
- **Audit Trail**: Timestamps for submission and review actions

## Usage

1. Winner uploads verification file via admin panel (for demo)
2. Admin reviews file in the verification table
3. Admin clicks "Approve" or "Reject"
4. Status updates automatically with timestamp

## File Types Supported

- Images: jpg, jpeg, png, gif, webp
- Documents: pdf, doc, docx
