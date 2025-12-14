# Fix "Unable to Install" Error

## Solution: Use Preview Profile

The `preview` profile is better for installing on physical devices. It doesn't require device registration.

### Step 1: Build with Preview Profile

```bash
eas build --profile preview --platform ios
```

This will:
- Build for physical iOS devices
- Use internal distribution (no App Store)
- Work without device registration

### Step 2: Install on iPhone

After build completes:
1. **Scan the QR code** with your iPhone camera, OR
2. **Open the build link** on your iPhone Safari browser
3. Tap **"Install"** when prompted

### Step 3: Trust Developer Certificate

**This is the most important step!**

1. On your iPhone, go to **Settings** > **General**
2. Scroll down and tap **"VPN & Device Management"** (or **"Profiles & Device Management"**)
3. Under **"Developer App"** section, you'll see your Apple ID email
4. Tap on it
5. Tap **"Trust [Your Email]"**
6. Confirm by tapping **"Trust"** again

### Step 4: Open the App

Now you can open TAALMEET from your home screen!

## Why This Works

- **Preview profile** uses ad-hoc distribution which doesn't require device registration
- **Development profile** requires your device UDID to be registered in Apple Developer account
- **Preview** is perfect for testing on your own device

## Still Having Issues?

If you still get "unable to install":

1. **Make sure you're using the preview profile:**
   ```bash
   eas build --profile preview --platform ios
   ```

2. **Check the build was successful:**
   - Look for "Build finished" message
   - Make sure there's a QR code or download link

3. **Try deleting and reinstalling:**
   - Delete the app if it partially installed
   - Try installing again from the build link

4. **Check your internet connection:**
   - Make sure your iPhone has good internet
   - Try using WiFi instead of cellular

5. **Restart your iPhone:**
   - Sometimes a restart helps clear installation issues

