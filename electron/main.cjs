const { app, BrowserWindow, ipcMain, desktopCapturer, screen } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

let mainWindow;
let overlayWindow;

ipcMain.handle('start-screenshot', async () => {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay(); // Simplify to primary display for now

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: primaryDisplay.size.width, height: primaryDisplay.size.height }
  });

  const primarySource = sources[0]; // Usually the first one is the entire screen or primary

  if (mainWindow) {
    mainWindow.hide();
  }

  // Wait for the window to be hidden and animation to finish
  await new Promise(resolve => setTimeout(resolve, 300));

  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }

  const isMac = process.platform === 'darwin';

  overlayWindow = new BrowserWindow({
    fullscreen: !isMac, // Use standard fullscreen on Windows/Linux
    simpleFullscreen: isMac, // Use simpleFullscreen on Mac to avoid new space
    width: primaryDisplay.size.width,
    height: primaryDisplay.size.height,
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    enableLargerThanScreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    overlayWindow.loadURL('http://localhost:5173/#/screenshot');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '/screenshot' });
  }

  // Wait for the window to be ready to receive the image
  ipcMain.once('screenshot-overlay-ready', () => {
    overlayWindow.webContents.send('screenshot-taken', primarySource.thumbnail.toDataURL());
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
});

ipcMain.on('complete-screenshot', (event, base64Image) => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('screenshot-captured', base64Image);
  }
  if (overlayWindow) {
    overlayWindow.close();
  }
});

ipcMain.on('cancel-screenshot', () => {
  if (overlayWindow) {
    overlayWindow.close();
  }
});

app.whenReady().then(() => {
  mainWindow = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
