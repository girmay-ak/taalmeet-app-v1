#!/bin/bash

# Event API Setup Script
# This script sets up the Supabase Edge Function for fetching events

set -e

echo "🚀 Setting up Event API..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null && ! npx supabase --version &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    echo "Please run: brew install supabase/tap/supabase"
    echo "Or update your Command Line Tools first"
    exit 1
fi

# Use npx if supabase command not found
SUPABASE_CMD="supabase"
if ! command -v supabase &> /dev/null; then
    SUPABASE_CMD="npx supabase"
    echo "📦 Using npx to run Supabase CLI"
fi

# Get project ref from environment
PROJECT_REF="auplkesuhnjbgbawxrxh"  # From your Supabase URL
EVENTBRITE_TOKEN="VK5VH2TIESVMBC2UHXWJ"  # From your config

echo "📋 Project Reference: $PROJECT_REF"
echo ""

# Step 1: Login
echo "🔐 Step 1: Login to Supabase"
echo "Please login to Supabase in your browser..."
$SUPABASE_CMD login

# Step 2: Link project
echo ""
echo "🔗 Step 2: Linking project..."
$SUPABASE_CMD link --project-ref $PROJECT_REF

# Step 3: Set secret
echo ""
echo "🔑 Step 3: Setting Eventbrite token..."
$SUPABASE_CMD secrets set EVENTBRITE_PUBLIC_TOKEN=$EVENTBRITE_TOKEN

# Step 4: Deploy function
echo ""
echo "🚀 Step 4: Deploying Edge Function..."
$SUPABASE_CMD functions deploy fetch-events

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "The Event API is now ready to use."
echo "Your app will automatically fetch events from Eventbrite."

