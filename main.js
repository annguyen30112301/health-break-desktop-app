const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron')
const path = require('path')

app.setName('HealthBreak')

// Default locale — renderer sends 'set-language' on load to sync
let currentLocale = require('./locales/en.js')

let mainWindow
let tray
let popupWindow = null
let popupQueue = []   // hàng đợi các popup chưa hiển thị
let isShowingPopup = false
const lastSkipped = {}  // tracks whether the last action per key was a skip

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 460,
    height: 560,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      autoplayPolicy: 'no-user-gesture-required'
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
  data.queueCount = popupQueue.length
  data.canSkip = !lastSkipped[data.key]

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
ipcMain.on('set-language', (event, lang) => {
  try {
    currentLocale = require(`./locales/${lang}.js`)
  } catch {
    currentLocale = require('./locales/en.js')
  }
  updateTrayMenu()
})

app.whenReady().then(() => {
  createWindow()
  createTray()
})

app.on('window-all-closed', (e) => e.preventDefault())
