const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');
const { execFile, spawn } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

function toolForOllama(t) {
  return { type:'function', function:{ name:t.name, description:t.description, parameters:t.parameters || {type:'object',properties:{}} } };
}
function stripThink(s='') { return String(s).replace(/<think>[\s\S]*?<\/think>/gi,'').trim(); }
function exeNames(name) { if (process.platform !== 'win32') return [name]; const lower=String(name).toLowerCase(); return lower.endsWith('.exe')?[name]:[name,`${name}.exe`]; }
function candidateDirs() {
  const dirs=[]; if(process.env.PATH) dirs.push(...process.env.PATH.split(path.delimiter));
  dirs.push(path.join(os.homedir(),'.virag','bin'));
  if(process.platform==='win32') {
    if(process.env.LOCALAPPDATA){ dirs.push(path.join(process.env.LOCALAPPDATA,'Programs','Ollama')); dirs.push(path.join(process.env.LOCALAPPDATA,'Microsoft','WinGet','Links')); }
    if(process.env.ProgramFiles) dirs.push(path.join(process.env.ProgramFiles,'Ollama'));
  } else dirs.push('/opt/homebrew/bin','/usr/local/bin','/usr/bin','/bin');
  return [...new Set(dirs.filter(Boolean))];
}
function readEngineInfoFile(){ const file=path.join(os.homedir(),'.virag','local-engine.json'); try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return{}} }
async function findCommand(name) {
  const info=readEngineInfoFile(); const keyMap={ollama:'ollamaPath',ffmpeg:'ffmpegPath','whisper-cli':'whisperPath'}; const hinted=info[keyMap[name]];
  if(hinted){try{await fsp.access(hinted,fs.constants.X_OK);return hinted}catch{}}
  for(const d of candidateDirs()) for(const n of exeNames(name)){const p=path.join(d,n);try{await fsp.access(p,fs.constants.X_OK);return p}catch{}}
  return null;
}
function resolveUserPath(p){return path.resolve(String(p||'').replace(/^~(?=$|[\\/])/,os.homedir()))}
function encodedPowerShell(script){return Buffer.from(String(script),'utf16le').toString('base64')}

