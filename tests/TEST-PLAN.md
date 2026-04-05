# HealthBreak — Test Plan

## Scope
Manual E2E tests + automated Jest unit tests for pure business logic.
Unit tests run automatically before every build (`npm test` is prepended to `build:win`).

## Test cases

| # | Feature | Test case | Precondition | Steps | Expected result | Type |
|---|---------|-----------|-------------|-------|-----------------|------|
| **ONBOARDING** ||||||||
| 1.1 | Onboarding | Shows onboarding on first run | No `healthbreak-onboarded` in localStorage | Launch app | Onboarding overlay visible, step 1 active | E2E |
| 1.2 | Onboarding | Skips onboarding when already onboarded | `healthbreak-onboarded = 1` | Launch app | Overlay not shown | E2E |
| 1.3 | Onboarding | Navigates to step 2 on "Start" click | On step 1 | Click Start | Step 2 visible, dot 2 active | E2E |
| 1.4 | Onboarding | Blocks "Apply" when weight is invalid | Step 2, weight empty / < 30 / > 200 | Click Apply | Nothing happens, overlay stays | E2E |
| 1.5 | Onboarding | Completes with valid water goal | Step 2, weight = 70, height = 170 | Click Apply | Step 3 shown, dot 3 active | E2E |
| 1.6 | Onboarding | Step 3 privacy notice shown before finish | Step 3 | Read text | Privacy notice visible, two buttons present | E2E |
| 1.7 | Onboarding | "Start without signing in" closes overlay in offline mode | Step 3 | Click "Start without signing in" | Overlay closes, onboarded flag saved, no OAuth prompt | E2E |
| 1.8 | Onboarding | "Got it — let's start!" triggers Google sign-in (if configured) | Step 3, Firebase configured | Click "Got it" | OAuth flow starts; browser opens to Google | E2E |
| 1.9 | Onboarding | Skip (step 2) saves onboarded flag without water goal | On step 2 | Click Skip | Step 3 shown, no water-goal key saved yet | E2E |
| 1.10 | Onboarding | Live preview updates on weight input | Step 2, valid weight | Type weight | Recommendation text updates immediately | E2E |
| 1.11 | Onboarding | Language switch updates all onboarding text | Onboarding open | Click EN / VI | All onboarding strings update | E2E |
| **REMINDER TIMERS** ||||||||
| 2.1 | Timer | Countdown ticks 1 second per tick | Testing mode, interval = 1 min | Watch timer | Counts 01:00 → 00:00, 1 second per step | E2E |
| 2.2 | Timer | Popup fires when timer reaches 0 | Reminder active | Wait for interval | Popup appears bottom-right | E2E |
| 2.3 | Timer | Timer stops when reminder toggled OFF | Reminder active | Toggle OFF | Timer stops, shows static value | E2E |
| 2.4 | Timer | Timer restarts when reminder toggled ON | Reminder OFF | Toggle ON | Timer counts from full interval | E2E |
| 2.5 | Timer | Timer fires when window is hidden | App running | Hide window to tray, wait full interval | Popup appears (backgroundThrottling: false) | E2E |
| 2.6 | Timer | Timer resets after confirm | Popup shown | Click Confirm | Timer resets to full interval | E2E |
| 2.7 | Timer | Timer resets after skip | Popup shown | Click Skip | Timer resets to full interval | E2E |
| **POPUP NOTIFICATION** ||||||||
| 3.1 | Popup | Correct icon, accent color, and content per type | App running | Trigger water / move / eyes popup | Water: 💧 blue; Move: 🏃 green; Eyes: 👁️ orange | E2E |
| 3.2 | Popup | Skip button hidden after last action was skip | Just skipped a popup | Trigger same key again | Skip button not visible | E2E |
| 3.3 | Popup | Skip button reappears after confirm | Just confirmed | Trigger same key | Skip button visible | E2E |
| 3.4 | Popup | Queue badge shows when multiple popups queued | 2+ reminders fire close together | Wait for 2 reminders | Badge "+N reminders waiting" shown | E2E |
| 3.5 | Popup | Next popup shows after dismissing current | 2 popups in queue | Confirm/skip first | Second popup appears immediately | E2E |
| 3.6 | Popup | Popup positioned bottom-right, within screen bounds | Any resolution | Trigger popup | No overflow outside screen | E2E |
| **REMINDER SETTINGS** ||||||||
| 4.1 | Settings | Edit panel expands on Edit click | Main screen | Click Edit on any card | Panel expands, slider visible | E2E |
| 4.2 | Settings | Only one panel expanded at a time | One panel open | Click Edit on different card | Previous closes, new one opens | E2E |
| 4.3 | Settings | Slider clamped to min/max in normal mode | Normal mode | Drag water slider below 20 min | Slider stops at 20 | E2E |
| 4.4 | Settings | Save updates interval and restarts timer | Panel open, slider moved | Click Save | Interval updated, timer resets, desc updated | E2E |
| 4.5 | Settings | Toggle OFF stops timer | Reminder active | Click toggle | Timer stops, toggle shows OFF | E2E |
| 4.6 | Settings | Settings persist across restart | Change interval and toggle | Reload app | Settings unchanged | E2E |
| 4.7 | Settings | Out-of-range stored interval is clamped on load | localStorage interval < min | Launch app | Interval clamped to valid min, no crash | E2E |
| **WATER GOAL** ||||||||
| 5.1 | Water goal | calcWaterGoal returns correct values (weight=70) | — | Unit test | dailyGoal=2450, sessions=10, mlPerSession=245 | Unit |
| 5.2 | Water goal | calcWaterGoal clamps sessions to min 1 | Very low weight | Unit test | sessions ≥ 1 | Unit |
| 5.3 | Water goal | Popup body shows remaining ml | Goal set, confirmed once | Trigger water popup again | Body shows ml consumed and remaining | E2E |
| 5.4 | Water goal | Interval auto-calculates after saving goal | weight=60 | Save in water card | Interval updated, timer resets | E2E |
| 5.5 | Water goal | Suggested interval clamped to valid range | Extreme weight values | Save goal | Interval stays within 20–60 min | E2E |
| **DAILY STATS** ||||||||
| 6.1 | Daily stats | Confirm increments stat counter | Main screen | Confirm popup 3× for water | Stats show correct count on card | E2E |
| 6.2 | Daily stats | Skip does not increment counter | Stats exist | Skip popup | Count unchanged | E2E |
| 6.3 | Daily stats | Stats reset on new day | Today's stats exist | Simulate date change | Stats show 0 | Unit/E2E |
| 6.4 | Daily stats | parseStats returns default on corrupt JSON | Bad JSON in localStorage | Unit test | Returns { date, water:0, move:0, eyes:0 } | Unit |
| 6.5 | Daily stats | parseStats resets when date is stale | Yesterday's date in stored stats | Unit test | Returns fresh zeroed object | Unit |
| 6.6 | Daily stats | Shows ml display when water goal set | Goal set, 2 confirms | View water card | "Xml / Yml" displayed | E2E |
| **TESTING MODE** ||||||||
| 7.1 | Testing mode | Activated by 10 rapid logo clicks | Normal mode | Click logo 10× within 3 s | TESTING MODE badge appears | E2E |
| 7.2 | Testing mode | Click counter resets after 3 s gap | Normal mode | Click 9×, wait >3 s, click once | Testing mode not activated | E2E |
| 7.3 | Testing mode | Slider min lowered to 1 in testing mode | Testing mode active | Open any slider | Min label = 1 | E2E |
| 7.4 | Testing mode | Exit restores normal limits | Testing mode, interval = 2 min | Click Exit testing | Slider min restored, interval clamped if needed | E2E |
| 7.5 | Testing mode | Clear cache removes all data and reloads | Testing mode active | Click Clear cache | App reloads, onboarding shown, settings default | E2E |
| 7.6 | Testing mode | Clear cache keeps language preference | Testing mode, lang = VI | Click Clear cache | After reload app still in Vietnamese | E2E |
| **AUTO-LAUNCH** ||||||||
| 8.1 | Auto-launch | Toggle enables auto-launch | Toggle OFF | Click toggle | Toggle ON, registry updated | E2E |
| 8.2 | Auto-launch | Toggle state correct after restart | Auto-launch enabled | Restart app | Toggle shows ON | E2E |
| 8.3 | Auto-launch | App starts hidden with --hidden flag | Auto-launch enabled | Restart machine or run with --hidden | No window shown, tray icon present | E2E |
| **LOCALIZATION** ||||||||
| 9.1 | Locale | Switch to Vietnamese | App in EN | Click VI | All text updates to Vietnamese | E2E |
| 9.2 | Locale | Switch to English | App in VI | Click EN | All text updates to English | E2E |
| 9.3 | Locale | Language preference persists | Switch to VI | Reload app | App still in Vietnamese | E2E |
| 9.4 | Locale | Popup uses current language | App in VI | Trigger popup | Confirm/skip buttons in Vietnamese | E2E |
| 9.5 | Locale | Tray menu updates on language switch | App running | Switch language, open tray menu | Tray menu labels in new language | E2E |
| **INFO MODAL** ||||||||
| 10.1 | Info modal | Opens with correct content | Main screen | Click ℹ️ on water card | Modal shows 💧, water name, benefits, risks | E2E |
| 10.2 | Info modal | Closes with X button | Modal open | Click close button | Modal closes | E2E |
| 10.3 | Info modal | Closes on backdrop click | Modal open | Click outside modal area | Modal closes | E2E |
| 10.4 | Info modal | Closes on Escape key | Modal open | Press Esc | Modal closes | E2E |
| 10.5 | Info modal | Content updates on language switch | Modal open | Switch language | Modal text changes | E2E |
| **SYSTEM TRAY** ||||||||
| 11.1 | Tray | Icon visible in system tray | — | Launch app | Icon appears in tray | E2E |
| 11.2 | Tray | Single click opens window | Window hidden | Click tray icon | Main window shows and focuses | E2E |
| 11.3 | Tray | Right-click shows context menu | App running | Right-click tray icon | Menu with Open and Quit | E2E |
| 11.4 | Tray | Quit from tray exits app completely | App running | Right-click → Quit | App exits, tray icon gone | E2E |
| 11.5 | Tray | Closing window minimizes to tray | Window open | Click X | Window hidden, app still running | E2E |
| **BUILD & INSTALL** ||||||||
| 12.1 | Build | App name shows "HealthBreak" in Startup Apps | v1.0.2+ build | Enable auto-launch, check Windows Settings → Startup | Displays "HealthBreak" | E2E |
| 12.2 | Build | Publisher shows "Royan Nguyen" in Startup Apps | v1.0.2+ build | Check Windows Settings → Startup | Displays "Royan Nguyen" | E2E |
| 12.3 | Build | Installer completes successfully | .exe installer | Run installer | App installed, desktop shortcut created | E2E |
| **STATISTICS DASHBOARD** _(Sprint 1 — PRD 1)_ ||||||||
| 13.1 | Dashboard | Stats button opens dashboard in browser | History data exists | Click Stats | Default browser opens with embedded HTML dashboard | E2E |
| 13.2 | Dashboard | Dashboard shows correct water intake (ml/day) | 3 confirms × 250ml on 2025-01-01 | Open dashboard | Bar for 2025-01-01 = 750ml | E2E |
| 13.3 | Dashboard | Dashboard shows correct eye rest (min/day) | 4 confirms × 20min on date | Open dashboard | Bar shows 80min | E2E |
| 13.4 | Dashboard | Dashboard shows correct move sessions (count/day) | 2 confirms × 60min on date | Open dashboard | Bar shows 2 times / 120 min | E2E |
| 13.5 | Dashboard | Toggle 7-day / 30-day filters chart correctly | 15 days of history | Toggle to 7 days | Only last 7 bars visible; toggle 30 shows all | E2E |
| 13.6 | Dashboard | Skip rate shows % skipped per reminder type | 5 confirms + 5 skips | Open dashboard | Skip rate = 50% | E2E |
| 13.7 | Dashboard | Skip rate shows "—" when no data | Empty history | Open dashboard | All skip rates display "—" | E2E |
| 13.8 | Dashboard | Dashboard renders in Vietnamese when app is VI | App lang = VI | Open dashboard | All dashboard labels in Vietnamese | E2E |
| 13.9 | Dashboard | Dashboard renders in English when app is EN | App lang = EN | Open dashboard | All dashboard labels in English | E2E |
| 13.10 | Dashboard | appendToHistory keeps max 30 entries | 30-entry history | Add day 31 | History still 30 entries, oldest dropped | Unit |
| 13.11 | Dashboard | appendToHistory replaces entry for same date | Entry exists for today | Append updated today entry | History length unchanged, today's values updated | Unit |
| 13.12 | Dashboard | parseHistory returns [] on corrupt JSON | Bad JSON | Unit test | Returns empty array | Unit |
| 13.13 | Dashboard | Stats card shows count for today | 2 water confirms today | View main screen | "2 glasses confirmed today" | E2E |
| 13.14 | Dashboard | History schema includes confirms + skips + intervalMin per key | Any confirm/skip action | Inspect localStorage history | Each day entry has `{confirms, skips, intervalMin}` per type | E2E |
| 13.15 | Dashboard | Migration: old stats format (no skips) loads without crash | Old `healthbreak-stats` with only counts | Launch app | No error; stats show correctly | E2E |
| **GOOGLE SSO & FIREBASE** _(Sprint 2 — PRD 2)_ ||||||||
| 14.1 | Auth | Sign in button visible when Firebase configured | firebase-config.js present | Launch app | "Sign in with Google" button shown in auth card | E2E |
| 14.2 | Auth | Sign in opens default browser with Google OAuth URL | Sign in button visible | Click "Sign in with Google" | Browser opens accounts.google.com with correct client_id | E2E |
| 14.3 | Auth | OAuth completes and user email shown in auth card | Google account available | Complete sign-in in browser | Badge changes to "Online", email displayed | E2E |
| 14.4 | Auth | Sign-out returns to Offline mode | Signed in | Click Sign out | Badge shows "Offline", email hidden | E2E |
| 14.5 | Auth | parseCallbackUrl extracts code + state correctly | — | Unit test: valid URL | Returns { code, state } | Unit |
| 14.6 | Auth | parseCallbackUrl returns { error } on denied | — | Unit test: URL with error=access_denied | Returns { error: 'access_denied' } | Unit |
| 14.7 | Auth | parseCallbackUrl returns null for invalid URL | — | Unit test: malformed string | Returns null | Unit |
| 14.8 | Auth | parseCallbackUrl returns null when code missing | — | Unit test: URL without code param | Returns null | Unit |
| 14.9 | Auth | generatePKCE produces base64url verifier (≥43 chars) | — | Unit test | verifier matches /^[A-Za-z0-9_-]{43,}$/ | Unit |
| 14.10 | Auth | generatePKCE challenge is SHA256(verifier) base64url | — | Unit test | Re-derive challenge from verifier, compare | Unit |
| 14.11 | Auth | generatePKCE state differs every call | — | Unit test: 100 calls | All state values unique | Unit |
| 14.12 | Auth | buildGoogleAuthUrl includes required params | — | Unit test | URL contains client_id, redirect_uri, code_challenge, state, scope | Unit |
| 14.13 | Auth | OAuth timeout shows error toast after 90s | Sign-in started, no browser action | Wait 90s | Toast "Sign-in failed" shown, button re-enabled | E2E |
| 14.14 | Auth | OAuth loopback server ignores favicon.ico requests | Sign-in started | Browser requests /favicon.ico before /callback | Server does not trigger callback; only real callback fires | E2E |
| 14.15 | Token | Refresh token encrypted via safeStorage | Sign in complete | Inspect userData folder | Token file exists, content is binary (encrypted) | E2E |
| 14.16 | Token | Session restored silently on app relaunch | Signed in, quit app | Relaunch | Auth card shows "Online" + email without re-prompting | E2E |
| 14.17 | Sync | Settings synced to Firestore on change | Signed in | Move water slider, click Save | Firestore users/{uid}/settings updated within 5s | E2E |
| 14.18 | Sync | Settings restored from Firestore on new device | Settings in Firestore, fresh device | Sign in | Sliders match cloud values | E2E |
| 14.19 | Migration | Migration dialog shown on first sign-in with local data | Local settings exist, first sign-in | Sign in | Dialog: "Sync to cloud" or "Start fresh" | E2E |
| 14.20 | Migration | "Sync to cloud" uploads local settings | Migration dialog open | Click Sync | Firestore updated with local settings | E2E |
| 14.21 | Migration | "Start fresh" uses cloud settings (if any) | Migration dialog open | Click Start fresh | Local settings overwritten by cloud (or default) | E2E |
| 14.22 | Mode | Offline mode badge shows when not signed in | Not signed in | View auth card | Badge = "Offline" | E2E |
| 14.23 | Mode | Online mode badge shows when signed in | Signed in | View auth card | Badge = "Online" | E2E |
| **COMMUNITY & ADMIN** _(Sprint 3 — PRD 2 cont.)_ ||||||||
| 15.1 | Stats sync | Confirm writes history entry to Firestore | Signed in | Confirm water popup | Firestore users/{uid}/history/{date} created/updated | E2E |
| 15.2 | Stats sync | Skip also writes updated history entry | Signed in | Skip move popup | Firestore entry updated with incremented skips | E2E |
| 15.3 | Stats sync | Sync is non-blocking (UI not frozen) | Signed in | Confirm popup | UI responds immediately; sync happens in background | E2E |
| 15.4 | Analytics | Confirm increments Firestore analytics/daily/{date}/{key}.confirms | Signed in | Confirm water | analytics/daily/{date}/water.confirms increased by 1 | E2E |
| 15.5 | Analytics | Skip increments analytics/daily/{date}/{key}.skips | Signed in | Skip eyes | analytics/daily/{date}/eyes.skips increased by 1 | E2E |
| 15.6 | Analytics | DAU recorded once per user per day | Signed in, confirm twice | Two confirms same day | Only one DAU entry for uid in analytics/dau/{date} | E2E |
| 15.7 | Analytics | Analytics failures are silent (non-blocking) | Signed in, Firestore offline | Confirm popup | UI still works; no crash or error toast | E2E |
| 15.8 | Feedback | Feedback card visible only when signed in | Not signed in → sign in | Toggle auth | Card hidden when offline, shown when online | E2E |
| 15.9 | Feedback | Feedback dialog opens on button click | Signed in | Click "Write feedback" | Dialog with textarea and counter visible | E2E |
| 15.10 | Feedback | Character counter updates on typing | Dialog open | Type 10 chars | Counter shows "10 / 500" | E2E |
| 15.11 | Feedback | Empty text blocked with toast | Dialog open, empty textarea | Click Send | Toast "Please write at least 1 character" | E2E |
| 15.12 | Feedback | Text > 500 chars blocked with toast | Dialog open, 501-char text | Click Send | Toast "Feedback must be 500 characters or fewer" | E2E |
| 15.13 | Feedback | Successful send writes to Firestore feedback collection | Valid text | Click Send | Firestore feedback/{autoId} doc created with uid, text, lang, platform | E2E |
| 15.14 | Feedback | Dialog closes and toast shown after send | Valid text sent | After send | Dialog closes, "Feedback sent — thank you!" toast | E2E |
| 15.15 | Account UI | Account card shows email and join date | Signed in | View account card | Email correct; joined date formatted | E2E |
| 15.16 | Account UI | Account card hidden when not signed in | Not signed in | View settings | Account card not visible | E2E |
| 15.17 | Account delete | Delete dialog shown on button click | Signed in | Click "Delete account" | Confirmation dialog with warning text appears | E2E |
| 15.18 | Account delete | Cancel closes dialog without deleting | Delete dialog open | Click Cancel | Dialog closes, account still exists | E2E |
| 15.19 | Account delete | Delete removes Firestore data + Auth account | Delete dialog open | Click "Delete permanently" | users/{uid} + subcollections deleted; Firebase Auth account removed | E2E |
| 15.20 | Account delete | After delete, app returns to Offline mode | Delete complete | — | Auth card shows "Offline", account card hidden | E2E |
| 15.21 | Account delete | localStorage cleared after account deletion | Delete complete | Inspect localStorage | All healthbreak-* keys removed | E2E |
| 15.22 | Privacy notice | Step 3 appears in onboarding after step 2 | Onboarding step 2 complete | Click Apply | Step 3 visible with 3 dots, privacy text shown | E2E |
| 15.23 | Privacy notice | 3-dot indicator active on correct step | Onboarding | Navigate steps 1→2→3 | Dot 1 active on step 1, dot 2 on step 2, dot 3 on step 3 | E2E |
| 15.24 | Online polish | Avatar shown in header when signed in | Signed in | View header | Circle with email initial visible | E2E |
| 15.25 | Online polish | Avatar hidden when not signed in | Not signed in | View header | Avatar not visible | E2E |
| 15.26 | Online polish | Avatar updates immediately on sign-in | Not signed in → sign in | Complete OAuth | Avatar appears without page reload | E2E |

