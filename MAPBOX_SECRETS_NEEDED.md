# Mapbox Secrets Required for EAS Builds

## ✅ You Already Have This One:

### 1. EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
- **Value**: `pk.eyJ1IjoiZ2lybWF5bmwyMSIsImEiOiJjbWo1cDZhaWIwbWV0M2xzYnN5ZnNxMzVhIn0.h4BzugOKpjYZezFJ8M9QGQ`
- **Status**: ✅ Already added
- **Purpose**: Used at runtime to display maps in your app
- **Where to get**: https://account.mapbox.com/access-tokens/ (your default public token)

---

## ✅ You Have This One Too:

### 2. RNMAPBOX_MAPS_DOWNLOAD_TOKEN
- **Value**: `sk.eyJ1IjoiZ2lybWF5bmwyMSIsImEiOiJjbWo1cGUxdWYwbWh5M2xzYjdmYzIxbDY3In0.7xroVgWvnjfuaAoxj4vXMQ`
- **Status**: ✅ Created - **Now add to EAS**
- **Purpose**: Used during EAS build to download the Mapbox SDK
- **Action Required**: Add this token to EAS (see instructions below)

---

## How to Get the Download Token:

### Step 1: Go to Mapbox Tokens Page
https://account.mapbox.com/access-tokens/

### Step 2: Create New Token
1. Click **"Create a token"** button
2. **Name**: `EAS Build Download Token` (or any name you like)
3. **Description**: `For downloading Mapbox SDK during EAS builds`

### Step 3: Add Required Scope
**IMPORTANT**: You MUST add this scope:
- Scroll down to **"Scopes"** section
- Check the box: **`DOWNLOADS:READ`**
- This allows the token to download the Mapbox SDK

### Step 4: Create and Copy Token
1. Click **"Create token"**
2. Copy the **secret token** (it starts with `sk.`)
3. **Save it immediately** - you won't be able to see it again!

---

## How to Add to EAS:

### Option 1: EAS Dashboard (Recommended)
1. Go to: https://expo.dev/accounts/gm25/projects/taalmeet/settings/environment-variables
2. Click **"Add Variable"**
3. Fill in:
   - **Name**: `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`
   - **Value**: `sk.your-token-here` (paste the token you copied)
   - **Visibility**: Select **"Secret"** (recommended)
   - **Environments**: Check all boxes:
     - ✅ development
     - ✅ preview  
     - ✅ production
4. Click **"Save"**

### Option 2: EAS CLI
```bash
eas env:create --scope project --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN
```
Then paste your token when prompted.

---

## Summary:

| Secret Name | Value | Status | Required For |
|------------|-------|--------|--------------|
| `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | `pk.eyJ1...` | ✅ Added to EAS | Runtime maps |
| `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` | `sk.eyJ1...` | ⚠️ **Add to EAS** | EAS builds |

---

## After Adding Both Secrets:

Your build will work! Run:
```bash
eas build --profile development --platform ios
```

---

## Quick Checklist:

- [x] Access token added to EAS
- [x] Download token created in Mapbox
- [ ] **Download token added to EAS** ← Do this now!
- [ ] Ready to build!

