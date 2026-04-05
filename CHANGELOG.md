# Changelog

All notable changes to HealthBreak will be documented in this file.

---

## [1.1.1] - 2026-04-05

### Hotfix

#### Settings Panel
- **Gear button (⚙)** added to header next to Stats button — opens a dedicated Settings panel
- Settings panel slides in from the right, contains: Auto-launch, Cloud Sync, Account, Feedback
- Replaced the previous collapsible section below reminder cards

#### Auto-Update
- **Automatic update checking** via `electron-updater` — checks on launch and every 4 hours (packaged builds only)
- Update available → **green banner** appears with download progress
- Once downloaded → **"Restart & Update"** button applies the new version instantly
- Fully localized (EN/VI)

#### macOS Gatekeeper Fix
- `hardenedRuntime: true` + entitlements plist added to macOS build config — required for notarization
- `scripts/notarize.js` — afterSign hook auto-notarizes when `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID` env vars are set
- `scripts/install-mac.command` — helper script users can double-click to remove quarantine on non-notarized builds
- New `build:mac:notarize` npm script for notarized production builds

---

## [1.1.0] - 2026-04-04

### New Features

#### Statistics Dashboard (Sprint 1)
- **Stats button** in main window opens an interactive dashboard in the default browser
- **30-day history** — confirm/skip actions recorded daily in `localStorage`; history preserved across restarts
- **SVG bar charts** for water intake (ml/day), eye rest (min/day), and exercise (sessions + min/day)
- **7/30-day toggle** — re-renders charts without page reload
- **Skip rate** — per-reminder-type skip percentage displayed inline; shows "—" when no data
- **Full EN/VI localization** — dashboard renders in the active app language

#### Google Sign-In & Cloud Sync (Sprint 2)
- **Google OAuth** — optional sign-in via PKCE + loopback redirect (`http://127.0.0.1:{port}`); no custom URI scheme required
- **Online / Offline mode** — badge in auth card shows current sync state
- **Firestore settings sync** — intervals and toggles written to `users/{uid}/settings` on every change; restored on new device sign-in
- **Token persistence** — refresh token stored with `safeStorage.encryptString`; session restored silently on relaunch
- **Migration dialog** — first sign-in with local data prompts: sync to cloud or start fresh
- **Restore dialog** — fresh device with cloud data prompts: restore from cloud or keep local defaults

#### Community & Admin (Sprint 3)
- **History sync** — daily confirm/skip history written to `users/{uid}/history/{date}` in Firestore
- **Analytics aggregates** — `FieldValue.increment` counters in `analytics/daily/{date}` per reminder type (confirms, skips, DAU)
- **Feedback form** — signed-in users can send 1–500 character feedback; stored in `feedback/{autoId}` collection
- **Account card** — shows email address and account join date
- **Account deletion** — removes all Firestore user data + Firebase Auth account; returns to Offline mode
- **Onboarding step 3** — privacy notice before optional Google sign-in; 3-dot progress indicator
- **Avatar** — header shows email initial circle when signed in

### Security
- Replace dynamic `require(\`./locales/\${lang}\`)` with static locale map (eliminates dynamic path in require)
- Temp dashboard file now uses randomized directory (`fs.mkdtempSync`) with mode `0o600` instead of fixed filename
- IPC listeners guarded with `removeAllListeners` before registration to prevent listener accumulation on reload
- OAuth state token comparison now uses `crypto.timingSafeEqual` to prevent timing-based CSRF attacks

### Fixed
- `firebase-delete-account` and `firebase-submit-feedback` IPC handlers were inside `catch` block — only ran when Firebase init *failed*. Moved to `try` block.
- DAU analytics used unstable Electron `WebContents.id`; now uses Firebase `uid`
- Missing `signOut(auth)` call after account deletion left stale auth state
- No client-side feedback length limit — text > 500 chars now rejected before IPC call

### Tests
- 72 unit tests across `utils.test.js` (43) and `auth.test.js` (29)
- `auth.test.js` covers `generatePKCE`, `buildGoogleAuthUrl`, `parseCallbackUrl`
- TEST-PLAN.md expanded to 90+ test cases (E2E + unit) for all 3 sprints

---

## [1.0.1] - 2026-04-02

### New Features

#### Popup Interactions
- Replaced the close (✕) button with two action buttons: **"Confirm done"** and **"Skip this time"**
- Skipping is blocked after two consecutive skips — the skip button is hidden until the user confirms at least once
- Colored accent bar at the top of each popup matches the reminder type (blue · water, green · exercise, orange · eye rest)

#### Daily Stats Tracking
- Each "Confirm done" action increments a per-reminder counter shown on its card
- Stats reset automatically at midnight each day
- Stats persist across app restarts via `localStorage`

#### Water Goal
- New section inside the water card's **Edit** panel to set a personalized daily water target
- Enter height (cm) and weight (kg) → app calculates daily goal (`weight × 35 ml`, rounded to nearest 50 ml) and recommended sessions per day
- Live recommendation preview updates as you type
- Saving the goal auto-applies a suggested reminder interval (sessions spread over 16 active hours, clamped to the valid range)
- Water card stats area shows intake progress: `consumed ml / goal ml today`
- Water popup body is personalised: shows exact ml to drink and how much is left to reach the daily goal

#### First-Run Onboarding
- 2-step onboarding overlay shown on first launch (skipped on all subsequent opens)
- **Step 1 — Welcome**: app intro, EN/VI language switcher
- **Step 2 — Water goal**: height/weight inputs with live recommendation; user can apply or skip
- Applying the goal from onboarding sets the water goal and auto-configures the reminder interval
- Language can be switched during onboarding; UI updates immediately

### Changed
- Version bumped from `1.0.0.1` to `1.0.1` (semantic versioning)

### Fixed
- Language switch buttons in onboarding were blocked by overlapping positioned elements (z-index fix)

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
- Fixed 460×560px window; non-resizable

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
