# Install TAALMEET on Your iPhone - TestFlight Setup Guide

## 🎯 Goal
Install the app on your iPhone for testing using your Apple Developer account (NOT publishing to App Store yet)

---

## 📋 PREREQUISITES

### 1. Apple Developer Account
- ✅ You have an Apple Developer account ($99/year)
- ✅ Account is active and paid

### 2. Required Software
- ✅ macOS computer
- ✅ Xcode installed (latest version)
- ✅ EAS CLI (Expo Application Services)

### 3. Your iPhone
- iPhone connected to same Apple ID
- TestFlight app installed (free from App Store)

---

## 🚀 OPTION 1: TestFlight (Internal Testing) - RECOMMENDED

This is the **easiest and best way** to test your app on your iPhone.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

*If you don't have an Expo account, create one at expo.dev*

### Step 3: Configure Your Project

```bash
cd /Users/girmay/Documents/taalmeet-app-v1
eas init
```

This will create an Expo project ID.

### Step 4: Configure iOS Build

```bash
eas build:configure
```

This creates `eas.json` file.

### Step 5: Update app.json

Add your bundle identifier:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourdomain.taalmeet",
      "buildNumber": "1.0.0"
    }
  }
}
```

Replace `com.yourdomain.taalmeet` with your actual bundle ID.

### Step 6: Build for TestFlight

```bash
eas build --platform ios --profile preview
```

This will:
- Ask for your Apple Developer credentials
- Create iOS build
- Upload to Expo servers
- Generate IPA file

**Important**: When asked, select:
- "Sign in to Apple Developer account"
- Enter your Apple ID and password
- May need to do 2-factor authentication

### Step 7: Submit to TestFlight

```bash
eas submit --platform ios
```

OR manually:
1. Download the IPA from Expo build page
2. Open **Transporter** app (free Mac app from Apple)
3. Drag IPA file to Transporter
4. Upload to App Store Connect

### Step 8: Configure TestFlight

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps"
3. Select your app (or create new app)
4. Go to "TestFlight" tab
5. Under "Internal Testing", add yourself as tester
6. Build will appear in TestFlight (wait 5-15 minutes for processing)

### Step 9: Install on Your iPhone

1. Open **TestFlight app** on your iPhone
2. You'll see "TAALMEET" appear
3. Tap "Install"
4. App installs on your iPhone! 🎉

---

## 🚀 OPTION 2: Development Build (Direct Install)

Faster for quick testing, but requires connecting iPhone to Mac.

### Step 1: Open iOS Project in Xcode

```bash
cd /Users/girmay/Documents/taalmeet-app-v1/ios
open TAALMEET.xcworkspace
```

### Step 2: Configure Signing

1. In Xcode, select **TAALMEET** project in left sidebar
2. Select **TAALMEET** target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your **Team** (your Apple Developer account)
6. Xcode will create provisioning profile automatically

### Step 3: Connect Your iPhone

1. Connect iPhone to Mac via USB cable
2. Trust computer on iPhone if prompted
3. In Xcode, select your iPhone from device dropdown (top bar)

### Step 4: Build and Run

1. Click ▶️ **Run** button in Xcode
2. App builds and installs on your iPhone
3. If error "Untrusted Developer":
   - On iPhone: Settings → General → VPN & Device Management
   - Trust your developer certificate

---

## 📱 OPTION 3: Ad-hoc Distribution

For installing on specific devices without TestFlight.

### Step 1: Register Device UDID

1. Connect iPhone to Mac
2. Open Finder, select iPhone
3. Click on serial number to show UDID
4. Copy UDID

### Step 2: Add Device to Developer Portal

1. Go to [developer.apple.com](https://developer.apple.com/account)
2. Certificates, Identifiers & Profiles
3. Devices → Register device
4. Paste UDID, give it a name

### Step 3: Build Ad-hoc

```bash
eas build --platform ios --profile preview
```

In eas.json, configure ad-hoc:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    }
  }
}
```

### Step 4: Install IPA

Download IPA from Expo, then:

**Option A - Using Xcode:**
1. Window → Devices and Simulators
2. Select your iPhone
3. Drag IPA to "Installed Apps"

**Option B - Using Apple Configurator:**
1. Download Apple Configurator (free from Mac App Store)
2. Connect iPhone
3. Add IPA file

---

## 🎯 RECOMMENDED APPROACH FOR YOU

Since you want to **test on your phone quickly**, I recommend:

### For Quick Testing (5-10 minutes):
👉 **Use OPTION 2 (Development Build via Xcode)**
- Fastest way to get app on phone
- Good for daily development
- Free (no build service needed)

### For Sharing with Team (30-60 minutes setup):
👉 **Use OPTION 1 (TestFlight)**
- Professional testing distribution
- Easy to share with others later
- Automatic updates
- Production-like environment

---

## 🛠️ STEP-BY-STEP FOR YOU (QUICKEST PATH)

