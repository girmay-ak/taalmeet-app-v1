# 🔧 Supabase Setup Instructions

## Current Issue
Your Supabase project is unreachable. Follow these steps to fix it.

## Step 1: Check Your Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Sign in with your account
3. Look for your project: `lnmgmxblinnqfsecjkdu`

### If Project is PAUSED:
- Click **"Resume Project"** button
- Wait 1-2 minutes for it to wake up
- Restart your app: `make start`

### If Project DOESN'T EXIST:
Continue to Step 2 below.

## Step 2: Create New Supabase Project (If Needed)

1. Go to: https://supabase.com/dashboard
2. Click **"New Project"**
3. Choose a name: `taalmeet-app`
4. Set a strong database password
5. Choose region closest to you
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup to complete

## Step 3: Get Your Credentials

Once your project is ready:

1. Go to: **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI...`

## Step 4: Update Your .env File

Open `.env` in your project root and update:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Set Up Database Tables

Run the SQL migrations in your Supabase dashboard:

1. Go to: **SQL Editor**
2. Run the migration files from `supabase/migrations/` folder

## Step 6: Restart Your App

```bash
# Stop the current server (Ctrl+C)
make start
```

## 🎉 Done!

Your app should now connect to Supabase successfully!

---

## Troubleshooting

### Still getting "Network request failed"?

1. **Clear Metro cache**:
   ```bash
   make start:clear
   ```

2. **Check your internet connection**

3. **Verify credentials are correct** (no spaces, complete keys)

4. **Check Supabase project status**: 
   - Dashboard should show **"Active"**, not "Paused"

### Need Help?

Check the Supabase docs: https://supabase.com/docs/guides/getting-started

