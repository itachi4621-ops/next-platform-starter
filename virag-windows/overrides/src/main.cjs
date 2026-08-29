const { app, BrowserWindow, ipcMain, globalShortcut, session, systemPreferences, Tray, Menu, shell } = require('electron');
const path = require('path');
const { execFile, spawn } = require('child_process');
const { ConfigStore } = require('./core/config.cjs');
const { MemoryStore } = require('./core/memory.cjs');
const { BrowserController } = require('./core/browser.cjs');
const { ToolExecutor, toolDefinitions } = require('./core/tools.cjs');
const { ViragUpdater } = require('./core/updater.cjs');
const { LocalAI } = require('./core/local-ai.cjs');

let mainWindow, config, memory, browser, tools, tray, updater, localAI;

function createTray() {
  try {
    tray = new Tray(path.join(__dirname,'..','assets','icon.png'));
    tray.setToolTip('Virag');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label:'Open Virag', click:()=>{ mainWindow?.show(); mainWindow?.focus(); } },
      { label:'Check for updates', click:()=>updater?.check({silent:false}) },
      { type:'separator' },
      { label:'Quit', click:()=>{ app.isQuitting=true; app.quit(); } }
    ]));
    tray.on('click',()=>{ mainWindow?.show(); mainWindow?.focus(); });
  } catch(e) { console.error('Tray failed:',e); }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width:1320,height:860,minWidth:1000,minHeight:700,backgroundColor:'#07090e',title:'Virag',
    webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false}
  });
  mainWindow.loadFile(path.join(__dirname,'renderer','index.html'));
  mainWindow.on('close',e=>{ if(!app.isQuitting){ e.preventDefault(); mainWindow.hide(); } });
  if(process.argv.includes('--dev')) mainWindow.webContents.openDevTools({mode:'detach'});
}

async function requestMacPermissions() {
  if(process.platform==='darwin') { try { await systemPreferences.askForMediaAccess('microphone'); } catch {} }
}

app.whenReady().then(async()=>{
  config=new ConfigStore(); memory=new MemoryStore();
  browser=new BrowserController(()=>config.data);
  tools=new ToolExecutor({config,memory,browser,getWindow:()=>mainWindow});
  localAI=new LocalAI({config,tools,toolDefinitions,getWindow:()=>mainWindow});
  tools.setLocalAI(localAI);
  updater=new ViragUpdater({app,config,getWindow:()=>mainWindow});
  createWindow(); createTray();
  app.setLoginItemSettings({openAtLogin:Boolean(config.data.launchAtLogin)});
  await requestMacPermissions();
  session.defaultSession.setPermissionRequestHandler((_wc,permission,callback)=>callback(['media','microphone','camera'].includes(permission)));
  globalShortcut.register('CommandOrControl+Shift+Space',()=>mainWindow?.webContents.send('shortcut:toggle'));
  if(config.data.autoUpdateEnabled) setTimeout(()=>updater.check({silent:true}),3500);
});

app.on('will-quit',()=>globalShortcut.unregisterAll());
app.on('window-all-closed',()=>{if(process.platform!=='darwin'&&app.isQuitting)app.quit()});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});

ipcMain.handle('config:get',()=>config.public());
ipcMain.handle('config:update',(_e,p)=>{const out=config.update(p);app.setLoginItemSettings({openAtLogin:Boolean(config.data.launchAtLogin)});return out});

