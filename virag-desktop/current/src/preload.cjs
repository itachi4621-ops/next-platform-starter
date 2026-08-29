const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('virag', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (patch) => ipcRenderer.invoke('config:update', patch),
  saveApiKey: (key) => ipcRenderer.invoke('config:set-api-key', key),
  clearApiKey: () => ipcRenderer.invoke('config:clear-api-key'),
  createRealtimeCall: (offerSdp) => ipcRenderer.invoke('realtime:create-call', offerSdp),
  executeTool: (name,args) => ipcRenderer.invoke('tool:execute', {name,args}),
  getToolDefinitions: () => ipcRenderer.invoke('tool:definitions'),
  getMemories: (limit) => ipcRenderer.invoke('memory:recent', limit),
  forgetMemory: (id) => ipcRenderer.invoke('memory:forget', id),
  clearMemory: () => ipcRenderer.invoke('memory:clear'),
  getUpdateState: () => ipcRenderer.invoke('update:get-state'),
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateStatus: (cb) => ipcRenderer.on('update:status', (_e,state) => cb(state)),
  onShortcutToggle: (cb) => ipcRenderer.on('shortcut:toggle', () => cb()),
  platform: process.platform
});
