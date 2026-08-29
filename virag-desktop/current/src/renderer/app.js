const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let pc=null, dc=null, localStream=null, connected=false, muted=false, config=null;
let partialAssistant='';

function addBubble(role,text,extra=''){
  if(!text) return;
  const d=document.createElement('div'); d.className=`bubble ${role}`; d.textContent=text; if(extra) d.title=extra; $('#transcript').appendChild(d); $('#transcript').scrollTop=$('#transcript').scrollHeight;
}
function setState(text,mode=''){$('#stateText').textContent=text; $('#orb').className=`orb ${mode}`.trim();}
function setConnected(on){connected=on; $('#connectBtn').textContent=on?'Stop Virag':'Start Virag'; $('#muteBtn').disabled=!on; $('#interruptBtn').disabled=!on; const p=$('#statusPill'); p.className=`status ${on?'live':'offline'}`; p.innerHTML=`<span></span> ${on?'Live':'Offline'}`; if(!on)setState('Ready when you are.');}
function sendEvent(ev){ if(dc?.readyState==='open') dc.send(JSON.stringify(ev)); }

async function connect(){
  if(connected) return disconnect();
  config=await window.virag.getConfig();
  if(!config.hasApiKey){showView('settings'); $('#keyState').textContent='Add your OpenAI API key first.'; return;}
  setState('Connecting…');
  try{
    pc=new RTCPeerConnection();
    const audio=$('#remoteAudio'); pc.ontrack=e=>{audio.srcObject=e.streams[0]; setState('Virag is speaking…','speaking');};
    dc=pc.createDataChannel('oai-events');
    dc.onopen=()=>{setConnected(true);setState(config.wakeMode?`Wake mode: say “${config.wakePhrase}”`:'Listening…','listening');};
    dc.onmessage=handleRealtimeEvent;
    dc.onclose=()=>setConnected(false);
    localStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
    const offer=await pc.createOffer(); await pc.setLocalDescription(offer);
    const answerSdp=await window.virag.createRealtimeCall(offer.sdp);
    await pc.setRemoteDescription({type:'answer',sdp:answerSdp});
  }catch(e){ console.error(e); const msg=String(e.message||e); if(msg.includes('(401)')||msg.includes('invalid_api_key')){addBubble('assistant','OpenAI rejected the saved API key. Open Settings → Clear → paste a secret key created on the OpenAI Platform API Keys page → Save & test.');showView('settings');$('#keyState').textContent='Saved key is invalid. Clear it and use an OpenAI Platform secret API key.';}else addBubble('assistant',`Connection error: ${msg}`); disconnect(); }
}
function disconnect(){ try{dc?.close()}catch{} try{pc?.close()}catch{} localStream?.getTracks().forEach(t=>t.stop()); pc=null;dc=null;localStream=null;setConnected(false); }

async function handleRealtimeEvent(ev){
  let data; try{data=JSON.parse(ev.data)}catch{return}
  if(data.type==='input_audio_buffer.speech_started') setState('Listening…','listening');
  if(data.type==='input_audio_buffer.speech_stopped') setState('Thinking…');
  if(data.type==='conversation.item.input_audio_transcription.completed') addBubble('user',data.transcript||'');
  if(data.type==='response.output_audio_transcript.delta') partialAssistant += data.delta||'';
  if(data.type==='response.output_audio_transcript.done') { addBubble('assistant',data.transcript||partialAssistant); partialAssistant=''; setState('Listening…','listening'); }
  if(data.type==='response.output_text.done'){ addBubble('assistant',data.text||''); setState('Listening…','listening'); }
  if(data.type==='response.function_call_arguments.done'){
    addBubble('tool',`Running: ${data.name}`);
    let args={}; try{args=JSON.parse(data.arguments||'{}')}catch{}
    const r=await window.virag.executeTool(data.name,args);
    const output=r.ok?JSON.stringify(r.result):JSON.stringify({error:r.error});
    sendEvent({type:'conversation.item.create',item:{type:'function_call_output',call_id:data.call_id,output}});
    sendEvent({type:'response.create'});
  }
  if(data.type==='error'){ addBubble('assistant',`Realtime error: ${data.error?.message||'Unknown error'}`); }
}

function sendText(){
  const input=$('#textInput'); const text=input.value.trim(); if(!text)return;
  if(!connected){addBubble('assistant','Start Virag first.'); return;}
  addBubble('user',text); input.value='';
  sendEvent({type:'conversation.item.create',item:{type:'message',role:'user',content:[{type:'input_text',text}]}});
  sendEvent({type:'response.create'}); setState('Thinking…');
}

function interrupt(){ sendEvent({type:'response.cancel'}); sendEvent({type:'output_audio_buffer.clear'}); setState('Listening…','listening'); }
function toggleMute(){muted=!muted; localStream?.getAudioTracks().forEach(t=>t.enabled=!muted); $('#muteBtn').textContent=muted?'◌':'⌁'; setState(muted?'Microphone muted':'Listening…',muted?'':'listening');}

