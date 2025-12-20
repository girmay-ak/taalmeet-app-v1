# Manual Migration Instructions for Verification Tables

Since Supabase CLI is not installed, follow these steps to apply the verification migration manually:

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New query**

## Step 2: Run the Migration SQL

Copy and paste the entire SQL script from:
`supabase/migrations/20231220000000_add_verification_tables.sql`

Or copy this cleaned version below:

## Step 3: Create Storage Bucket

After running the SQL migration, create a storage bucket:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name it: `verification-documents`
4. Set to **Private** (not public)
5. Click **Create bucket**

## Step 4: Set Storage Policies

In the SQL Editor, run these policies for the storage bucket:

```sql
-- Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own documents
CREATE POLICY "Users can read own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 5: Verify Migration

Run this query to verify the tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'verification_sessions',
  'id_documents', 
  'face_recognition',
  'verification_attempts'
);
```

You should see all 4 tables listed.

## Step 6: Check Users Table

Verify the new columns were added to users:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
  'id_verified',
  'id_verified_at',
  'face_recognition_enabled',
  'verification_level'
);
```

## Done!

Once these steps are complete, the verification feature will be fully functional in your app.

## Troubleshooting

If you get errors:
- Make sure the `users` table exists
- Make sure you have proper permissions (you should be the project owner)
- Run each CREATE TABLE statement separately if needed
- Check for existing tables that might conflict

## Optional: Add Admin Role Support

If you want to add admin moderation later, you'll need to add a role column to users:

```sql
-- Add role column to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'moderator'));

-- Then uncomment the admin policies in the migration file
```

