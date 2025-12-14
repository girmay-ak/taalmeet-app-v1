# Troubleshooting "Unable to Install" on iPhone

## Common Causes & Solutions

### 1. Device Not Registered
Your iPhone's UDID needs to be registered in your Apple Developer account.

**Solution:**
```bash
# Get your device UDID
# Option A: From iPhone Settings
# Settings > General > About > Scroll to find "Identifier" or "UDID"

# Option B: From iTunes/Finder (when connected)
# Connect iPhone to Mac, open Finder/iTunes, click on device, see UDID

# Then register it with EAS
eas device:create
```

### 2. Use Preview Profile Instead
The `preview` profile is better for installing on physical devices.

**Solution:**
```bash
eas build --profile preview --platform ios
```

### 3. Trust Developer Certificate
After installing, you must trust the certificate.

**Steps:**
1. Go to **Settings** > **General** > **VPN & Device Management** (or **Profiles & Device Management**)
2. Look for a section called **"Developer App"** or **"Enterprise App"**
3. Find your developer certificate (should show your Apple ID email)
4. Tap it
5. Tap **"Trust [Your Email]"**
6. Confirm by tapping **"Trust"** again

### 4. Check Build Type
Make sure you're using the right build profile.

**For Physical Device:**
- Use `preview` profile (recommended)
- Or `development` with device registered

**For Simulator:**
- Use `development` with `simulator: true`

### 5. Rebuild with Correct Profile
If the build was for simulator, rebuild for device:

```bash
# Build for physical device
eas build --profile preview --platform ios
```

### 6. Check Apple Developer Account
Make sure:
- Your Apple Developer account is active
- You have the correct team ID set
- Your device is registered (if using development profile)

## Quick Fix Steps

1. **Register your device:**
   ```bash
   eas device:create
   ```

2. **Build with preview profile:**
   ```bash
   eas build --profile preview --platform ios
   ```

3. **After build completes, install via:**
   - QR code (scan with iPhone camera)
   - Direct link (open on iPhone)

4. **Trust the certificate:**
   - Settings > General > VPN & Device Management
   - Trust your developer certificate

5. **Open the app**

## Still Having Issues?

Check the build logs:
```bash
eas build:list
```

Look for the build ID and check:
```bash
eas build:view [BUILD_ID]
```

