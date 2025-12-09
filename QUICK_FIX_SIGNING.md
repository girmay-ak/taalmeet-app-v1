# 🔧 Quick Fix: Configure Apple Developer Team

## Step 1: Add Your Apple Developer Account to Xcode

1. **Open Xcode Preferences**:
   - Menu bar: **Xcode** → **Settings** (or **Preferences** on older Xcode)
   - Or press: **Cmd + ,**

2. **Go to Accounts Tab**:
   - Click **"Accounts"** at the top

3. **Add Your Apple ID**:
   - Click **"+"** button (bottom-left)
   - Select **"Apple ID"**
   - **Sign in** with your Apple Developer account credentials
   - Wait for authentication ✅

4. **Verify Team**:
   - You should see your name/team listed
   - If personal Apple ID: Shows as "(Personal Team)"
   - If paid developer account: Shows your team name

---

## Step 2: Configure Signing in Project

1. **In Xcode left sidebar**:
   - Click **TAALMEET** (blue icon at top)

2. **Select Target**:
   - Make sure **TAALMEET** (not TALMEETTests) is selected in the center panel

3. **Click "Signing & Capabilities" tab**

4. **Enable Automatic Signing**:
   - ✅ Check **"Automatically manage signing"**

5. **Select Team**:
   - **Team** dropdown: Select your Apple Developer account
   - Should now show your team name ✅

6. **Set Bundle Identifier** (if needed):
   - If you see ⚠️ error about identifier conflict
   - Change **Bundle Identifier** to:
     - `com.taalmeet.app`
     - OR `com.girmay.taalmeet`
     - OR `com.[yourname].taalmeet`

7. **Wait for Provisioning**:
   - Xcode will create provisioning profile
   - Should see: "Provisioning profile... created" ✅
   - No more errors in Signing section

---

## Step 3: Build for Your iPhone

1. **Connect iPhone** via USB (if not already)

2. **Select Your iPhone**:
   - Top bar: Click device dropdown
   - Select your iPhone name

3. **Click ▶️ (Run button)**

4. **Wait for build** (3-5 minutes first time)

---

## 🐛 Troubleshooting

### "No accounts with Apple Developer Program membership"
**Solution**: You need a **paid Apple Developer account** ($99/year) to install on physical devices.

**Free Account Option**: You can still test with:
- Personal Team (7-day certificate)
- But need to rebuild every 7 days
- Limited to 3 apps

**To proceed with Free Account**:
1. Use your personal Apple ID
2. Select "(Personal Team)" in Team dropdown
3. Change Bundle ID to something unique
4. Build and install (valid for 7 days)

### "Failed to create provisioning profile"
**Fix**: Change Bundle Identifier to something unique.

### "Signing certificate expired"
**Fix**:
1. Xcode → Settings → Accounts
2. Select your Apple ID
3. Click "Manage Certificates"
4. Click "+" → "Apple Development"
5. Try building again

---

## ✅ Ready to Build!

Once you've:
1. ✅ Added Apple ID to Xcode (Step 1)
2. ✅ Selected Team in Signing & Capabilities (Step 2)
3. ✅ Connected iPhone and selected it (Step 3)

**Click ▶️ and your app will install on your iPhone!** 🚀

