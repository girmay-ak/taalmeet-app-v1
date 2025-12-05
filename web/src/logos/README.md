# TaalMeet Logo Assets

Complete logo package for mobile apps, web, and marketing materials.

## 📱 Mobile App Icons

### iOS Icons
- **app-icon-1024.svg** - 1024x1024px (App Store submission)
- **app-icon-180.svg** - 180x180px (iPhone display)

### Android/PWA Icons
- **app-icon-512.svg** - 512x512px (Google Play submission)
- **app-icon-192.svg** - 192x192px (Android display)

## 🌐 Web Icons

### Favicons
- **favicon-32.svg** - 32x32px (Standard favicon)
- **favicon-16.svg** - 16x16px (Browser tab)

### General Web Use
- **logo-icon.svg** - 100x100px (Standard web icon)
- **logo-horizontal.svg** - 300x100px (Header/Navigation - white text)
- **logo-horizontal-dark.svg** - 300x100px (For dark backgrounds)
- **logo-horizontal-light.svg** - 300x100px (For light backgrounds - dark text)

## 🎨 Alternative Versions

- **logo-white-bg.svg** - Logo with white background (for dark surfaces)
- **logo-monochrome.svg** - Single color version (teal background)
- **logo-monochrome-white.svg** - White version (for dark backgrounds)

## 📋 Usage Guide

### Mobile App Submission

**iOS (App Store)**
1. Use `app-icon-1024.svg` for App Store submission
2. Convert to PNG format (required by Apple)
3. Ensure no transparency (filled background required)

**Android (Google Play)**
1. Use `app-icon-512.svg` for Play Store submission
2. Convert to PNG format
3. Adaptive icon recommended (consider creating separate foreground/background layers)

### Web Application

**Favicon Setup**
```html
<link rel="icon" type="image/svg+xml" href="/favicon-32.svg">
<link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16.svg">
```

**PWA Manifest**
```json
{
  "icons": [
    {
      "src": "/app-icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/app-icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

**Navigation/Header**
- Use `logo-horizontal.svg` for main navigation
- Use `logo-icon.svg` for mobile navigation or compact spaces

### Social Media

- **Profile Picture**: Use `logo-icon.svg` or `app-icon-512.svg`
- **Cover Images**: Use `logo-horizontal.svg` with appropriate padding
- **Open Graph**: Convert `app-icon-512.svg` to PNG (1200x630px recommended)

## 🎨 Brand Colors

- **Primary Teal**: #4DB8B8
- **Secondary Teal**: #2D9B9B
- **Accent Green**: #1DB954
- **Light Green**: #1ED760
- **Dark Background**: #0A0A0A
- **Text White**: #FFFFFF

## 🔄 Converting SVG to Other Formats

### Online Tools (Free)
- **CloudConvert** - https://cloudconvert.com/svg-to-png
- **SVG to PNG Converter** - https://svgtopng.com/
- **Favicon Generator** - https://realfavicongenerator.net/

### Design Tools
- **Figma**: Import SVG → Export as PNG/ICO
- **Adobe Illustrator**: Open SVG → Export for Screens
- **Inkscape** (Free): Open SVG → Export PNG Image

### Command Line (ImageMagick)
```bash
# Convert to PNG
convert logo-icon.svg -resize 512x512 logo-512.png

# Convert to ICO (Windows)
convert favicon-32.svg favicon.ico
```

## 📐 Recommended Sizes

### iOS App Icons
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 76x76 (iPad)

### Android App Icons
- 512x512 (Play Store)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)

### Web Favicons
- 32x32 (Standard)
- 16x16 (Browser tab)
- 180x180 (Apple touch icon)
- 192x192 (Android Chrome)

## ⚡ Performance Tips

1. **Use SVG for web** - Smaller file size, scales perfectly
2. **PNG for mobile apps** - Required by app stores
3. **Optimize PNGs** - Use TinyPNG or ImageOptim
4. **Consider WebP** - For modern browsers (better compression)

## ✅ Quality Checklist

Before submission:
- ✅ No transparency in app icons (iOS requirement)
- ✅ Minimum contrast ratio for accessibility
- ✅ Icons look clear at smallest size (16x16)
- ✅ Consistent branding across all sizes
- ✅ Proper file formats for each platform

## 📝 License

These logo files are proprietary to TaalMeet. Unauthorized use is prohibited.

---

**Need help?** Contact the design team for custom sizes or formats.
