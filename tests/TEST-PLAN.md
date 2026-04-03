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
| 1.5 | Onboarding | Completes with valid water goal | Step 2, weight = 70, height = 170 | Click Apply | Overlay fades, onboarded flag saved, water-goal saved, water interval adjusted | E2E |
| 1.6 | Onboarding | Skip saves onboarded flag without water goal | On step 2 | Click Skip | Overlay closes, no water-goal key in localStorage | E2E |
| 1.7 | Onboarding | Live preview updates on weight input | Step 2, valid weight | Type weight | Recommendation text updates immediately | E2E |
| 1.8 | Onboarding | Language switch updates all onboarding text | Onboarding open | Click EN / VI | All onboarding strings update | E2E |
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

## Automated unit tests (Jest)

Run: `npm test`
File: `tests/utils.test.js`
Covers: `calcWaterGoal`, `formatTime`, `calcSuggestedWaterInterval`, `clampInterval`, `parseStats`
