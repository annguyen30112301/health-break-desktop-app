# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install   # Install dependencies
npm start     # Run the Electron app (executes: electron .)
```

There are no test or lint scripts configured.

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
