const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const DEFAULT_MANIFEST_URL = 'https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/virag-desktop/manifest.json';

function cleanVersion(v='0.0.0') { return String(v).trim().replace(/^v/i,'').split('-')[0]; }
function compareVersions(a,b) {
  const aa=cleanVersion(a).split('.').map(n=>Number(n)||0), bb=cleanVersion(b).split('.').map(n=>Number(n)||0);
  for(let i=0;i<Math.max(aa.length,bb.length,3);i++){ const d=(aa[i]||0)-(bb[i]||0); if(d) return d>0?1:-1; }
  return 0;
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function sha256(data){ return crypto.createHash('sha256').update(data).digest('hex'); }
function safeRelative(input){
  const p=String(input||'').replace(/\\/g,'/').replace(/^\/+/, '');
  if(!p || p.includes('\0') || p.split('/').includes('..') || path.posix.isAbsolute(p)) throw new Error(`Unsafe update path: ${input}`);
  return p;
}
function fileEntries(manifest){
  return (manifest.files||[]).map(x=>typeof x==='string'?{path:x}:{...x}).map(x=>({...x,path:safeRelative(x.path)}));
}

class ViragUpdater {
  constructor({app,getWindow,config}) {
    this.app=app; this.getWindow=getWindow; this.config=config;
    this.manifestUrl=process.env.VIRAG_UPDATE_MANIFEST || DEFAULT_MANIFEST_URL;
    this.state={status:'idle',currentVersion:app.getVersion(),latestVersion:null,notes:'',progress:0,error:null};
    this.busy=false;
  }
  emit(patch={}) { this.state={...this.state,...patch}; try{this.getWindow()?.webContents.send('update:status',this.publicState())}catch{} return this.publicState(); }
  publicState(){ return {...this.state,autoUpdateEnabled:Boolean(this.config.data.autoUpdateEnabled),autoInstallUpdates:Boolean(this.config.data.autoInstallUpdates)}; }
  async fetchManifest(){
    const sep=this.manifestUrl.includes('?')?'&':'?';
    const r=await fetch(`${this.manifestUrl}${sep}t=${Date.now()}`,{headers:{'Cache-Control':'no-cache'}});
    if(!r.ok) throw new Error(`Update server returned ${r.status}`);
    const m=await r.json();
    const hasFiles=Array.isArray(m?.files)&&m.files.length>0&&m?.baseUrl;
    if(!m?.version||(!hasFiles&&!m?.zipUrl)) throw new Error('Update manifest is invalid.');
    return m;
  }
  async check({silent=false}={}) {
    if(this.busy) return this.publicState();
    this.emit({status:'checking',error:null,progress:0});
    try{
      const m=await this.fetchManifest(), available=compareVersions(m.version,this.app.getVersion())>0;
      this.emit({status:available?'available':'up-to-date',latestVersion:m.version,notes:m.notes||'',releaseDate:m.releaseDate||null,error:null});
      if(available && (this.config.data.autoInstallUpdates || !silent)){ await sleep(silent?900:300); return await this.downloadAndInstall(m); }
      return this.publicState();
    }catch(e){ this.emit({status:'error',error:e.message||String(e)}); return this.publicState(); }
  }
  async stageFileUpdate(m,base){
    const stage=path.join(base,'stage'); fs.mkdirSync(stage,{recursive:true});
    const entries=fileEntries(m), total=entries.length;
    for(let i=0;i<total;i++){
      const ent=entries[i], url=new URL(ent.path,m.baseUrl.endsWith('/')?m.baseUrl:`${m.baseUrl}/`).toString();
      const r=await fetch(`${url}${url.includes('?')?'&':'?'}t=${Date.now()}`,{headers:{'Cache-Control':'no-cache'}});
      if(!r.ok) throw new Error(`Update file failed (${r.status}): ${ent.path}`);
      const bytes=Buffer.from(await r.arrayBuffer());
      if(ent.sha256 && sha256(bytes).toLowerCase()!==String(ent.sha256).toLowerCase()) throw new Error(`Integrity check failed: ${ent.path}`);
      const dest=path.join(stage,...ent.path.split('/')); fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.writeFileSync(dest,bytes);
      this.emit({status:'downloading',progress:10+Math.round(((i+1)/total)*55),currentFile:ent.path});
    }
    if(!fs.existsSync(path.join(stage,'package.json'))) throw new Error('Update package is incomplete (package.json missing).');
    fs.writeFileSync(path.join(base,'delete.json'),JSON.stringify((m.delete||[]).map(safeRelative)));
    return {stage,mode:'files'};
  }
  async stageZipUpdate(m,base){
    const r=await fetch(m.zipUrl,{headers:{'Cache-Control':'no-cache'}}); if(!r.ok) throw new Error(`Update download failed (${r.status})`);
    const bytes=Buffer.from(await r.arrayBuffer());
    if(m.sha256 && sha256(bytes).toLowerCase()!==String(m.sha256).toLowerCase()) throw new Error('Update archive integrity check failed.');
    const zipPath=path.join(base,'update.zip'); fs.writeFileSync(zipPath,bytes); this.emit({status:'downloading',progress:65});
    return {zipPath,mode:'zip'};
  }
  async downloadAndInstall(manifest=null){
    if(this.busy) return this.publicState(); this.busy=true;
    try{
      const m=manifest||await this.fetchManifest();
      if(compareVersions(m.version,this.app.getVersion())<=0) return this.emit({status:'up-to-date',latestVersion:m.version});
      if(this.app.isPackaged) throw new Error('Packaged auto-update needs code signing; this updater is for the current Virag source install.');
      this.emit({status:'downloading',latestVersion:m.version,notes:m.notes||'',progress:8,error:null,currentFile:null});
      const base=fs.mkdtempSync(path.join(os.tmpdir(),'virag-update-'));
      const staged=Array.isArray(m.files)&&m.files.length?await this.stageFileUpdate(m,base):await this.stageZipUpdate(m,base);
      this.emit({status:'installing',progress:75,currentFile:null});
      const root=path.resolve(__dirname,'..','..'), pid=process.pid;
      if(process.platform==='win32'){
        const helper=path.join(base,'apply-update.ps1'), esc=s=>String(s).replace(/'/g,"''");
        let prep='';
        if(staged.mode==='zip') prep=`$stage=Join-Path '${esc(base)}' 'stage'\nNew-Item -ItemType Directory -Force -Path $stage | Out-Null\nExpand-Archive -LiteralPath '${esc(staged.zipPath)}' -DestinationPath $stage -Force\n`;
        else prep=`$stage='${esc(staged.stage)}'\n`;
        fs.writeFileSync(helper,`$ErrorActionPreference='Stop'\n$root='${esc(root)}'\n${prep}Start-Sleep -Seconds 2\n$deleteFile=Join-Path '${esc(base)}' 'delete.json'\nif(Test-Path $deleteFile){ $deletes=Get-Content $deleteFile -Raw | ConvertFrom-Json; foreach($rel in $deletes){ $p=Join-Path $root $rel; if(Test-Path $p){ Remove-Item -Recurse -Force $p } } }\nCopy-Item -Path (Join-Path $stage '*') -Destination $root -Recurse -Force\nSet-Location $root\ncmd /c npm install\nStart-Process -WindowStyle Hidden cmd -ArgumentList '/c npm start'\n`);
        spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',helper],{detached:true,stdio:'ignore'}).unref();
      }else{
        const helper=path.join(base,'apply-update.sh'), q=s=>`'${String(s).replace(/'/g,"'\\''")}'`;
        let prep='';
        if(staged.mode==='zip') prep=`STAGE="$BASE/stage"\nmkdir -p "$STAGE"\n/usr/bin/ditto -x -k ${q(staged.zipPath)} "$STAGE"\n`;
        else prep=`STAGE=${q(staged.stage)}\n`;
        fs.writeFileSync(helper,`#!/bin/bash\nset -e\nROOT=${q(root)}\nBASE=${q(base)}\nPID=${pid}\nfor i in {1..80}; do if ! kill -0 "$PID" 2>/dev/null; then break; fi; sleep 0.25; done\n${prep}[ -f "$STAGE/package.json" ] || exit 2\nDELETE_FILE="$BASE/delete.json"\nif [ -f "$DELETE_FILE" ]; then\n  /usr/bin/python3 - "$ROOT" "$DELETE_FILE" <<'PY'\nimport json, os, shutil, sys\nroot, f = sys.argv[1:3]\nfor rel in json.load(open(f)):\n    p=os.path.realpath(os.path.join(root, rel))\n    if not p.startswith(os.path.realpath(root)+os.sep): continue\n    if os.path.isdir(p) and not os.path.islink(p): shutil.rmtree(p, ignore_errors=True)\n    elif os.path.lexists(p): os.remove(p)\nPY\nfi\ncp -R "$STAGE"/. "$ROOT"/\nchmod +x "$ROOT"/scripts/*.command 2>/dev/null || true\nexport PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"\ncd "$ROOT"\nif command -v npm >/dev/null 2>&1; then npm install >/tmp/virag-update-install.log 2>&1 || true; fi\nif [ -x "$ROOT/node_modules/.bin/electron" ]; then\n  nohup "$ROOT/node_modules/.bin/electron" "$ROOT" >/tmp/virag-start.log 2>&1 &\nelif command -v npm >/dev/null 2>&1; then\n  nohup npm start >/tmp/virag-start.log 2>&1 &\nelse\n  echo "Virag update installed but restart failed: npm/electron not found" >/tmp/virag-start.log\nfi\n`,{mode:0o755});
        spawn('/bin/bash',[helper],{detached:true,stdio:'ignore'}).unref();
      }
      this.emit({status:'restarting',progress:100}); setTimeout(()=>{this.app.isQuitting=true;this.app.quit()},500); return this.publicState();
    }catch(e){ this.emit({status:'error',error:e.message||String(e)}); return this.publicState(); }
    finally{ this.busy=false; }
  }
}
module.exports={ViragUpdater,compareVersions,DEFAULT_MANIFEST_URL};
