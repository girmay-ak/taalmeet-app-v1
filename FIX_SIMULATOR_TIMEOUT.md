# Fix iOS Simulator Timeout Issue

## Problem
The simulator times out when trying to open the app with the error:
```
Simulator device failed to open taalmeet://expo-development-client/?url=...
Operation timed out
```

## Solutions

### Solution 1: Install the App on Simulator First

If you're using a development build (not Expo Go), you need to install it first:

```bash
# Build and install the app
npx expo run:ios

# Or if you have an existing build
npx expo start --dev-client
```

### Solution 2: Use Expo Go Instead

If you want to use Expo Go (easier for development):

```bash
# Stop current server
# Then start with Expo Go
npx expo start --go
```

### Solution 3: Reset Simulator

Sometimes the simulator needs a reset:

```bash
# Shut down simulator
xcrun simctl shutdown BE5DCDF6-C583-49C3-9033-8A6AE44F1C60

# Boot it again
xcrun simctl boot BE5DCDF6-C583-49C3-9033-8A6AE44F1C60

# Open Simulator app
open -a Simulator
```

### Solution 4: Clear Metro Cache and Restart

```bash
# Clear cache
npx expo start --clear

# Or clear watchman
watchman watch-del-all
```

### Solution 5: Manual App Installation

If the app isn't installed:

1. Open Xcode
2. Open the project: `ios/TAALMEET.xcworkspace`
3. Select the simulator as target
4. Click Run (⌘R)

### Solution 6: Check Development Client

If using development client, make sure it's installed:

```bash
# Check if development client is needed
npx expo install expo-dev-client

# Rebuild
npx expo prebuild --clean
npx expo run:ios
```

## Quick Fix (Try This First)

```bash
# 1. Clear watchman
watchman watch-del-all

# 2. Clear Metro cache
rm -rf node_modules/.cache

# 3. Restart Metro with clear cache
npx expo start --clear

# 4. In another terminal, open simulator manually
open -a Simulator

# 5. Once simulator is open, press 'i' in the Expo terminal to open iOS
```

## If Nothing Works

1. **Close all terminals and restart**
2. **Restart your Mac** (sometimes helps with simulator issues)
3. **Use a physical device** instead:
   ```bash
   npx expo start --dev-client
   # Then scan QR code with your phone
   ```

