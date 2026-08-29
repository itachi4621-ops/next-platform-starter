const { app, BrowserWindow, ipcMain, globalShortcut, session, systemPreferences, Tray, Menu } = require('electron');
const path = require('path');
const { ConfigStore } = require('./core/config.cjs');
const { MemoryStore } = require('./core/memory.cjs');
const { BrowserController } = require('./core/browser.cjs');
const { ToolExecutor, toolDefinitions } = require('./core/tools.cjs');
const { ViragUpdater } = require('./core/updater.cjs');

let mainWindow, config, memory, browser, tools, tray, updater;

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
    width: 1320, height: 860, minWidth: 1000, minHeight: 700,
    backgroundColor: '#07090e', title: 'Virag',
    webPreferences: { preload:path.join(__dirname,'preload.cjs'), contextIsolation:true, nodeIntegration:false }
  });
  mainWindow.loadFile(path.join(__dirname,'renderer','index.html'));
  if(process.argv.includes('--dev')) mainWindow.webContents.openDevTools({mode:'detach'});
}

async function requestMacPermissions() {
  if(process.platform==='darwin') {
    try { await systemPreferences.askForMediaAccess('microphone'); } catch {}
  }
}

app.whenReady().then(async () => {
  config = new ConfigStore(); memory = new MemoryStore();
  browser = new BrowserController(() => config.data);
  tools = new ToolExecutor({config,memory,browser,getWindow:()=>mainWindow});
  updater = new ViragUpdater({app,config,getWindow:()=>mainWindow});
  createWindow(); createTray();
  app.setLoginItemSettings({openAtLogin:Boolean(config.data.launchAtLogin)});
  await requestMacPermissions();
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => callback(['media','microphone','camera'].includes(permission)));
  globalShortcut.register('CommandOrControl+Shift+Space', () => mainWindow?.webContents.send('shortcut:toggle'));
  if(config.data.autoUpdateEnabled) setTimeout(()=>updater.check({silent:true}),3500);
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { if(process.platform!=='darwin' && app.isQuitting) app.quit(); });
app.on('activate', () => { if(BrowserWindow.getAllWindows().length===0) createWindow(); });

ipcMain.handle('config:get', () => config.public());
ipcMain.handle('config:update', (_e,p) => { const out=config.update(p); app.setLoginItemSettings({openAtLogin:Boolean(config.data.launchAtLogin)}); return out; });
async function validateOpenAIKey(rawKey) {
  const key=String(rawKey||'').trim();
  if(!key) return {ok:false,error:'Paste an OpenAI Platform secret API key first.'};
  try {
    const r=await fetch('https://api.openai.com/v1/models',{
      method:'GET', headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'}
    });
    if(r.status===401){
      let detail=''; try{detail=(await r.json())?.error?.message||''}catch{}
      return {ok:false,status:401,error:detail||'OpenAI rejected this API key. Create a new secret key from the OpenAI Platform API Keys page.'};
    }
    if(r.ok || r.status===403 || r.status===429) return {ok:true,status:r.status};
    let detail=''; try{detail=(await r.json())?.error?.message||''}catch{}
    return {ok:false,status:r.status,error:detail||`OpenAI key check failed (${r.status}).`};
  } catch(e) {
    return {ok:false,error:`Could not verify the key: ${e.message||e}`};
  }
}
ipcMain.handle('config:set-api-key', async (_e,k) => {
  const test=await validateOpenAIKey(k);
  if(!test.ok) return {...config.public(),keySaved:false,keyError:test.error,keyStatus:test.status||null};
  config.setApiKey(k);
  return {...config.public(),keySaved:true,keyError:null,keyStatus:test.status||200};
});
ipcMain.handle('config:clear-api-key', () => { config.setApiKey(''); return {...config.public(),keySaved:false}; });
ipcMain.handle('tool:definitions', () => toolDefinitions);
ipcMain.handle('tool:execute', async (_e,{name,args}) => {
  try { return {ok:true,result:await tools.execute(name,args||{})}; }
  catch(error) { console.error(error); return {ok:false,error:error.message||String(error)}; }
});
ipcMain.handle('memory:recent', (_e,l) => memory.recent(l||20));
ipcMain.handle('memory:forget', (_e,id) => memory.forget(id));
ipcMain.handle('memory:clear', () => { memory.clear(); return true; });

ipcMain.handle('update:get-state', () => updater.publicState());
ipcMain.handle('update:check', () => updater.check({silent:false}));
ipcMain.handle('update:install', () => updater.downloadAndInstall());

ipcMain.handle('realtime:create-call', async (_e, offerSdp) => {
  const apiKey=config.getApiKey(); if(!apiKey) throw new Error('Add your OpenAI API key in Settings first.');
  const wakeRule = config.data.wakeMode ? `Wake mode is ENABLED. The wake phrase is "${config.data.wakePhrase}". Ignore ambient speech and do not answer unless a user turn clearly begins with that wake phrase.` : 'Wake mode is DISABLED. Respond normally to user turns.';
  const prompt = `You are Virag, a high-end personal AI desktop assistant. Be fast, capable, natural, concise, and proactive. You can speak in English or Hinglish based on the user's language. Your primary job is to execute tasks using tools, not merely explain how the user could do them. Never claim an action succeeded unless a tool confirmed it. Ask before irreversible or sensitive actions; local destructive/shell/UI tools also have approval gates. Use recall_memory when prior preferences or project context would materially help. Use remember only for durable details or when the user explicitly asks. ${wakeRule} When using browser tools, inspect with browser_snapshot before guessing selectors. For live/current facts use web_search.`;
  if (typeof offerSdp !== 'string' || !offerSdp.trim()) {
    throw new Error('Virag did not receive a valid WebRTC SDP offer. Please restart Virag and try again.');
  }

  const form = new FormData();
  form.set('sdp', offerSdp);
  const sessionConfig = {
    type:'realtime', model:config.data.realtimeModel, instructions:prompt,
    output_modalities:['audio'], max_output_tokens:2048,
    audio:{
      input:{noise_reduction:{type:'near_field'},transcription:{model:'gpt-4o-mini-transcribe'},turn_detection:{type:'semantic_vad',eagerness:'medium',create_response:true,interrupt_response:true}},
      output:{voice:config.data.voice,speed:1.05}
    },
    tools:toolDefinitions, tool_choice:'auto', tracing:'auto'
  };
  form.set('session', JSON.stringify(sessionConfig));
  const r=await fetch('https://api.openai.com/v1/realtime/calls',{
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`},
    body:form
  });
  const text=await r.text(); if(!r.ok) throw new Error(`Realtime connection failed (${r.status}): ${text.slice(0,800)}`);
  return text;
});
