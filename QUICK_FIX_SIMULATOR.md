# Quick Fix for Simulator Timeout

## The Problem
The simulator times out when trying to open the app via deep link. This is a common issue.

## ✅ Solution: Manual App Launch

Since the app is already installed on your simulator, just open it manually:

### Step 1: Open Simulator
```bash
open -a Simulator
```

### Step 2: Find and Open TAALMEET App
1. In the simulator, look for the **TAALMEET** app icon
2. Click on it to open
3. The app should connect to your Expo server automatically

### Step 3: Start Expo Server
```bash
# In your terminal, run:
npx expo start --clear
```

### Step 4: If App Doesn't Connect
Once the app is open in the simulator:
1. Shake the device (Cmd+Ctrl+Z in simulator)
2. Select "Enter URL manually"
3. Enter: `exp://192.168.178.109:8081` (or the URL shown in your Expo terminal)

## Alternative: Use Expo Go

If you want to use Expo Go instead:

```bash
# Start with Expo Go mode
npx expo start --go

# Then in simulator, open Expo Go app
# Scan the QR code or enter the URL manually
```

## Alternative: Rebuild the App

If the app isn't working:

```bash
# Clean build
cd ios
rm -rf build
pod install
cd ..

# Rebuild
npx expo run:ios
```

## Why This Happens

The timeout occurs because:
- The simulator sometimes has issues with deep links
- Multiple Expo processes can conflict
- The app might not be properly registered for the URL scheme

**The manual method always works!** Just open the app directly in the simulator.

