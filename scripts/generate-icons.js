#!/usr/bin/env node

/**
 * Icon Generation Script
 * Generates app icons from SVG logo
 * 
 * Requirements:
 * - Install: npm install -g @expo/image-utils sharp
 * - Or use: npx @expo/image-utils
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const logoPath = path.join(assetsDir, 'logo-icon.svg');

console.log('📱 TaalMeet Icon Generator');
console.log('==========================\n');

console.log('⚠️  Manual Icon Generation Required');
console.log('\nTo generate app icons from the logo, you have several options:\n');

console.log('Option 1: Use Online Tool (Easiest)');
console.log('-----------------------------------');
console.log('1. Go to: https://www.appicon.co/');
console.log('2. Upload: assets/logo-icon.svg');
console.log('3. Download generated icons');
console.log('4. Place in assets/ folder:\n');
console.log('   - icon.png (1024x1024)');
console.log('   - adaptive-icon.png (1024x1024)');
console.log('   - favicon.png (48x48 or 32x32)\n');

console.log('Option 2: Use Expo Icon Generator');
console.log('----------------------------------');
console.log('1. Install: npm install -g @expo/image-utils');
console.log('2. Run: npx expo-optimize');
console.log('3. Or use: npx @expo/prebuild\n');

console.log('Option 3: Use ImageMagick (Command Line)');
console.log('----------------------------------------');
console.log('Install ImageMagick: brew install imagemagick');
console.log('Then run:\n');
console.log('  # Convert SVG to PNG');
console.log('  convert -background none -resize 1024x1024 assets/logo-icon.svg assets/icon.png');
console.log('  convert -background none -resize 1024x1024 assets/logo-icon.svg assets/adaptive-icon.png');
console.log('  convert -background none -resize 48x48 assets/logo-icon.svg assets/favicon.png\n');

console.log('Option 4: Use Figma/Design Tool');
console.log('--------------------------------');
console.log('1. Open logo-icon.svg in Figma');
console.log('2. Export as PNG at required sizes:');
console.log('   - 1024x1024 for icon.png');
console.log('   - 1024x1024 for adaptive-icon.png');
console.log('   - 48x48 for favicon.png\n');

console.log('Required Icon Sizes:');
console.log('-------------------');
console.log('icon.png:           1024x1024 (iOS/Android)');
console.log('adaptive-icon.png:  1024x1024 (Android adaptive icon)');
console.log('favicon.png:        48x48 or 32x32 (Web favicon)\n');

console.log('After generating icons, update app.json if needed.\n');

// Check if logo exists
if (fs.existsSync(logoPath)) {
  console.log('✅ Logo file found: assets/logo-icon.svg');
} else {
  console.log('❌ Logo file not found: assets/logo-icon.svg');
  console.log('   Please create the logo-icon.svg file first.\n');
}

