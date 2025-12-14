# Register Device Manually

## Option 1: Skip Device Registration (Easiest)

You can continue the build without registering the device. The preview profile should still work.

**In the terminal, press any key to continue** (as it says "Press any key if you've already finished device registration")

The build will continue and you can install it later.

## Option 2: Register Device Manually via UDID

### Step 1: Get Your iPhone UDID

**Method A: From iPhone Settings**
1. Go to **Settings** > **General** > **About**
2. Scroll down to find **"Identifier"** or look for a long string of numbers/letters
3. Copy this UDID

**Method B: From Mac (if iPhone connected)**
1. Connect iPhone to Mac via USB
2. Open **Finder** (or iTunes on older macOS)
3. Click on your iPhone in the sidebar
4. Click on the serial number - it will change to show UDID
5. Copy the UDID

**Method C: From iPhone (Easiest)**
1. Open Safari on your iPhone
2. Go to: `https://udid.tech` or `https://get.udid.io`
3. Tap "Get UDID" or "Tap to find UDID"
4. Install the profile (this is safe - it's just to read your UDID)
5. Copy the UDID shown

### Step 2: Register Device with EAS

```bash
eas device:create
```

When prompted:
- Choose "Enter UDID manually"
- Paste your UDID
- Give it a name (e.g., "My iPhone")

### Step 3: Continue Build

After registering, continue the build or start a new one:

```bash
eas build --profile preview --platform ios
```

## Option 3: Continue Build Without Registration

You can actually continue the build even if device registration fails. The preview profile might still work.

**In your terminal:**
1. Press any key to continue (as prompted)
2. The build will proceed
3. After build completes, try installing - it might work!

## Why This Error Happens

- Safari security restrictions
- Network issues
- Expired registration link
- Apple Developer account permissions

## Quick Fix: Continue Build

The easiest solution is to **press any key in the terminal** to continue the build. The preview profile should work even without explicit device registration for ad-hoc distribution.

