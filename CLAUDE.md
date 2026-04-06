# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm start          # Run the Electron app (executes: electron .)
npm test           # Run Jest test suite
npm run build:win  # Build Windows installer (runs tests first)
npm run build:mac  # Build macOS DMG (must run on macOS)
```

## First-time Setup

`src/firebase-config.js` is gitignored and must be created manually:

```js
'use strict';
module.exports = {
  firebase: {
    apiKey:            'YOUR_API_KEY',
    authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
    projectId:         'YOUR_PROJECT_ID',
    storageBucket:     'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId:             'YOUR_APP_ID',
  },
  googleClientId:     'YOUR_CLIENT_ID.apps.googleusercontent.com',
  googleClientSecret: 'YOUR_CLIENT_SECRET',
};
```

Get values from:
- **Firebase credentials**: Firebase Console → Project Settings → Your Apps → SDK setup
- **Google OAuth**: Google Cloud Console → APIs & Services → Credentials → Desktop app client

## Build Process

Before running the build, complete these steps in order:

**Step 1 — Test coverage check (manual)**
For any new logic added since the last release:
- Check `tests/auth.test.js` and `tests/utils.test.js` for existing coverage
- Testable units: pure functions exported from `src/auth.js` and `src/utils.js`
- Non-testable (skip): renderer logic in `index.html`, Firebase/IPC calls
- If coverage is missing → add test cases to the relevant test file first
- If already covered → skip

**Step 2 — Build**
`npm run build:win` runs these steps automatically:
1. `npm test` — all Jest tests must pass
2. `scripts/setup-wincodecsign.js` — cache Windows code signing tools
3. `electron-builder --win` — produce `dist/HealthBreak Setup X.Y.Z.exe`

Output: `dist/HealthBreak Setup <version>.exe` + `.blockmap`

## Pre-merge Hook

A Claude Code hook runs `scripts/pre-merge-check.js` before every `git push`. It requires `REVIEW_REPORT.md` to exist with verdict **APPROVED** or **APPROVED WITH NOTES**.

Run `/review-code` to generate `REVIEW_REPORT.md` before pushing.

`REVIEW_REPORT.md` is gitignored — must be generated on each machine.

## Architecture

HealthBreak is an Electron desktop app that delivers periodic health reminders (drink water, light exercise, eye rest) via system tray and popup notifications.

### Process Structure

**Main process (`main.js`)** — Node.js environment:
- Creates the main `BrowserWindow` (singleton) and system tray icon
- Spawns temporary `BrowserWindow` instances for popup notifications
- Manages a popup queue to stack multiple concurrent reminders
- Handles IPC from the renderer (e.g., `show-popup`, `close-popup`)
- Registers Windows auto-launch at startup via `app.setLoginItemSettings`

**Renderer processes** — browser environment:
- `index.html` — Main settings UI; manages three reminder timers, reads/writes config via `localStorage`, generates audio via Web Audio API, sends IPC messages to main process
- `popup.html` — Minimal bottom-right notification popup displayed by main process

### IPC Communication

Renderer → Main via `ipcRenderer.send`; Main → Renderer via `win.webContents.send`. The security configuration uses `nodeIntegration: true` / `contextIsolation: false`, so both processes share Node.js APIs directly.

### Reminder Configuration

Three reminders are defined with interval constraints in `index.html`:

| Reminder | Default | Normal range | Testing range |
|----------|---------|--------------|---------------|
| Drink water | 30 min | 20–60 min | 1–60 min |
| Light exercise | 60 min | 45–90 min | 1–90 min |
| Eye rest | 20 min | 15–30 min | 1–30 min |

**Testing mode** — activated by clicking the logo 10 times rapidly — lowers minimums to 1 minute. Controlled by the `TESTING_MODE_ENABLED` flag in `index.html`.

### Persistence

All user settings (intervals, enabled/disabled toggles, testing mode state) are stored in `localStorage` within the renderer process. `main.js` holds no persistent state across app restarts.

### Firebase / Auth

- `src/firebase.js` — initializes Firebase app, exports auth/db helpers and `IS_CONFIGURED` flag
- `src/auth.js` — PKCE OAuth helpers: `generatePKCE`, `buildGoogleAuthUrl`, `exchangeCodeForTokens`, `parseCallbackUrl`, `refreshAccessToken`
- Google OAuth flow: renderer starts local HTTP server → opens browser → receives callback → exchanges code for tokens → signs into Firebase with credential
- Anonymous auth: used for feedback submission without login; anonymous users are excluded from migration dialog and account UI
