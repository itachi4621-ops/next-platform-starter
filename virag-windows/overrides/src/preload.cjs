const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('virag', {
  getConfig:()=>ipcRenderer.invoke('config:get'), saveConfig:p=>ipcRenderer.invoke('config:update',p),
  saveApiKey:k=>ipcRenderer.invoke('config:set-api-key',k), clearApiKey:()=>ipcRenderer.invoke('config:clear-api-key'),
  createRealtimeCall:sdp=>ipcRenderer.invoke('realtime:create-call',sdp),
  executeTool:(name,args)=>ipcRenderer.invoke('tool:execute',{name,args}), getToolDefinitions:()=>ipcRenderer.invoke('tool:definitions'),
  getMemories:l=>ipcRenderer.invoke('memory:recent',l), forgetMemory:id=>ipcRenderer.invoke('memory:forget',id), clearMemory:()=>ipcRenderer.invoke('memory:clear'),
  localStatus:()=>ipcRenderer.invoke('local:status'), localChat:text=>ipcRenderer.invoke('local:chat',text),
  localTranscribe:(bytes,mimeType)=>ipcRenderer.invoke('local:transcribe',{bytes,mimeType}), localSpeak:text=>ipcRenderer.invoke('local:speak',text),
  stopLocal:()=>ipcRenderer.invoke('local:stop'), setupLocal:()=>ipcRenderer.invoke('local:setup'),
  getUpdateState:()=>ipcRenderer.invoke('update:get-state'), checkForUpdates:()=>ipcRenderer.invoke('update:check'), installUpdate:()=>ipcRenderer.invoke('update:install'),
  onUpdateStatus:cb=>ipcRenderer.on('update:status',(_e,state)=>cb(state)), onLocalTool:cb=>ipcRenderer.on('local:tool',(_e,data)=>cb(data)),
  onShortcutToggle:cb=>ipcRenderer.on('shortcut:toggle',()=>cb()), platform:process.platform
});
