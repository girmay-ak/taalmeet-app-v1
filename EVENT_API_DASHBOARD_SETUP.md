# Event API Setup via Supabase Dashboard (Easier Method)

Since the CLI setup requires interactive login, here's how to set it up via the Supabase Dashboard:

## Step 1: Create the Edge Function

1. Go to https://supabase.com/dashboard
2. Select your project (auplkesuhnjbgbawxrxh)
3. Go to **Edge Functions** in the left sidebar
4. Click **Create a new function**
5. Name it: `fetch-events`
6. Copy and paste the code from `supabase/functions/fetch-events/index.ts`
7. Click **Deploy**

## Step 2: Set the Secret

1. In the Edge Functions page, click on **Secrets** tab
2. Click **Add new secret**
3. Name: `EVENTBRITE_PUBLIC_TOKEN`
4. Value: `VK5VH2TIESVMBC2UHXWJ`
5. Click **Save**

## Step 3: Test the Function

1. Go to **Edge Functions** > **fetch-events**
2. Click **Invoke** tab
3. Use this test payload:
```json
{
  "location": "Netherlands",
  "onlineOnly": false,
  "limit": 10,
  "query": "language exchange"
}
```
4. Click **Invoke** and check the response

## That's it! 🎉

Your app will now automatically use the Edge Function to fetch events.

## Alternative: Use the Setup Script

If you prefer CLI, run:
```bash
./setup-event-api.sh
```

This will guide you through the setup interactively.

