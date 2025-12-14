# Add Download Token to EAS

## Your Download Token:
```
sk.eyJ1IjoiZ2lybWF5bmwyMSIsImEiOiJjbWo1cGUxdWYwbWh5M2xzYjdmYzIxbDY3In0.7xroVgWvnjfuaAoxj4vXMQ
```

## Steps to Add to EAS:

### Option 1: EAS Dashboard (Easiest)

1. **Go to EAS Dashboard:**
   https://expo.dev/accounts/gm25/projects/taalmeet/settings/environment-variables

2. **Click "Add Variable"**

3. **Fill in the form:**
   - **Name**: `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`
   - **Value**: `sk.eyJ1IjoiZ2lybWF5bmwyMSIsImEiOiJjbWo1cGUxdWYwbWh5M2xzYjdmYzIxbDY3In0.7xroVgWvnjfuaAoxj4vXMQ`
   - **Visibility**: Select **"Secret"** (recommended for security)
   - **Environments**: Check ALL boxes:
     - ✅ development
     - ✅ preview
     - ✅ production

4. **Click "Save"**

### Option 2: EAS CLI

Run this command:
```bash
eas env:create --scope project --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN
```

When prompted:
- **Value**: Paste `sk.eyJ1IjoiZ2lybWF5bmwyMSIsImEiOiJjbWo1cGUxdWYwbWh5M2xzYjdmYzIxbDY3In0.7xroVgWvnjfuaAoxj4vXMQ`
- **Visibility**: Select "secret"
- **Environments**: Select all (development, preview, production)

---

## After Adding:

✅ Both secrets will be configured:
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` ✅
- `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` ✅

## Then Build:

```bash
eas build --profile development --platform ios
```

Your build should now work! 🎉