async function validateOpenAIKey(rawKey){
  const key=String(rawKey||'').trim(); if(!key)return{ok:false,error:'Paste an OpenAI Platform secret API key first.'};
  try{
    const r=await fetch('https://api.openai.com/v1/models',{method:'GET',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'}});
    if(r.status===401){let detail='';try{detail=(await r.json())?.error?.message||''}catch{};return{ok:false,status:401,error:detail||'OpenAI rejected this API key.'}}
    if(r.ok||r.status===403||r.status===429)return{ok:true,status:r.status};
    let detail='';try{detail=(await r.json())?.error?.message||''}catch{};return{ok:false,status:r.status,error:detail||`OpenAI key check failed (${r.status}).`};
  }catch(e){return{ok:false,error:`Could not verify the key: ${e.message||e}`}}
}
ipcMain.handle('config:set-api-key',async(_e,k)=>{const test=await validateOpenAIKey(k);if(!test.ok)return{...config.public(),keySaved:false,keyError:test.error,keyStatus:test.status||null};config.setApiKey(k);return{...config.public(),keySaved:true,keyError:null,keyStatus:test.status||200}});
ipcMain.handle('config:clear-api-key',()=>{config.setApiKey('');return{...config.public(),keySaved:false}});

ipcMain.handle('tool:definitions',()=>toolDefinitions);
ipcMain.handle('tool:execute',async(_e,{name,args})=>{try{return{ok:true,result:await tools.execute(name,args||{})}}catch(error){console.error(error);return{ok:false,error:error.message||String(error)}}});
ipcMain.handle('memory:recent',(_e,l)=>memory.recent(l||20));
ipcMain.handle('memory:forget',(_e,id)=>memory.forget(id));
ipcMain.handle('memory:clear',()=>{memory.clear();return true});

ipcMain.handle('local:status',()=>localAI.status());
ipcMain.handle('local:chat',async(_e,text)=>await localAI.chat(text));
ipcMain.handle('local:transcribe',async(_e,{bytes,mimeType})=>await localAI.transcribe(bytes,mimeType));
ipcMain.handle('local:speak',async(_e,text)=>await localAI.speak(text));
ipcMain.handle('local:stop',()=>localAI.cancel());
ipcMain.handle('local:setup',async()=>{
  try {
    if(process.platform==='win32') {
      const script=app.isPackaged ? path.join(process.resourcesPath,'scripts','Setup Virag Free AI.ps1') : path.join(__dirname,'..','scripts','Setup Virag Free AI.ps1');
      if(!require('fs').existsSync(script)) return {ok:false,error:`Setup script not found: ${script}`};
      spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-NoExit','-File',script],{detached:true,stdio:'ignore',windowsHide:false}).unref();
      return {ok:true,platform:'windows'};
    }
    if(process.platform==='darwin') {
      const script=path.join(__dirname,'..','scripts','Setup Virag Free AI.command');
      try { execFile('/usr/bin/open',[script]); return{ok:true,platform:'mac'}; } catch(e) { const err=await shell.openPath(script); return err?{ok:false,error:err}:{ok:true,platform:'mac'}; }
    }
    return {ok:false,error:'One-click local engine setup is currently available for Windows 11 and macOS.'};
  } catch(e) { return {ok:false,error:e.message||String(e)}; }
});

ipcMain.handle('update:get-state',()=>updater.publicState());
ipcMain.handle('update:check',()=>updater.check({silent:false}));
ipcMain.handle('update:install',()=>updater.downloadAndInstall());

ipcMain.handle('realtime:create-call',async(_e,offerSdp)=>{
  const apiKey=config.getApiKey();if(!apiKey)throw new Error('Add your OpenAI API key in Settings first.');
  const wakeRule=config.data.wakeMode?`Wake mode is ENABLED. The wake phrase is "${config.data.wakePhrase}".`:'Wake mode is DISABLED.';
  const prompt=`You are Virag, a high-end personal AI desktop assistant. Be fast, capable, natural, concise, and proactive. Execute tasks using tools rather than only explaining them. ${wakeRule}`;
  if(typeof offerSdp!=='string'||!offerSdp.trim())throw new Error('Virag did not receive a valid WebRTC SDP offer.');
  const form=new FormData(); form.set('sdp',offerSdp);
  const sessionConfig={type:'realtime',model:config.data.realtimeModel,instructions:prompt,output_modalities:['audio'],max_output_tokens:2048,audio:{input:{noise_reduction:{type:'near_field'},transcription:{model:'gpt-4o-mini-transcribe'},turn_detection:{type:'semantic_vad',eagerness:'medium',create_response:true,interrupt_response:true}},output:{voice:config.data.voice,speed:1.05}},tools:toolDefinitions,tool_choice:'auto',tracing:'auto'};
  form.set('session',JSON.stringify(sessionConfig));
  const r=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`},body:form});
  const text=await r.text();if(!r.ok)throw new Error(`Realtime connection failed (${r.status}): ${text.slice(0,800)}`);return text;
});
