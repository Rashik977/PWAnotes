# PWA Notes - Powerful Offline Note-Taking App

A modern Progressive Web App (PWA) built with Next.js that demonstrates the full power of PWAs including offline functionality, cross-device push notifications, and native app-like experience.

## ✨ Features

- **📱 Full PWA Experience**: Installable on any device
- **🔄 Offline-First**: Works completely offline with local storage
- **🔔 Cross-Device Notifications**: Push notifications across all your devices
- **🌤️ Offline Data Caching**: Weather widget demonstrates offline capabilities
- **⚡ Fast & Responsive**: Optimized performance with service workers
- **🎨 Modern UI**: Beautiful dark theme with Tailwind CSS
- **📝 Rich Note Taking**: Create, edit, delete, and share notes

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd pwa-notes
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Generate VAPID keys for push notifications:

```bash
npm run generate-vapid
```

Add the generated keys to your `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
OPENWEATHER_API_KEY=your_api_key_here  # Optional
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Project Structure

```
pwa-notes/
├── app/
│   ├── actions/           # Server actions for push notifications
│   ├── api/              # API routes (weather, etc.)
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and type definitions
│   ├── layout.tsx       # Root layout with PWA setup
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles
├── public/
│   ├── icons/           # PWA icons (create these)
│   ├── sw.js           # Service worker
│   ├── manifest.json   # PWA manifest
│   └── offline.html    # Offline fallback page
└── ...config files
```

## 🔧 Setup Required Files

### 1. Create PWA Icons

You need to create icons in `/public/icons/`:

- favicon.ico
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

**Quick way**: Use an online PWA icon generator like [PWA Builder](https://www.pwabuilder.com/imageGenerator)

### 2. Get Weather API Key (Optional)

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add it to `.env.local`

Without this, the app will use demo weather data.

## 📱 PWA Features Demo

### Cross-Device Push Notifications

1. Install the app on multiple devices (phone, laptop, etc.)
2. Enable push notifications on each device
3. Create a note on one device
4. Watch notifications appear on all devices instantly!

### Offline Capabilities

1. Turn off your internet connection
2. The app continues to work perfectly
3. Weather widget shows cached data
4. All notes are saved locally
5. Everything syncs when you reconnect

### Installation

1. Visit the app in a modern browser
2. Look for the install banner or browser's install prompt
3. Install it as a native app
4. Launch from your home screen/app drawer

## 🛠️ Development

### Development Mode Fixes

The service worker is configured to:

- Skip caching in development mode
- Auto-refresh on code changes
- Prevent the "stuck cache" issue you experienced

### Building for Production

```bash
npm run build
npm start
```

### Testing PWA Features

1. **Test offline**: Use browser dev tools → Network → Offline
2. **Test notifications**: Use the "Enable Push" and "Test Notification" buttons
3. **Test installation**: Use browser dev tools → Application → Manifest

## 🌐 Deployment

Deploy to any platform that supports Next.js:

- **Vercel**: `vercel deploy` (easiest)
- **Netlify**: Connect your git repo
- **Railway**: `railway deploy`
- **Your own server**: Build and run with Node.js

### Environment Variables in Production

Make sure to set these in your deployment platform:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `OPENWEATHER_API_KEY` (optional)

## 🔍 Key Components

### Service Worker (`public/sw.js`)

- Handles offline caching
- Manages push notifications
- Provides offline fallback pages
- Smart development/production mode detection

### Push Notifications (`app/actions/push-actions.ts`)

- Server actions for cross-device notifications
- VAPID key authentication
- Subscription management
- Broadcast to all devices

### Storage Management (`app/lib/storage.ts`)

- Local storage abstraction
- Note CRUD operations
- Weather data caching
- Data persistence utilities

### Hooks (`app/hooks/`)

- `useOnlineStatus`: Detect online/offline state
- `usePushNotifications`: Push notification management
- `useLocalStorage`: Reactive local storage

## 🚨 Troubleshooting

### Service Worker Issues in Development

If you're stuck with cached content:

1. **Chrome DevTools Method**:

   - F12 → Application → Service Workers
   - Click "Unregister" next to your SW
   - Refresh the page

2. **Clear Everything**:

   - F12 → Application → Storage
   - Click "Clear storage" → "Clear site data"

3. **Hard Refresh**:
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

### Push Notifications Not Working

1. **Check VAPID Keys**: Make sure they're correctly set in environment variables
2. **HTTPS Required**: Push notifications only work over HTTPS (except localhost)
3. **Permission Denied**: User must grant notification permission
4. **Browser Support**: Ensure you're using a modern browser

### App Not Installing

1. **Manifest Issues**: Check browser console for manifest errors
2. **HTTPS Required**: PWAs require HTTPS to install (except localhost)
3. **Missing Icons**: Ensure all required icon sizes are present
4. **Service Worker**: Must have a registered service worker

## 🧪 Testing Checklist

### Basic Functionality

- [ ] Create, edit, delete notes
- [ ] Notes persist on page refresh
- [ ] App works without internet
- [ ] Weather widget shows cached data offline

### PWA Features

- [ ] Install banner appears
- [ ] App installs successfully
- [ ] App works when launched from home screen
- [ ] Offline page appears when needed

### Push Notifications

- [ ] Push registration works
- [ ] Test notification works
- [ ] Cross-device notifications work
- [ ] Notifications appear when app is closed
