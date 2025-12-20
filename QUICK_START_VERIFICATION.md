# Quick Start Guide - ID Verification

## ✅ What's Already Done

1. ✅ Dependencies installed (`expo-camera`, `expo-image-picker`, etc.)
2. ✅ Migration file created (needs to be run)
3. ✅ All screens implemented
4. ✅ Services and hooks created
5. ✅ TypeScript types defined

## 🚀 Next Steps (Do These Now)

### 1. Run the Database Migration

**Option A: Via Supabase Dashboard (Recommended)**

1. Open https://supabase.com/dashboard
2. Select your TAALMEET project
3. Go to **SQL Editor**
4. Click **New query**
5. Copy the contents of `supabase/migrations/20231220000000_add_verification_tables.sql`
6. Paste and click **Run**

**Option B: Install Supabase CLI** (if you prefer)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### 2. Create Storage Bucket

In Supabase Dashboard:

1. Go to **Storage**
2. Click **New bucket**
3. Name: `verification-documents`
4. Privacy: **Private**
5. Click **Create**

Then run these policies in SQL Editor:

```sql
-- Allow users to upload their own documents
CREATE POLICY "Users can upload own verification documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own documents
CREATE POLICY "Users can read own verification documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Update iOS Permissions (if testing on iOS)

Edit `ios/TAALMEET/Info.plist` and add:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to verify your identity</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo access to upload ID documents</string>
```

### 4. Update Android Permissions (if testing on Android)

Edit `android/app/src/main/AndroidManifest.xml` and add:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### 5. Restart the App

```bash
# Stop the current Metro bundler (Ctrl+C)
# Then restart
npm start

# Or if using iOS
npm run ios

# Or if using Android
npm run android
```

## 🎯 How to Test

### Test the Complete Flow:

1. **Navigate to Verification**
   ```tsx
   // Add this to your profile or settings screen
   router.push('/verification');
   ```

2. **Complete Each Step:**
   - Upload ID card photo (or take with camera)
   - Take selfie while holding ID
   - Scan face (or skip)
   - See success screen

3. **Check Verification Status:**
   ```tsx
   import { useVerificationStatus } from '@/hooks';
   
   const { data: status } = useVerificationStatus();
   console.log(status); // Should show verified status
   ```

### Quick Test Without Full Flow:

You can manually set verification status for testing:

```sql
-- In Supabase SQL Editor
UPDATE users 
SET 
  id_verified = true,
  verification_level = 'enhanced'
WHERE id = 'your-user-id';
```

## 🎨 Add Verification to Profile

In your profile screen, add:

```tsx
import { VerificationBadge } from '@/components';

// In your component
<VerificationBadge 
  size="medium" 
  showLabel={true} 
  interactive={true}
/>
```

This will show a clickable badge that opens the verification flow.

## 📱 Expected User Experience

1. User clicks "Verify Identity" badge
2. Sees overview of 3 steps
3. Takes/uploads ID card photo
4. Takes selfie with ID
5. Optionally enrolls face recognition
6. Sees success screen
7. Returns to home with verified badge

## ❌ Common Issues & Fixes

### Issue: "expo-camera not found"
**Fix:** Already fixed! Dependencies are installed.

### Issue: "users.role does not exist"
**Fix:** Already fixed! Admin policies are commented out in migration.

### Issue: "storage bucket not found"
**Fix:** Make sure you created the `verification-documents` bucket (Step 2 above).

### Issue: Camera not working
**Fix:** 
- On iOS: Add permissions to Info.plist (Step 3)
- On Android: Add permissions to AndroidManifest.xml (Step 4)
- Test on a real device (simulators have limited camera support)

### Issue: "Failed to upload image"
**Fix:** Make sure storage bucket and policies are set correctly.

## 📚 Documentation

- **Full Setup:** See `VERIFICATION_SETUP.md`
- **Implementation Details:** See `VERIFICATION_IMPLEMENTATION_SUMMARY.md`
- **Manual Migration:** See `supabase/MANUAL_MIGRATION_INSTRUCTIONS.md`

## 🎉 You're Ready!

Once you complete steps 1-2 above (database migration and storage bucket), the verification system will be fully functional. The app is ready to run!

---

**Need Help?** Check the documentation files or review the implementation code.

