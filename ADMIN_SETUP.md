# How to Make Your Account Admin

There are several ways to make your account an admin. Choose the method that works best for you.

## Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Navigate to **Table Editor** → **profiles** table

2. **Find Your Profile**
   - Look for your profile row (you can identify it by your email or display_name)
   - Or use the SQL Editor to find your user ID first (see Method 2)

3. **Update is_admin Column**
   - Click on your profile row
   - Find the `is_admin` column
   - Change it from `false` to `true`
   - Save the changes

## Method 2: Using SQL Editor in Supabase

1. **Find Your User ID**
   ```sql
   -- Find your user ID by email
   SELECT id, email, display_name 
   FROM profiles 
   WHERE email = 'your-email@example.com';
   ```

2. **Update Your Profile to Admin**
   ```sql
   -- Replace 'YOUR_USER_ID' with your actual user ID from step 1
   UPDATE profiles 
   SET is_admin = true 
   WHERE id = 'YOUR_USER_ID';
   ```

   Or if you know your email:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE id = (
     SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```

## Method 3: Using Supabase Client (Programmatic)

If you want to do this from your app code (temporary script):

```typescript
import { supabase } from '@/lib/supabase';

// First, get your user ID
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id;

// Then update your profile
const { error } = await supabase
  .from('profiles')
  .update({ is_admin: true })
  .eq('id', userId);

if (error) {
  console.error('Error making admin:', error);
} else {
  console.log('Successfully made admin!');
}
```

## Method 4: Find Your User ID from the App

1. **Check the App Console**
   - Open your app
   - Check the console/logs for your user ID
   - Or add a temporary console.log in your profile screen:
   ```typescript
   const { user } = useAuth();
   console.log('My User ID:', user?.id);
   ```

2. **Then use Method 2** with your user ID

## Verify Admin Status

After making yourself admin, verify it works:

1. **Restart your app** (to refresh the auth state)
2. **Go to Settings** → You should see "Admin Dashboard" option
3. **Click Admin Dashboard** → You should see the reports list

## Troubleshooting

### If Admin Dashboard doesn't appear:
- Make sure you restarted the app after updating `is_admin`
- Check that the migration `013_content_moderation_system.sql` has been run
- Verify the `is_admin` column exists in the `profiles` table:
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'profiles' AND column_name = 'is_admin';
  ```

### If you get permission errors:
- Make sure RLS policies are set up correctly
- Check that your user ID matches the profile ID
- Verify you're authenticated in the app

## Security Note

⚠️ **Important**: Only make trusted accounts admin. Admin users have full access to:
- View all user reports
- Take moderation actions (warn, suspend, ban users)
- Access sensitive user data

Make sure to secure your admin accounts with strong passwords and 2FA if available.

