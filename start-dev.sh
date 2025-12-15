#!/bin/bash

# Development Server Startup Script
# This script properly starts the Expo development server

set -e

echo "🚀 Starting TAALMEET Development Server..."
echo ""

# Clear watchman
echo "📦 Clearing watchman..."
watchman watch-del-all 2>/dev/null || true

# Clear Metro cache
echo "🧹 Clearing Metro cache..."
rm -rf node_modules/.cache
rm -rf .expo

# Kill any existing Expo processes
echo "🛑 Stopping existing Expo processes..."
pkill -f "expo start" 2>/dev/null || true
sleep 2

# Start Expo with clear cache
echo "✅ Starting Expo development server..."
echo ""
echo "Press 'i' to open iOS simulator"
echo "Press 'a' to open Android emulator"
echo "Press 'r' to reload"
echo "Press 'm' to toggle menu"
echo ""

npx expo start --clear

