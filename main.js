const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron')
const path = require('path')

// Default locale — renderer sends 'set-language' on load to sync
let currentLocale = require('./locales/en.js')

let mainWindow
let tray
let popupWindow = null
let popupQueue = []   // hàng đợi các popup chưa hiển thị
let isShowingPopup = false

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
  return app.getLoginItemSettings().openAtLogin
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

  // Đính kèm số lượng còn trong queue để hiển thị badge
  data.queueCount = popupQueue.length

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    width: 300,
    height: 90,
    x: width - 316,
    y: height - 106,
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

// User bấm ✕ — đóng popup hiện tại, reset timer, hiển thị popup tiếp theo
ipcMain.on('close-popup', (event, key) => {
  destroyPopup()

  // Reset timer của key vừa đóng
  if (key && mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    mainWindow.webContents.send('popup-closed', key)
  }

  // Hiển thị popup tiếp theo trong queue (nếu có)
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