| **SETTINGS PANEL** _(Hotfix v1.1.1)_ ||||||||
| 16.1 | Settings panel | Gear button visible in header next to Stats | App loaded | View header | ⚙ button present, not highlighted | E2E |
| 16.2 | Settings panel | Click gear opens settings panel | Panel closed | Click ⚙ | Panel slides in from right, gear button highlighted | E2E |
| 16.3 | Settings panel | Panel shows all 4 settings items | Panel open | View panel | Auto-launch toggle, Cloud Sync, Account (if signed in), Feedback (if signed in) | E2E |
| 16.4 | Settings panel | Back button closes panel | Panel open | Click ← Back / ← Quay lại | Panel slides out, gear button un-highlights | E2E |
| 16.5 | Settings panel | Auto-launch toggle works inside panel | Panel open | Click auto-launch toggle | Toggle state changes, IPC sent to main | E2E |
| 16.6 | Settings panel | Cloud Sync sign-in button works inside panel | Panel open, not signed in | Click Sign in | OAuth flow starts | E2E |
| 16.7 | Settings panel | Account + Feedback cards hidden when not signed in | Not signed in, panel open | View panel | Only auto-launch and cloud sync cards shown | E2E |
| 16.8 | Settings panel | Account + Feedback cards appear after sign-in | Sign in while panel open | Complete OAuth | Cards become visible without reopening panel | E2E |
| 16.9 | Settings panel | Panel text updates on language switch | Panel open | Switch EN ↔ VI | All panel labels update | E2E |
| 16.10 | Settings panel | Panel title correct per language | Panel open in EN / VI | View panel title | EN: "Settings" · VI: "Cài đặt" | E2E |
| **AUTO-UPDATE** _(Hotfix v1.1.1)_ ||||||||
| 17.1 | Auto-update | No update banner on fresh launch (current version) | Packaged app, no newer release | Launch app | Update banner not visible | E2E |
| 17.2 | Auto-update | Update banner appears when new version available | Newer release on GitHub | Launch app (packaged) | Green banner shows "Update available — vX.X.X" | E2E |
| 17.3 | Auto-update | Banner shows download progress | Update downloading | Watch banner | Sub-text shows "Downloading… N%" | E2E |
| 17.4 | Auto-update | Install button disabled while downloading | Download in progress | View install button | Button disabled, shows % | E2E |
| 17.5 | Auto-update | Banner updates to "ready" after download completes | Download complete | Watch banner | Title shows "vX.X.X ready to install", button enabled | E2E |
| 17.6 | Auto-update | Install button triggers restart | Update downloaded, click Install | Click "Restart & Update" | App quits and relaunches with new version | E2E |
| 17.7 | Auto-update | Dismiss (✕) hides banner | Banner visible | Click ✕ | Banner hidden | E2E |
| 17.8 | Auto-update | Update check skipped in dev mode | Run via `npm start` | Launch | No update check triggered (isPackaged = false) | E2E |
| 17.9 | Auto-update | Update banner text in Vietnamese | App in VI, update available | View banner | Banner text in Vietnamese | E2E |
| **MACOS NOTARIZATION** _(Hotfix v1.1.1)_ ||||||||
| 18.1 | macOS build | App opens without quarantine error when notarized | Build with APPLE_ID + APPLE_TEAM_ID set | Install DMG, launch app | App opens normally, no "damaged" or "unidentified developer" dialog | E2E |
| 18.2 | macOS build | `install-mac.command` removes quarantine | Non-notarized build | Double-click install-mac.command after install | App opens normally after script runs | E2E |
| 18.3 | macOS build | Hardened runtime enabled in built binary | Run `codesign -dv` on app | Build with `build:mac` | Output includes `hardened-runtime=1` | E2E |
| 18.4 | macOS build | Notarize step skipped when env vars absent | Build without APPLE_ID env | Run `build:mac` | Build completes, console shows "Notarization skipped" | E2E |
| 18.5 | macOS build | Notarize step runs when env vars present | APPLE_ID + APPLE_APP_SPECIFIC_PASSWORD + APPLE_TEAM_ID set | Run `build:mac:notarize` | Console shows "Notarizing…" and "Notarization complete." | E2E |

