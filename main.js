const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen, shell, safeStorage } = require('electron')
const path = require('path')
const os   = require('os')
const fs   = require('fs')

app.setName('HealthBreak')

// Register custom URI scheme for Google OAuth callback BEFORE app is ready
// healthbreak://oauth/callback?code=xxx&state=yyy
const PROTOCOL = 'healthbreak'
if (process.defaultApp) {
  // Running via `electron .` — register for the current executable
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL)
}

// Default locale — renderer sends 'set-language' on load to sync
let currentLocale = require('./locales/en.js')

let mainWindow
let tray
let popupWindow = null
let popupQueue = []   // hàng đợi các popup chưa hiển thị
let isShowingPopup = false
const lastSkipped = {}  // tracks whether the last action per key was a skip

// ── OAuth callback forwarding ─────────────────────────────────────────────────
// When the OS opens the app with a healthbreak:// URL, forward it to the renderer.
function handleOAuthCallback(url) {
  if (!url || !url.startsWith(`${PROTOCOL}://`)) return
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (!mainWindow.isVisible()) mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('oauth-callback', url)
  }
}

// macOS: app re-activated with the URL
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleOAuthCallback(url)
})

// Windows / Linux: second instance launched with the URL in argv
app.on('second-instance', (event, argv) => {
  const url = argv.find(arg => arg.startsWith(`${PROTOCOL}://`))
  if (url) handleOAuthCallback(url)
  // Bring main window to foreground
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
})
// ─────────────────────────────────────────────────────────────────────────────

// Ensure only one instance runs (required for second-instance event on Windows)
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 460,
    height: 560,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      autoplayPolicy: 'no-user-gesture-required',
      backgroundThrottling: false
    },
    title: 'HealthBreak',
    icon: path.join(__dirname, 'app-icon.png')
  })

  mainWindow.loadFile('index.html')
  // Nếu khởi động tự động → ẩn cửa sổ, chỉ chạy nền
  if (process.argv.includes('--hidden')) {
    mainWindow.once('ready-to-show', () => mainWindow.hide())
  }
  mainWindow.setMenuBarVisibility(false)

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow.hide()
  })
}

// ── Tray ─────────────────────────────────────────────────────────────────────
function updateTrayMenu() {
  if (!tray) return
  const loc = currentLocale.tray
  tray.setToolTip(loc.tooltip)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: loc.open, click: () => { mainWindow.show(); mainWindow.focus() } },
    { type: 'separator' },
    { label: loc.quit, click: () => { app.exit(0) } },
  ]))
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'))
  tray = new Tray(icon)
  updateTrayMenu()
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show()
  })
}
// ─────────────────────────────────────────────────────────────────────────────

function setAutoLaunch(enable) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe'),
    args: ['--hidden']  // khởi động ẩn, không hiện cửa sổ
  })
}

function getAutoLaunch() {
  return app.getLoginItemSettings({ args: ['--hidden'] }).openAtLogin
}

function destroyPopup() {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.destroy()
  }
  popupWindow = null
}

