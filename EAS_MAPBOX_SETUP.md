# EAS Mapbox Setup Guide

## Issue
The EAS build is failing because Mapbox environment variables are not set.

## Solution: Set Mapbox Secrets in EAS

### Step 1: Get Your Mapbox Tokens

1. **Access Token (pk.*)** - For runtime map access:
   - Go to: https://account.mapbox.com/access-tokens/
   - Copy your default public token (starts with `pk.`)

2. **Download Token (sk.*)** - For downloading Mapbox SDK during builds:
   - Go to: https://account.mapbox.com/access-tokens/
   - Click "Create a token"
   - Name it: "EAS Build Download Token"
   - Add scope: `DOWNLOADS:READ`
   - Copy the secret token (starts with `sk.`)

### Step 2: Set Secrets in EAS

Run these commands (replace with your actual tokens):

```bash
# Set Mapbox Download Token (required for builds)
eas env:create --scope project --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN --value sk.your-download-token-here --type secret

# Set Mapbox Access Token (for runtime)
eas env:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value pk.your-access-token-here --type secret
```

### Step 3: Verify Secrets

```bash
eas env:list
```

You should see both secrets listed.

### Step 4: Rebuild

```bash
eas build --profile development --platform ios
```

## Alternative: Make Mapbox Optional

If you don't want to use Mapbox right now, you can:

1. Remove the Mapbox plugin from `app.json` temporarily
2. The app will fall back to Google Maps automatically

To remove Mapbox plugin, edit `app.json` and remove:
```json
[
  "@rnmapbox/maps",
  {
    "RNMapboxMapsDownloadToken": "${RNMAPBOX_MAPS_DOWNLOAD_TOKEN}"
  }
]
```

## Troubleshooting

- **Build still fails**: Check the build logs at the URL provided in the error
- **Token not found**: Make sure you created the secrets with the exact names:
  - `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`
  - `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- **Wrong scope**: The download token must have `DOWNLOADS:READ` scope

