// ESM preload
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  sendPing: () => ipcRenderer.send('ping', 'hi from renderer'),
  onPong: (cb) => ipcRenderer.on('pong', (_, data) => cb(data))
});