class LocalAI {
  constructor({config,tools,toolDefinitions,getWindow}) {
    this.config=config; this.tools=tools; this.toolDefinitions=toolDefinitions; this.getWindow=getWindow;
    this.base='http://127.0.0.1:11434'; this.history=[]; this.sayProcess=null; this.abortController=null;
    this.engineFile=path.join(os.homedir(),'.virag','local-engine.json');
  }
  readEngineInfo(){try{return JSON.parse(fs.readFileSync(this.engineFile,'utf8'))}catch{return{}}}
  resolveModel(which='chat') {
    const info=this.readEngineInfo(); const configured=which==='vision'?this.config.data.localVisionModel:this.config.data.localModel;
    if(configured&&configured!=='auto')return configured; return (which==='vision'?info.visionModel:info.model)||info.model||'qwen3-vl:2b';
  }
  async ollamaFetch(route,body=null,{signal}={}) {
    const opts={method:body?'POST':'GET',headers:{'Content-Type':'application/json'},signal}; if(body)opts.body=JSON.stringify(body);
    const r=await fetch(`${this.base}${route}`,opts); if(!r.ok){const txt=await r.text();throw new Error(`Local AI error (${r.status}): ${txt.slice(0,500)}`)} return await r.json();
  }
  async ensureServer(){
    try{await this.ollamaFetch('/api/tags');return true}catch{}
    const ollama=await findCommand('ollama'); if(!ollama)return false;
    try{spawn(ollama,['serve'],process.platform==='win32'?{detached:true,stdio:'ignore',windowsHide:true}:{detached:true,stdio:'ignore'}).unref()}catch{return false}
    for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,500));try{await this.ollamaFetch('/api/tags');return true}catch{}} return false;
  }
  async status(){
    const ffmpeg=await findCommand('ffmpeg'),whisper=await findCommand('whisper-cli'),info=this.readEngineInfo();
    const whisperModel=resolveUserPath(this.config.data.whisperModelPath||info.whisperModelPath||'~/.virag/models/ggml-small.bin');
    const server=await this.ensureServer(); let models=[]; if(server){try{const t=await this.ollamaFetch('/api/tags');models=(t.models||[]).map(x=>x.name)}catch{}}
    const model=this.resolveModel('chat'),visionModel=this.resolveModel('vision'); const hasModel=name=>models.some(x=>x===name||x.startsWith(name+':')||name.startsWith(x+':'));
    const modelInstalled=hasModel(model),visionInstalled=hasModel(visionModel);
    return {ok:Boolean(server&&modelInstalled&&ffmpeg&&whisper&&fs.existsSync(whisperModel)),server,model,visionModel,modelInstalled,visionInstalled,ffmpeg:Boolean(ffmpeg),ffmpegPath:ffmpeg||'',whisper:Boolean(whisper),whisperPath:whisper||'',whisperModel:fs.existsSync(whisperModel),whisperModelPath:whisperModel,voiceReady:process.platform==='darwin'||process.platform==='win32',models,platform:process.platform};
  }
  systemPrompt(){
    const wakeRule=this.config.data.wakeMode?`Wake phrase is ${this.config.data.wakePhrase}. Voice filtering is handled before you receive the message.`:'';
    return `You are Virag, a high-end LOCAL personal AI desktop assistant running on Windows 11 when platform is win32. Execute useful tasks with tools instead of only explaining them. Be fast, concise, capable and natural. Speak English or Hinglish matching the user. Never claim a tool action succeeded unless its result confirms it. Use tools for apps, files, browser, clipboard, memory, screen analysis and current web information. Destructive, shell and UI automation actions require local approval. For browser work, inspect browser_snapshot before guessing selectors. Use recall_memory when prior context matters. Use remember only for durable details or explicit requests. ${wakeRule}`;
  }
  async chat(text){
    if(!await this.ensureServer())throw new Error('Free AI engine is not installed/running. Open Settings → Free Local AI → Install / Repair Free Engine.');
    const model=this.resolveModel('chat'),tools=this.toolDefinitions.map(toolForOllama); this.abortController=new AbortController();
    let messages=[{role:'system',content:this.systemPrompt()},...this.history.slice(-24),{role:'user',content:String(text)}],final='';
    try{
      for(let step=0;step<10;step++){
        const data=await this.ollamaFetch('/api/chat',{model,messages,tools,stream:false,think:false,options:{temperature:0.35,num_ctx:16384}},{signal:this.abortController.signal});
        const msg=data.message||{},calls=msg.tool_calls||[]; messages.push(msg); if(!calls.length){final=stripThink(msg.content||'');break}
        for(const call of calls){const name=call?.function?.name;let args=call?.function?.arguments||{};if(typeof args==='string'){try{args=JSON.parse(args)}catch{args={}}}try{this.getWindow()?.webContents.send('local:tool',{name,args})}catch{}let result;try{result=await this.tools.execute(name,args)}catch(e){result={ok:false,error:e.message||String(e)}}messages.push({role:'tool',tool_name:name,content:JSON.stringify(result)})}
      }
      if(!final)final='Done.'; this.history=[...this.history,{role:'user',content:String(text)},{role:'assistant',content:final}].slice(-40); return{text:final,model};
    }finally{this.abortController=null}
  }
  cancel(){try{this.abortController?.abort()}catch{}this.stopSpeech();return true}
  async vision(question,pngBuffer){
    if(!await this.ensureServer())throw new Error('Free AI engine is not running.'); const model=this.resolveModel('vision');
    const data=await this.ollamaFetch('/api/chat',{model,stream:false,think:false,messages:[{role:'user',content:`Analyze this current computer screen and answer precisely: ${question}`,images:[Buffer.from(pngBuffer).toString('base64')]}],options:{temperature:0.15,num_ctx:8192}}); return{answer:stripThink(data.message?.content||''),model};
  }
  async transcribe(bytes,mimeType='audio/webm'){
    const ffmpeg=await findCommand('ffmpeg'),whisper=await findCommand('whisper-cli'); if(!ffmpeg||!whisper)throw new Error('Local speech engine is missing. Run Install / Repair Free Engine in Settings.');
    const info=this.readEngineInfo(),model=resolveUserPath(this.config.data.whisperModelPath||info.whisperModelPath||'~/.virag/models/ggml-small.bin'); if(!fs.existsSync(model))throw new Error('Whisper speech model is missing. Run Install / Repair Free Engine in Settings.');
    const dir=await fsp.mkdtemp(path.join(os.tmpdir(),'virag-voice-')),ext=String(mimeType).includes('mp4')?'m4a':String(mimeType).includes('ogg')?'ogg':'webm',input=path.join(dir,`input.${ext}`),wav=path.join(dir,'voice.wav');
    try{await fsp.writeFile(input,Buffer.from(bytes));await execFileAsync(ffmpeg,['-y','-loglevel','error','-i',input,'-ar','16000','-ac','1','-c:a','pcm_s16le',wav],{timeout:45000,maxBuffer:2*1024*1024,windowsHide:true});const threads=Math.max(2,Math.min(8,os.cpus()?.length||4));const {stdout,stderr}=await execFileAsync(whisper,['-m',model,'-f',wav,'-nt','-np','-l','auto','-t',String(threads)],{timeout:180000,maxBuffer:8*1024*1024,windowsHide:true});let out=String(stdout||stderr||'').replace(/\[[^\]]*(?:BLANK_AUDIO|Music|Silence)[^\]]*\]/gi,' ').replace(/^whisper[^\n]*$/gmi,' ').replace(/\s+/g,' ').trim();return{text:out}}finally{fsp.rm(dir,{recursive:true,force:true}).catch(()=>{})}
  }
  async speak(text){
    const spoken=String(text||'').trim();if(!spoken)return{ok:false};this.stopSpeech();
    if(process.platform==='darwin'){const args=[],voice=String(this.config.data.localVoice||'').trim();if(voice)args.push('-v',voice);args.push(spoken.slice(0,8000));return await new Promise(resolve=>{this.sayProcess=spawn('/usr/bin/say',args,{stdio:'ignore'});const done=()=>{this.sayProcess=null;resolve({ok:true})};this.sayProcess.once('exit',done);this.sayProcess.once('error',()=>{this.sayProcess=null;resolve({ok:false})})})}
    if(process.platform==='win32'){
      const tempDir=await fsp.mkdtemp(path.join(os.tmpdir(),'virag-speak-')),textFile=path.join(tempDir,'speech.txt');await fsp.writeFile(textFile,spoken.slice(0,10000),'utf8');const voice=String(this.config.data.localVoice||'').replace(/'/g,"''");const script=`Add-Type -AssemblyName System.Speech; $s=New-Object System.Speech.Synthesis.SpeechSynthesizer; ${voice?`try{$s.SelectVoice('${voice}')}catch{}`:''} $t=[IO.File]::ReadAllText('${textFile.replace(/'/g,"''")}'); $s.Speak($t)`;return await new Promise(resolve=>{this.sayProcess=spawn('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',encodedPowerShell(script)],{stdio:'ignore',windowsHide:true});const done=()=>{this.sayProcess=null;fsp.rm(tempDir,{recursive:true,force:true}).catch(()=>{});resolve({ok:true})};this.sayProcess.once('exit',done);this.sayProcess.once('error',()=>{this.sayProcess=null;fsp.rm(tempDir,{recursive:true,force:true}).catch(()=>{});resolve({ok:false})})})
    }
    return{ok:false};
  }
  stopSpeech(){try{if(this.sayProcess&&!this.sayProcess.killed){if(process.platform==='win32')this.sayProcess.kill();else this.sayProcess.kill('SIGTERM')}}catch{}this.sayProcess=null;return true}
}
module.exports={LocalAI,findCommand};
