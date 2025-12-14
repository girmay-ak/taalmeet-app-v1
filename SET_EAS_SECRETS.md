# Set EAS Secrets for Mapbox

## Your Mapbox Access Token
```
pk.eyJ1IjoiZ2lybWF5bmwyMSIsImEiOiJjbWo1cDZhaWIwbWV0M2xzYnN5ZnNxMzVhIn0.h4BzugOKpjYZezFJ8M9QGQ
```

## Steps to Set in EAS Dashboard

1. Go to: https://expo.dev/accounts/gm25/projects/taalmeet/settings/environment-variables

2. Click "Add Variable" and set:
   - **Name**: `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
   - **Value**: `pk.eyJ1IjoiZ2lybWF5bmwyMSIsImEiOiJjbWo1cDZhaWIwbWV0M2xzYnN5ZnNxMzVhIn0.h4BzugOKpjYZezFJ8M9QGQ`
   - **Visibility**: Secret (recommended) or Plain text
   - **Environments**: Select all (development, preview, production)

3. **IMPORTANT**: You also need a **Download Token** for builds:
   - Go to: https://account.mapbox.com/access-tokens/
   - Create a new token with `DOWNLOADS:READ` scope
   - Copy the secret token (starts with `sk.`)
   - Add it to EAS as: `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`

## Or Use CLI (Interactive)

Run these commands and follow the prompts:

```bash
# Set Access Token
eas env:create --scope project --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN

# Set Download Token (you need to create this first)
eas env:create --scope project --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN
```

## After Setting Secrets

Rebuild your app:
```bash
eas build --profile development --platform ios
```

