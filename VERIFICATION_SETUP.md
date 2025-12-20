# ID Verification & Face Recognition Setup Guide

## Overview

The TAALMEET app includes a comprehensive verification system that supports:
- **ID Document Verification** (Passport, Driver's License, National ID, Residence Permit)
- **Selfie with ID** verification
- **Face Recognition** enrollment for enhanced security

This guide will help you set up and configure the verification system.

---

## 1. Database Setup

### Run Migration

```bash
# Apply the verification migration
cd supabase
supabase migration up
```

The migration creates the following tables:
- `verification_sessions` - Tracks verification attempts
- `id_documents` - Stores ID document information
- `face_recognition` - Stores face biometric data
- `verification_attempts` - Logs all verification attempts

### Create Storage Bucket

You need to create a Supabase storage bucket for verification documents:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `verification-documents`
3. Set it to **Private** (not public)
4. Set the following policies:

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

-- Allow admins to read all verification documents
CREATE POLICY "Admins can read all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

---

## 2. Required Permissions

The app requires the following permissions for verification:

### iOS - `ios/TAALMEET/Info.plist`

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture your ID card and take verification selfies</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to upload ID documents</string>
```

### Android - `android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

---

## 3. Install Dependencies

Make sure you have the required packages:

```bash
npm install expo-camera expo-image-picker expo-file-system base64-arraybuffer
```

---

## 4. Verification Flow

The verification process follows these steps:

### Step 1: Photo ID Card
- User scans or uploads their government-issued ID
- Supports front and back images
- Creates an `id_documents` record

**Screen:** `/app/verification/photo-id-card.tsx`

### Step 2: Selfie with ID
- User takes a selfie while holding their ID
- Validates that the person matches the ID
- Updates the `id_documents` record with selfie

**Screen:** `/app/verification/selfie-with-id.tsx`

### Step 3: Face Recognition (Optional)
- User can enroll face recognition for enhanced security
- Creates a `face_recognition` record
- Can be skipped

**Screens:** 
- `/app/verification/face-recognition.tsx` (intro)
- `/app/verification/face-scan.tsx` (actual scanning)

### Step 4: Success
- Shows success message
- Updates user verification status
- Redirects to home page

**Screen:** `/app/verification/success.tsx`

---

## 5. Integration with Profile

The verification badge appears on user profiles:

```tsx
import { VerificationBadge } from '@/components/profile/VerificationBadge';

// In your profile component
<VerificationBadge size="medium" showLabel={true} />
```

The badge shows:
- ❌ **Unverified** - Grey shield outline
- 🟠 **Basic** - Orange shield (ID verified)
- 🔵 **Standard** - Blue shield (ID + selfie verified)
- 🟢 **Enhanced** - Green shield with checkmark (ID + selfie + face recognition)

---

## 6. Triggering Verification

### From Profile Settings

Add a button to start verification:

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

<TouchableOpacity onPress={() => router.push('/verification')}>
  <Text>Verify Identity</Text>
</TouchableOpacity>
```

### Programmatic Start

```tsx
import { useStartFullVerification } from '@/hooks/useVerification';

const startVerification = useStartFullVerification();

const handleVerify = async () => {
  const session = await startVerification.mutateAsync();
  router.push({
    pathname: '/verification/photo-id-card',
    params: { sessionId: session.id },
  });
};
```

---

## 7. Verification Status Check

Check if a user is verified:

```tsx
import { useVerificationStatus } from '@/hooks/useVerification';

const { data: status } = useVerificationStatus();

if (status?.id_verified) {
  // User has verified their ID
}

if (status?.face_recognition_enabled) {
  // User has enrolled face recognition
}

console.log(status?.verification_level); // 'none', 'basic', 'standard', or 'enhanced'
```

---

## 8. Third-Party Verification Providers (Optional)

For production use, you can integrate with professional verification services:

### Recommended Providers

1. **Veriff** - https://www.veriff.com/
   - Supports 190+ countries
   - Real-time verification
   - Fraud detection

2. **Onfido** - https://onfido.com/
   - Global ID verification
   - Face matching
   - AML checks

3. **Jumio** - https://www.jumio.com/
   - ID verification
   - Face biometrics
   - Age verification

### Integration Steps

1. Sign up for a provider account
2. Get API keys
3. Update `verificationService.ts` to call provider API
4. Store provider session ID in `verification_sessions.provider_session_id`

Example integration (Veriff):

```typescript
// In verificationService.ts

import axios from 'axios';

export async function createVeriffSession(userId: string) {
  const response = await axios.post(
    'https://api.veriff.com/v1/sessions',
    {
      verification: {
        person: { firstName: '...', lastName: '...' },
        vendorData: userId,
      },
    },
    {
      headers: {
        'X-AUTH-CLIENT': process.env.VERIFF_API_KEY,
      },
    }
  );

  return response.data.verification.id;
}
```

---

## 9. Admin Moderation

Admins can review verification submissions:

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Get pending verifications
const { data: pending } = useQuery({
  queryKey: ['admin', 'verifications', 'pending'],
  queryFn: async () => {
    const { data } = await supabase
      .from('id_documents')
      .select('*, users(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    return data;
  },
});
```

---

## 10. Security Best Practices

### Encryption
- Face biometric data should be encrypted at rest
- Use Supabase's built-in encryption for storage
- Never log sensitive verification data

### Data Retention
- Delete verification images after 30 days (GDPR compliance)
- Keep verification status but not the actual documents
- Implement automatic cleanup:

```sql
-- Run this as a scheduled job
DELETE FROM id_documents 
WHERE created_at < NOW() - INTERVAL '30 days' 
AND status IN ('verified', 'rejected');
```

### Privacy
- Users can request deletion of verification data
- Include in your data export functionality
- Document in privacy policy

---

## 11. Testing

### Test the Flow

```bash
# Start the app
npm start

# Navigate to verification
# Test each step:
# 1. Upload ID card photo
# 2. Take selfie with ID
# 3. Complete face recognition
# 4. Verify success screen appears
```

### Test Data

For development, you can manually set verification status:

```sql
-- Mark a user as verified (for testing)
UPDATE users 
SET 
  id_verified = true,
  id_verified_at = NOW(),
  verification_level = 'enhanced'
WHERE id = 'user-uuid-here';
```

---

## 12. Troubleshooting

### Issue: Camera not working
- Check permissions in iOS/Android settings
- Verify Info.plist and AndroidManifest.xml are correct
- Test on a physical device (simulator cameras have limitations)

### Issue: Upload fails
- Check Supabase storage bucket exists
- Verify storage policies are set correctly
- Check file size limits (max 10MB recommended)

### Issue: Face recognition not saving
- Check `face_recognition` table RLS policies
- Verify user is authenticated
- Check for duplicate entries (user_id is unique)

---

## 13. Roadmap / Future Enhancements

- [ ] Integration with Veriff/Onfido
- [ ] Liveness detection for face recognition
- [ ] OCR for automatic data extraction from IDs
- [ ] Support for more document types
- [ ] Age verification for age-restricted features
- [ ] Re-verification reminders (annual)
- [ ] Verification status on match cards

---

## Support

For questions or issues:
- Check the codebase documentation
- Review Supabase logs
- Test with mock data first
- Contact the development team

---

**Last Updated:** December 19, 2025

