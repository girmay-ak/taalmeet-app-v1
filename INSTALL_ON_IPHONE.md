# Install TAALMEET on Your iPhone

## Step 1: Build for Physical Device

The build configuration has been updated to build for physical iOS devices (not simulator).

## Step 2: Start the Build

Run this command to build for your iPhone:

```bash
eas build --profile development --platform ios
```

## Step 3: Install on Your iPhone

After the build completes, you'll get a QR code and download link. You have two options:

### Option A: Install via QR Code (Easiest)
1. Open your iPhone camera app
2. Scan the QR code shown in the terminal
3. Tap the notification that appears
4. The app will download and install

### Option B: Install via Link
1. Open the build link on your iPhone (e.g., `https://expo.dev/accounts/gm25/projects/taalmeet/builds/...`)
2. Tap "Install" or "Download"
3. The app will download and install

## Step 4: Trust the Developer Certificate

After installing, you may need to trust the developer certificate:

1. Go to **Settings** > **General** > **VPN & Device Management** (or **Profiles & Device Management**)
2. Find your developer certificate (should show your Apple ID email)
3. Tap it and select **Trust**
4. Confirm by tapping **Trust** again

## Step 5: Open the App

1. Find the TAALMEET app on your home screen
2. Tap to open it
3. The app should launch!

## Troubleshooting

### "Untrusted Developer" Error
- Go to Settings > General > VPN & Device Management
- Trust your developer certificate

### App Won't Install
- Make sure your iPhone is connected to the internet
- Check that you're using the same Apple ID that was used for the build
- Try deleting the app and reinstalling

### Build Fails
- Make sure you have a valid Apple Developer account
- Check that your EAS environment variables are set correctly
- Verify your Mapbox tokens are correct in EAS

## Next Steps

After installing, you can:
- Connect to the development server by running `npx expo start --dev-client`
- Test all features on your physical device
- Use real GPS location (instead of simulator location)
