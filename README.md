# 🥭 Mango

Find your perfect movie. Grab some dried mango and let's go.

## Features

- Mood-based movie recommendations powered by AI
- User profiles with genre preferences and hard limits  
- "Seen It" swap - get a new pick without redoing the quiz
- Real critic reviews from Rotten Tomatoes, IMDB
- Community ratings with 🥭 mangos
- Cast, director, and runtime for every pick

## PWA (Progressive Web App)

This app can be installed on your phone's home screen:

**iPhone:**
1. Open the site in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

**Android:**
1. Open the site in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen" or "Install app"

Once installed, it opens fullscreen like a native app.

## Setup

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

## Deploy

```bash
vercel
```

Add `ANTHROPIC_API_KEY` as an environment variable.

## Convert to Native App (Later)

When ready for the App Store:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init
npx cap add ios
npx cap open ios
```

Same code, just wrapped for native distribution.
