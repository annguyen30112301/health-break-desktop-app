# 💚 HealthBreak

> 🇺🇸 English | [🇻🇳 Tiếng Việt](#-tiếng-việt)

A desktop app that delivers periodic health reminders while you work at the computer, built with **Electron**. Runs quietly in the system tray and shows non-intrusive popups in the bottom-right corner of your screen.

---

## Features

### Health Reminders

| Reminder | Default | Adjustable range | Prompt |
|---|---|---|---|
| 💧 Drink Water | 30 min | 20 – 60 min | Have a glass (~250ml) |
| 🏃 Light Exercise | 60 min | 45 – 90 min | Stand up and walk for 5 min |
| 👁️ Eye Rest | 20 min | 15 – 30 min | 20-20-20 rule |

- **Toggle each reminder** on/off independently
- **Customize the interval** with a slider — saved instantly and restarts the countdown
- **Live countdown timer** shown for each reminder
- **Distinct sound alerts** for each reminder type

### Popup Notifications

- Appears in the bottom-right corner without stealing focus
- **Queue system** — multiple simultaneous reminders are shown one at a time
- Badge shows how many reminders are waiting in the queue
- Timer pauses while a popup is waiting for acknowledgement

### System Tray

- Closing the main window hides it to the tray (app keeps running)
- Click the tray icon to reopen the settings window
- Right-click menu: **Open HealthBreak** / **Quit**

### Launch at Login

- Toggle **"Launch with Windows"** from the settings UI
- When enabled: starts silently in the background without opening a window

### Language Support 🌐

Switch between **English** (default) and **Tiếng Việt** using the **EN / VI** buttons in the top-right corner of the app. The preference is saved and restored on next launch.

All strings (UI labels, popup messages, tray menu) are defined in `locales/en.js` and `locales/vi.js` — easy to update or extend with additional languages.

### Testing Mode _(hidden)_

Click the 💚 logo **10 times** within 3 seconds to activate. Lowers the minimum interval to 1 minute for quick testing without waiting through full cycles.

---

## Requirements

- **Node.js** ≥ 12.20
- **npm** ≥ 7

---

## Install & Run

```bash
# Install dependencies
npm install

# Run in development mode
npm start
```

---

## Build & Package

Output goes to the `dist/` folder.

### Windows

```bash
# Build a Windows installer (.exe) for x64
npm run build:win
```

Output: `dist/HealthBreak Setup 1.0.0.exe`

> **Note:** The build script automatically handles the `winCodeSign` symlink issue on Windows.
> The first build will take extra time to download the required tools.

```bash
# Build unpacked folder only — useful for quick testing without an installer
npm run build:win:dir
```

Output: `dist/win-unpacked/HealthBreak.exe` _(runs directly, no installation needed)_

### macOS

```bash
# Build a .dmg — supports both Intel (x64) and Apple Silicon (arm64)
npm run build:mac
```

Output: `dist/HealthBreak-1.0.0.dmg`

> **Note:** `build:mac` must be run on a macOS machine.

---

## Command Reference

| Command | Description |
|---|---|
| `npm start` | Run the app in development mode |
| `npm run build:win` | Build Windows installer (.exe) |
| `npm run build:win:dir` | Build unpacked folder (no installer, quick test) |
| `npm run build:mac` | Build macOS DMG _(requires macOS)_ |
| `npm run setup:wincodecsign` | Pre-cache winCodeSign tools _(called automatically on Windows builds)_ |

---

## Project Structure

```
HealthBreak/
├── main.js            # Main process — tray, popup queue, IPC, auto-launch
├── index.html         # Renderer — settings UI, timers, localStorage
├── popup.html         # Renderer — bottom-right notification popup
├── locales/
│   ├── en.js          # English strings
│   └── vi.js          # Vietnamese strings
├── app-icon.png       # Application icon
├── tray-icon.png      # System tray icon
├── scripts/
│   └── setup-wincodecsign.js  # Windows build workaround (symlink fix)
├── package.json
└── dist/              # Build output (auto-generated, not committed)
```

---

## Adding a New Language

1. Copy `locales/en.js` to `locales/xx.js` (where `xx` is the language code)
2. Translate all string values (keep the object structure intact)
3. Add a button in `index.html` inside `.lang-switcher`:
   ```html
   <button id="btn-lang-xx" class="lang-btn" onclick="setLanguage('xx')">XX</button>
   ```
4. Add `document.getElementById('btn-lang-xx').classList.toggle('active', currentLang === 'xx')` inside `applyLocale()` in `index.html`

---

## Settings Storage

All user preferences (reminder intervals, on/off toggles, language) are stored in the renderer's **`localStorage`** — no external config files, no filesystem writes required.

---

---

## 🇻🇳 Tiếng Việt

Ứng dụng desktop nhắc nhở sức khỏe khi làm việc với máy tính, xây dựng bằng **Electron**. Chạy âm thầm dưới system tray, hiển thị popup góc phải màn hình đúng giờ.

### Tính năng

| Nhắc nhở | Mặc định | Khoảng thay đổi | Nội dung |
|---|---|---|---|
| 💧 Uống nước | 30 phút | 20 – 60 phút | Uống 1 ly nước (~250ml) |
| 🏃 Vận động nhẹ | 60 phút | 45 – 90 phút | Đứng dậy đi lại 5 phút |
| 👁️ Nghỉ mắt | 20 phút | 15 – 30 phút | Quy tắc 20-20-20 |

- Bật/tắt từng nhắc nhở độc lập, tùy chỉnh chu kỳ bằng slider
- Đồng hồ đếm ngược cho từng nhắc nhở, âm thanh thông báo riêng biệt
- Popup xếp hàng, chạy nền qua system tray, tự khởi động cùng Windows
- **Hỗ trợ đa ngôn ngữ** — nhấn **EN / VI** để chuyển ngôn ngữ; chuỗi được định nghĩa trong `locales/vi.js`

### Cài đặt & Chạy

```bash
npm install   # Cài dependencies
npm start     # Chạy app
```

### Build

```bash
npm run build:win      # Windows installer (.exe)
npm run build:win:dir  # Thư mục unpacked (test nhanh)
npm run build:mac      # macOS DMG (chạy trên macOS)
```
