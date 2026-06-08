const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mastilNative', {
  getAppInfo: () => ipcRenderer.invoke('mastil:get-app-info'),
  getDeviceId: () => ipcRenderer.invoke('mastil:get-device-id'),
  getConfig: () => ipcRenderer.invoke('mastil:get-config'),
  getLicense: () => ipcRenderer.invoke('mastil:get-license'),
  saveLicense: (license) => ipcRenderer.invoke('mastil:save-license', license),
  clearLicense: () => ipcRenderer.invoke('mastil:clear-license'),
  openExternal: (url) => ipcRenderer.invoke('mastil:open-external', url)
});
