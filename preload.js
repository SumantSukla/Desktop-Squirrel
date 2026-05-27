const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  moveWindow: (pos) => ipcRenderer.send('move-window', pos),
  getScreenWorkArea: () => ipcRenderer.invoke('get-screen-work-area'),
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  onFeedPet: (callback) => ipcRenderer.on('feed-pet', (_event, value) => callback(value)),
  onKillPet: (callback) => ipcRenderer.on('kill-pet', (_event, value) => callback(value)),
  exitApp: () => ipcRenderer.send('exit-app')
});