---

## Automated unit tests (Jest)

Run: `npm test`

### `tests/utils.test.js` — Pure business logic
Covers: `calcWaterGoal`, `formatTime`, `calcSuggestedWaterInterval`, `clampInterval`, `parseStats`, `parseHistory`, `appendToHistory`

| Test | Function | What it checks |
|------|----------|----------------|
| calcWaterGoal — weight 70kg | `calcWaterGoal` | dailyGoal=2450, sessions=10, mlPerSession=245 |
| calcWaterGoal — stores weight | `calcWaterGoal` | result.weight === input |
| calcWaterGoal — rounds to 50ml | `calcWaterGoal` | dailyGoal % 50 === 0 |
| calcWaterGoal — sessions ≥ 1 | `calcWaterGoal` | extreme low weight |
| calcWaterGoal — 30kg | `calcWaterGoal` | dailyGoal=1050 |
| calcWaterGoal — 200kg | `calcWaterGoal` | dailyGoal=7000, sessions=28 |
| calcWaterGoal — mlPerSession integer | `calcWaterGoal` | Number.isInteger |
| formatTime — 0s | `formatTime` | "00:00" |
| formatTime — 60s | `formatTime` | "01:00" |
| formatTime — pads seconds | `formatTime` | "00:09" |
| formatTime — 90min | `formatTime` | "90:00" |
| calcSuggestedWaterInterval — clamp max | `calcSuggestedWaterInterval` | 1 session → 60 |
| calcSuggestedWaterInterval — clamp min | `calcSuggestedWaterInterval` | 100 sessions → 20 |
| calcSuggestedWaterInterval — in range | `calcSuggestedWaterInterval` | 32 sessions → 30 |
| clampInterval — within range | `clampInterval` | unchanged |
| clampInterval — below min | `clampInterval` | returns min |
| clampInterval — above max | `clampInterval` | returns max |
| clampInterval — rounds float | `clampInterval` | 19.7 → 20 |
| parseStats — null raw | `parseStats` | zeroed stats |
| parseStats — corrupt JSON | `parseStats` | zeroed stats |
| parseStats — stale date | `parseStats` | zeroed with today date |
| parseStats — matching date | `parseStats` | returns stored values |
| parseHistory — null | `parseHistory` | [] |
| parseHistory — corrupt JSON | `parseHistory` | [] |
| parseHistory — not array | `parseHistory` | [] |
| parseHistory — valid JSON | `parseHistory` | parsed array |
| appendToHistory — new entry | `appendToHistory` | length +1 |
| appendToHistory — replace same date | `appendToHistory` | length unchanged, values updated |
| appendToHistory — max 30 entries | `appendToHistory` | oldest dropped |

