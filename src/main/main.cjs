const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const exeName = path.basename(process.execPath || '').toLowerCase();
const isAdmin = process.argv.includes('--admin') || exeName.includes('admin');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function getStorePaths() {
  const userData = app.getPath('userData');
  return {
    userData,
    device: path.join(userData, 'device.json'),
    license: path.join(userData, 'license.json')
  };
}

function getDeviceId() {
  const paths = getStorePaths();
  const current = readJson(paths.device, null);
  if (current && current.deviceId) return current.deviceId;

  const next = {
    deviceId: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  writeJson(paths.device, next);
  return next.deviceId;
}

function createWindow() {
  const win = new BrowserWindow({
    width: isAdmin ? 980 : 1280,
    height: isAdmin ? 760 : 800,
    minWidth: isAdmin ? 860 : 1024,
    minHeight: isAdmin ? 620 : 680,
    title: isAdmin ? 'MASTIL Lizenz-Admin' : 'MASTIL',
    icon: path.join(__dirname, '../../assets/branding/mastil-icon.ico'),
    backgroundColor: '#120c08',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const page = isAdmin
    ? path.join(__dirname, '../renderer/admin/admin.html')
    : path.join(__dirname, '../renderer/index.html');

  win.loadFile(page);
}

app.whenReady().then(() => {
  app.setAppUserModelId('de.mastil.game');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('mastil:get-app-info', () => ({
  name: 'MASTIL',
  version: app.getVersion(),
  mode: isAdmin ? 'admin' : 'game'
}));

ipcMain.handle('mastil:get-device-id', () => getDeviceId());

ipcMain.handle('mastil:get-config', () => ({
  backendUrl: process.env.MASTIL_BACKEND_URL || 'http://localhost:3787'
}));

ipcMain.handle('mastil:get-license', () => {
  const paths = getStorePaths();
  return readJson(paths.license, null);
});

ipcMain.handle('mastil:save-license', (_event, license) => {
  const paths = getStorePaths();
  writeJson(paths.license, {
    ...license,
    savedAt: new Date().toISOString()
  });
  return true;
});

ipcMain.handle('mastil:clear-license', () => {
  const paths = getStorePaths();
  try {
    fs.unlinkSync(paths.license);
  } catch {
    // Already cleared.
  }
  return true;
});

ipcMain.handle('mastil:open-external', (_event, url) => {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    throw new Error('Only http(s) URLs can be opened.');
  }
  shell.openExternal(url);
  return true;
});