function showView(id){ $$('.view').forEach(v=>v.classList.toggle('active',v.id===id)); $$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===id)); if(id==='settings')loadSettings(); if(id==='memory')loadMemory(); }
$$('.nav').forEach(n=>n.onclick=()=>showView(n.dataset.view));
$('#connectBtn').onclick=connect; $('#sendBtn').onclick=sendText; $('#interruptBtn').onclick=interrupt; $('#muteBtn').onclick=toggleMute;
$('#textInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText()}});
window.virag.onShortcutToggle(()=>{showView('assistant'); if(!connected) connect();});

async function loadSettings(){
  config=await window.virag.getConfig();
  $('#keyState').textContent=config.hasApiKey?'API key saved securely.':'No API key saved.';
  for(const id of ['realtimeModel','reasoningModel','voice','wakePhrase']) if($("#"+id)) $("#"+id).value=config[id]??'';
  for(const id of ['wakeMode','allowShellTools','allowUiAutomation','browserHeadless','launchAtLogin','autoUpdateEnabled','autoInstallUpdates']) $("#"+id).checked=Boolean(config[id]);
  refreshUpdateState();
}
$('#saveKey').onclick=async()=>{
  const v=$('#apiKey').value.trim(); if(!v){$('#keyState').textContent='Paste your OpenAI Platform secret key first.';return;}
  const b=$('#saveKey'); b.disabled=true; b.textContent='Testing…'; $('#keyState').textContent='Checking key with OpenAI…';
  try{
    const result=await window.virag.saveApiKey(v);
    config=result;
    if(result.keySaved){$('#apiKey').value='';$('#keyState').textContent='API key verified and saved securely ✓';}
    else $('#keyState').textContent=`Not saved: ${result.keyError||'OpenAI rejected this key.'}`;
  }catch(e){$('#keyState').textContent=`Could not save key: ${e.message||e}`;}
  finally{b.disabled=false;b.textContent='Save & test';}
};
$('#clearKey').onclick=async()=>{config=await window.virag.clearApiKey();$('#apiKey').value='';$('#keyState').textContent='Saved API key cleared.';};
$('#saveSettings').onclick=async()=>{
  config=await window.virag.saveConfig({realtimeModel:$('#realtimeModel').value.trim(),reasoningModel:$('#reasoningModel').value.trim(),voice:$('#voice').value,wakeMode:$('#wakeMode').checked,wakePhrase:$('#wakePhrase').value.trim().toLowerCase(),allowShellTools:$('#allowShellTools').checked,allowUiAutomation:$('#allowUiAutomation').checked,browserHeadless:$('#browserHeadless').checked,launchAtLogin:$('#launchAtLogin').checked,autoUpdateEnabled:$('#autoUpdateEnabled').checked,autoInstallUpdates:$('#autoInstallUpdates').checked});
  $('#saveSettings').textContent='Saved ✓'; setTimeout(()=>$('#saveSettings').textContent='Save settings',1000);
};

async function loadMemory(){
  const items=await window.virag.getMemories(50), box=$('#memoryList'); box.innerHTML='';
  if(!items.length){box.innerHTML='<div class="card"><small>No long-term memories yet. Tell Virag “remember that…”</small></div>';return}
  items.forEach(m=>{const d=document.createElement('div');d.className='memory-item';d.innerHTML=`<div><p></p><small></small></div><button>Forget</button>`;d.querySelector('p').textContent=m.text;d.querySelector('small').textContent=`${new Date(m.createdAt).toLocaleString()} · ${(m.tags||[]).join(', ')}`;d.querySelector('button').onclick=async()=>{await window.virag.forgetMemory(m.id);loadMemory()};box.appendChild(d)});
}
$('#clearMemory').onclick=async()=>{if(confirm('Clear all Virag memories?')){await window.virag.clearMemory();loadMemory()}};
loadSettings();

function renderUpdateState(st){
  const el=$('#updateState'); if(!el||!st)return;
  const v=st.currentVersion?`v${st.currentVersion}`:'';
  const latest=st.latestVersion?` → v${st.latestVersion}`:'';
  const map={idle:`Virag ${v}`,checking:'Checking for updates…','up-to-date':`Virag ${v} is up to date.`,available:`Update available ${latest}`,'downloading':`Downloading update… ${st.progress||0}%`,installing:'Installing update…',restarting:'Update installed. Restarting Virag…',error:`Update error: ${st.error||'Unknown error'}`};
  el.textContent=map[st.status]||`Virag ${v}${latest}`;
}
async function refreshUpdateState(){ try{ renderUpdateState(await window.virag.getUpdateState()); }catch{} }
if($('#checkUpdate')) $('#checkUpdate').onclick=async()=>renderUpdateState(await window.virag.checkForUpdates());
window.virag.onUpdateStatus(st=>renderUpdateState(st));
