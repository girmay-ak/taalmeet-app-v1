# Event API Setup Guide

This guide explains how to set up the Event API to fetch events from Eventbrite in your TAALMEET app.

## Overview

We've created a **Supabase Edge Function** that fetches events server-side. This approach:
- ✅ Keeps API keys secure (not exposed to client)
- ✅ Avoids CORS issues
- ✅ Works reliably with Eventbrite API

## Setup Steps

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
cd /Users/girmay/Documents/taalmeet-app-v1
supabase link --project-ref YOUR_PROJECT_REF
```

To find your project ref:
- Go to https://supabase.com/dashboard
- Select your project
- Go to Settings > General
- Copy the "Reference ID"

### 4. Set Environment Variables

Set the Eventbrite token as a secret in Supabase:

```bash
supabase secrets set EVENTBRITE_PUBLIC_TOKEN=YOUR_EVENTBRITE_TOKEN
```

Or set it in the Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** > **Secrets**
4. Add: `EVENTBRITE_PUBLIC_TOKEN` = `VK5VH2TIESVMBC2UHXWJ` (or your token)

### 5. Deploy the Edge Function

```bash
supabase functions deploy fetch-events
```

### 6. Test the Function

You can test it locally first:

```bash
supabase functions serve fetch-events
```

Then test with:

```bash
curl -X POST http://localhost:54321/functions/v1/fetch-events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"location": "Netherlands", "limit": 10}'
```

## Alternative: Direct API (Less Secure)

If you don't want to use Edge Functions, the app will fall back to calling Eventbrite API directly. However, this:
- ⚠️ Exposes your API key in the client
- ⚠️ May have CORS issues
- ⚠️ Less reliable

The app will automatically try the Edge Function first, then fall back to direct API if needed.

## Troubleshooting

### Edge Function Returns Empty Events

1. **Check Eventbrite Token**: Make sure `EVENTBRITE_PUBLIC_TOKEN` is set correctly
2. **Check Eventbrite API Status**: The public search endpoint may be deprecated
3. **Check Logs**: 
   ```bash
   supabase functions logs fetch-events
   ```

### Function Not Found (404)

1. Make sure you've deployed the function:
   ```bash
   supabase functions deploy fetch-events
   ```
2. Check your project is linked:
   ```bash
   supabase projects list
   ```

### CORS Errors

The Edge Function includes CORS headers. If you still see CORS errors:
1. Check the function is deployed
2. Check the function URL is correct
3. Make sure you're using the correct Supabase URL

## File Structure

```
supabase/
  functions/
    fetch-events/
      index.ts          # Main function code
    _shared/
      cors.ts           # CORS headers helper
```

## Next Steps

Once deployed, the app will automatically use the Edge Function to fetch events. No code changes needed in the app - it will work automatically!

## Support

If you encounter issues:
1. Check Supabase Dashboard > Edge Functions > Logs
2. Verify environment variables are set
3. Test the function directly with curl
4. Check Eventbrite API documentation for any changes