### `tests/auth.test.js` — PKCE & OAuth helpers
Covers: `generatePKCE`, `buildGoogleAuthUrl`, `parseCallbackUrl`

| Test | Function | What it checks |
|------|----------|----------------|
| generatePKCE — verifier length | `generatePKCE` | ≥43 chars |
| generatePKCE — verifier base64url | `generatePKCE` | matches /^[A-Za-z0-9_-]+$/ |
| generatePKCE — challenge is SHA256 of verifier | `generatePKCE` | re-derive and compare |
| generatePKCE — unique verifiers each call | `generatePKCE` | 10 calls all different |
| generatePKCE — unique states each call | `generatePKCE` | 10 calls all different |
| buildGoogleAuthUrl — contains client_id | `buildGoogleAuthUrl` | param present |
| buildGoogleAuthUrl — contains redirect_uri | `buildGoogleAuthUrl` | param matches input |
| buildGoogleAuthUrl — contains code_challenge | `buildGoogleAuthUrl` | S256 method |
| buildGoogleAuthUrl — contains state | `buildGoogleAuthUrl` | param matches input |
| buildGoogleAuthUrl — correct base URL | `buildGoogleAuthUrl` | starts with accounts.google.com |
| parseCallbackUrl — valid code+state | `parseCallbackUrl` | returns { code, state } |
| parseCallbackUrl — error param | `parseCallbackUrl` | returns { error: 'access_denied' } |
| parseCallbackUrl — missing code | `parseCallbackUrl` | returns null |
| parseCallbackUrl — missing state | `parseCallbackUrl` | returns null |
| parseCallbackUrl — malformed URL | `parseCallbackUrl` | returns null |
| parseCallbackUrl — empty string | `parseCallbackUrl` | returns null |
