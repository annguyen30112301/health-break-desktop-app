# Changelog

All notable changes to HealthBreak will be documented in this file.

---

## [1.0.1] - 2026-04-02

### Changed
- Updated version from `1.0.0.1` to `1.0.1` to follow semantic versioning

---

## [1.0.0] - Initial Release

### Health Reminders

- **Drink Water** — reminds every 30 min (range: 20–60 min) to drink ~250ml of water; distinct audio alert (520Hz, 2 pulses)
- **Light Exercise** — reminds every 60 min (range: 45–90 min) to stand up and walk for 5 minutes; distinct audio alert (440Hz, 3 pulses)
- **Eye Rest** — reminds every 20 min (range: 15–30 min) to follow the 20-20-20 rule; distinct audio alert (660Hz, 1 pulse)

### Reminder Management

- Per-reminder enable/disable toggle
- Interval customization via slider; changes save instantly
- Live countdown timer (MM:SS) per reminder, updates in real-time
- Expandable card edit mode with smooth animations
- Save & restart — saves interval and restarts countdown immediately

### Notifications & Popup System

- Non-intrusive bottom-right popup notifications (no focus steal)
- Popup queue — multiple simultaneous reminders shown one at a time
- Queue badge showing number of waiting reminders
- Timer pauses while popup is displayed; resumes on close
- Dismiss popup with X button
- Smooth slide-in animation (0.25s) for popups

### System Tray

- App minimizes to system tray instead of closing
- Click tray icon to show/focus or toggle window visibility
- Right-click tray context menu: "Open HealthBreak" and "Quit"
- Tray tooltip: "HealthBreak — running in background"

### Auto-Launch & Persistence

- "Launch with Windows" toggle to start app automatically on login
- Silent background start when launched at login (no window shown)
- All settings persisted via `localStorage` (intervals, toggles, language)
- Auto-launch state synced with OS login settings via Electron API

### Localization

- Full English (EN) and Vietnamese (VI) localization
- EN/VI language switcher in header; selection persists across restarts
- All UI strings, health benefits, and risk descriptions translated in both languages

### Health Information Modal

- Info (i) button on each reminder card opens a modal with benefits and risks
- Color-coded sections for benefits and risks; formatted lists
- Close via X button, Escape key, or clicking the backdrop

### User Interface

- Card-based layout with three reminder cards
- Status bar showing active reminder count or "All reminders are off"
- Fixed 460×300px window; non-resizable

### Testing Mode

- Activate by clicking the logo 10 times within 3 seconds
- Lowers minimum intervals to 1 minute for all reminders
- Visual badge indicator with animated dot while active
- Exit button in badge; auto-resets intervals below normal minimum on exit

### Build & Distribution

- Windows NSIS installer build (`npm run build:win`)
- Windows portable/unpacked build (`npm run build:win:dir`)
- macOS DMG build supporting Intel x64 and Apple Silicon arm64 (`npm run build:mac`)
- Windows code signing workaround with automatic symlink setup
- Electron Builder integration for multi-platform distribution