function showNextPopup() {
  if (popupQueue.length === 0) {
    isShowingPopup = false
    return
  }

  isShowingPopup = true
  const data = popupQueue.shift()

  // Đính kèm số lượng còn trong queue và trạng thái có thể bỏ qua
  data.queueCount    = popupQueue.length
  data.queueBadge    = popupQueue.length > 0 ? currentLocale.popup.queueBadge(popupQueue.length) : ''
  data.canSkip       = !lastSkipped[data.key]

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // Chiều cao phụ thuộc vào việc nút "bỏ qua" có hiển thị không
  const popupHeight = data.canSkip ? 162 : 128

  const win = new BrowserWindow({
    width: 300,
    height: popupHeight,
    x: width - 316,
    y: height - popupHeight - 16,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  popupWindow = win

  win.loadFile('popup.html')

  win.webContents.on('did-finish-load', () => {
    if (win === popupWindow && !win.isDestroyed()) {
      win.webContents.send('popup-data', data)
    }
  })

  win.on('closed', () => {
    if (win === popupWindow) popupWindow = null
  })
}

// Thêm vào hàng đợi, nếu không có popup nào đang hiển thị thì show luôn
function enqueuePopup(data) {
  // Tạm dừng timer của key này
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('pause-timer', data.key)
  }

  popupQueue.push(data)

  if (!isShowingPopup) {
    showNextPopup()
  }
}

ipcMain.on('show-popup', (event, data) => {
  enqueuePopup(data)
})

// User bấm "Xác nhận đã thực hiện" — ghi nhận stat, reset timer
ipcMain.on('confirm-popup', (event, key) => {
  lastSkipped[key] = false
  destroyPopup()
  if (key && mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    mainWindow.webContents.send('popup-confirmed', key)
    mainWindow.webContents.send('popup-closed', key)
  }
  showNextPopup()
})

// User bấm "Bỏ qua lần này" — đóng popup, không ghi nhận stat
ipcMain.on('skip-popup', (event, key) => {
  lastSkipped[key] = true
  destroyPopup()
  if (key && mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    mainWindow.webContents.send('popup-closed', key)
    mainWindow.webContents.send('popup-skipped', key)
  }
  showNextPopup()
})

ipcMain.on('set-auto-launch', (event, enable) => {
  setAutoLaunch(enable)
})

ipcMain.handle('get-auto-launch', () => {
  return getAutoLaunch()
})

// Renderer sends this on startup and whenever the user switches language
ipcMain.on('open-dashboard', (event, { history, lang, loc }) => {
  try {
    const { generateDashboardHTML } = require('./src/dashboard.js')
    const html     = generateDashboardHTML(history, lang, loc)
    const tmpFile  = path.join(os.tmpdir(), 'healthbreak-stats.html')
    fs.writeFileSync(tmpFile, html, 'utf8')
    shell.openExternal(`file://${tmpFile}`)
  } catch (e) {
    console.error('Dashboard generation failed:', e)
  }
})

ipcMain.on('set-language', (event, lang) => {
  if (!['en', 'vi'].includes(lang)) return
  try {
    currentLocale = require(`./locales/${lang}.js`)
  } catch {
    currentLocale = require('./locales/en.js')
  }
  updateTrayMenu()
})

// ── OAuth: open system browser with auth URL ──────────────────────────────────
ipcMain.on('open-auth-browser', (event, authUrl) => {
  shell.openExternal(authUrl)
})

// ── safeStorage: encrypted token persistence ──────────────────────────────────
// Tokens are stored in: <userData>/healthbreak-token.enc
// safeStorage uses OS-level encryption (Keychain / DPAPI / libsecret).

const TOKEN_PATH = path.join(app.getPath('userData'), 'healthbreak-token.enc')

ipcMain.handle('safe-storage-get', () => {
  try {
    if (!fs.existsSync(TOKEN_PATH)) return null
    if (!safeStorage.isEncryptionAvailable()) return null
    const encrypted = fs.readFileSync(TOKEN_PATH)
    return safeStorage.decryptString(encrypted)
  } catch {
    return null
  }
})

ipcMain.handle('safe-storage-set', (event, plaintext) => {
  try {
    if (!safeStorage.isEncryptionAvailable()) return false
    const encrypted = safeStorage.encryptString(plaintext)
    fs.writeFileSync(TOKEN_PATH, encrypted)
    return true
  } catch {
    return false
  }
})

ipcMain.handle('safe-storage-delete', () => {
  try {
    if (fs.existsSync(TOKEN_PATH)) fs.unlinkSync(TOKEN_PATH)
    return true
  } catch {
    return false
  }
})
// ─────────────────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow()
  createTray()

  // Check if launched via protocol URL (Windows — URL may be in argv)
  const protoUrl = process.argv.find(arg => arg.startsWith(`${PROTOCOL}://`))
  if (protoUrl) handleOAuthCallback(protoUrl)
})

app.on('window-all-closed', (e) => e.preventDefault())