Let's use **Option 2** (Development Build) since it's fastest:

### Step 1: Install Dependencies (if not done)
```bash
cd /Users/girmay/Documents/taalmeet-app-v1
npm install
cd ios
pod install
cd ..
```

### Step 2: Open in Xcode
```bash
cd ios
open TAALMEET.xcworkspace
```

### Step 3: Configure Signing in Xcode
1. Select TAALMEET project (left sidebar)
2. Select TAALMEET target
3. "Signing & Capabilities" tab
4. ✅ "Automatically manage signing"
5. Team → Select your Apple Developer account
6. If you see "Failed to create provisioning profile":
   - Change bundle identifier to something unique
   - Example: `com.girmay.taalmeet` or `com.taalmeet.app`

### Step 4: Connect iPhone & Run
1. Connect iPhone to Mac (USB cable)
2. Unlock iPhone
3. Trust computer if asked
4. In Xcode: Select your iPhone from device dropdown
5. Click ▶️ Run button
6. Wait for build (2-5 minutes first time)
7. App installs on your iPhone! 🎉

### Step 5: Trust Developer (First Time)
On your iPhone:
1. Settings → General → VPN & Device Management
2. Find your Apple Developer account
3. Tap "Trust"
4. Open TAALMEET app

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "Failed to create provisioning profile"
**Fix**: Change bundle identifier in Xcode
- Project Settings → General → Bundle Identifier
- Change to: `com.yourname.taalmeet`

### Issue 2: "Untrusted Developer"
**Fix**: Trust certificate on iPhone
- Settings → General → VPN & Device Management → Trust

### Issue 3: "No accounts with App Store Connect access"
**Fix**: Add Apple ID in Xcode
- Xcode → Preferences → Accounts → Add Apple ID

### Issue 4: "iPhone is not connected"
**Fix**: 
- Restart Xcode
- Reconnect iPhone
- Trust computer on iPhone

### Issue 5: Build takes forever / fails
**Fix**:
```bash
cd ios
pod deintegrate
pod install
```

### Issue 6: "Module not found" errors
**Fix**:
```bash
npm install
cd ios
pod install
cd ..
```

---

## 📝 CHECKLIST

Before you start:
- [ ] Apple Developer account is active ($99/year)
- [ ] Xcode is installed (App Store)
- [ ] iPhone is charged (>50%)
- [ ] USB cable ready
- [ ] iPhone and Mac on same WiFi (for wireless debugging later)

Build process:
- [ ] Dependencies installed (`npm install`)
- [ ] Pods installed (`cd ios && pod install`)
- [ ] Xcode opened (`open ios/TAALMEET.xcworkspace`)
- [ ] Signing configured (Team selected)
- [ ] iPhone connected and trusted
- [ ] Device selected in Xcode
- [ ] Build started (▶️ button)

After install:
- [ ] Developer trusted on iPhone
- [ ] App opens successfully
- [ ] Can login/signup
- [ ] Map shows your location
- [ ] All features working

---

## 🎉 SUCCESS!

Once installed, you can:
- ✅ Test all features on real device
- ✅ Test location services
- ✅ Test notifications (after setup)
- ✅ Test camera (profile pictures)
- ✅ Test real-time messaging
- ✅ Share with friends for testing

---

## 🔄 UPDATING THE APP

After making changes:

**Option 1 - Via Xcode (Quick):**
1. Make code changes
2. Click ▶️ Run in Xcode
3. App updates on iPhone (1-2 minutes)

**Option 2 - Via TestFlight (Production-like):**
1. Make code changes
2. `eas build --platform ios`
3. `eas submit --platform ios`
4. Wait 10-30 minutes
5. Update available in TestFlight

---

## 💡 PRO TIPS

### Tip 1: Wireless Debugging
After first USB install:
1. Xcode → Window → Devices and Simulators
2. Select your iPhone
3. Check "Connect via network"
4. Now you can build/run without USB cable!

### Tip 2: Keep Dev Build
Don't delete the app between builds - Xcode will update it faster

### Tip 3: Check Logs
In Xcode → View → Debug Area → Show Console
See real-time logs from iPhone

### Tip 4: Multiple Devices
Register multiple devices in Developer Portal to test on different iPhones

---

## 🆘 NEED HELP?

If you get stuck, check:
1. Xcode console for error messages
2. iPhone Settings → Privacy → Location Services (must be ON)
3. iPhone Settings → TAALMEET → Permissions (allow all)

Common error solutions:
- "Signing certificate expired" → Generate new one in Developer Portal
- "Device not registered" → Add UDID to Developer Portal
- "Build failed" → Clean build folder (Cmd+Shift+K) and retry

---

**Ready to install? Let's start with the quickest method!** 🚀

Run these commands:
```bash
cd /Users/girmay/Documents/taalmeet-app-v1
cd ios
pod install
open TAALMEET.xcworkspace
```

Then follow Steps 3-5 above!

