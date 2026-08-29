// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      9.0.0
// @description  Virag Stable Core: universal command registry, persistent library cache, one execution engine, health checks, resilient sync and rollback-safe UI.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/creative-slash-menu.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/creative-slash-menu.user.js
// ==/UserScript==
(()=>{'use strict';

const V='9.0.0';
const ROOT='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const SOURCES=[
  {id:'commands',url:ROOT+'commands.json',role:'main'},
  {id:'ai',url:ROOT+'ai-tools.json',role:'token'},
  {id:'3d',url:ROOT+'3d-library.json',role:'image'},
  {id:'movie',url:ROOT+'movie-lab.json',role:'image'},
  {id:'ad3x',url:ROOT+'ad3x.json',role:'prompt'},
  {id:'creative',url:ROOT+'creative-library.json',role:'modules'}
];

const LOCK='ACTIVE BRIEF LOCK — HIGHEST PRIORITY: use only the current request/current composer text and current uploads. Never reuse an older topic, campaign, offer, headline, CTA or concept unless the user explicitly references it.';
const SRC='STRICT SOURCE LOCK: preserve visible source-defining product/package geometry, label/logo/artwork/colors/materials; person identity/proportions/hair; and important existing-design content. Never invent claims, hidden internals, prices, offers, certifications, nutrition, specifications, awards or testimonials.';
const ONE='OUTPUT: generate exactly ONE standalone finished image now. Never return a collage, grid, contact sheet, storyboard board, prompt-only answer, plan or explanation unless the user explicitly asks for that format.';

const BUILTIN=[
 {category:'Core',cmd:'/master',label:'Master Auto Design',desc:'Best-fit current-brief creative',prompt:'Analyze the current brief and execute the strongest appropriate finished creative direction.',kind:'image'},
 {category:'Core',cmd:'/creative',label:'Fresh Creative',desc:'Fresh agency-level creative',prompt:'Create a fresh agency-level finished creative for the current brief.',kind:'image'},
 {category:'Product',cmd:'/productad',label:'Product Ad',desc:'Premium product-first commercial creative',prompt:'Create a premium product-first commercial creative from the current brief.',kind:'image'},
 {category:'Print',cmd:'/flyer',label:'Flyer',desc:'Campaign-led flyer',prompt:'Create a campaign-led flyer for the current brief with strong hierarchy and only supported copy.',kind:'image'},
 {category:'Brand',cmd:'/packaging',label:'Packaging',desc:'Packaging/label/form-factor design',prompt:'Design the packaging/label/form factor itself from the current brief while preserving supplied factual/legal content.',kind:'image'},
 {category:'Identity / Face',cmd:'/facelock',label:'Face Lock',desc:'Strict identity preservation',prompt:'Preserve the supplied person identity strictly while executing the requested creative.',kind:'image'}
];

const AI_FALLBACK=['human','expert','ceo','viral','seo','critic','teacher','eli5','brief','strategy','copywriter','research','brainstorm','promptengineer','summarize','translate','improve','simplify','expand','compare','list','table','outline','code','debug','explaincode','email','coverletter','interview','motivate']
 .map(x=>({category:'AI Tools',cmd:'/'+x,label:x.replace(/(^.|-.)/g,m=>m.toUpperCase()),desc:'AI command token',prompt:'/'+x,kind:'token'}));

const D3_FALLBACK=[
['3dhero','Cinematic 3D Hero'],['3dworld','Immersive Product World'],['3danamorphic','Anamorphic 3D Billboard'],['3dchrome','Chrome Sculpture World'],['3dglass','Glass & Refraction World'],['3dliquid','Liquid Sculpture'],['3dexploded','Exploded Component View'],['3dxray','Translucent X-Ray View'],['3dmacro','Macro Material Detail'],['3dfloating','Zero-Gravity Composition'],['3dsurreal','Surreal Scale Concept'],['3darchitecture','Monumental Architecture'],['3dtype','Sculptural 3D Typography'],['3dmechanical','Mechanical Campaign World'],['3denergy','Volumetric Energy Field'],['3dpedestal','Sculptural Exhibition Display'],['3dportal','Dimensional Portal Reveal'],['3dinflatable','Inflatable Sculpture World'],['3dterrain','Material Terrain World'],['3dminimal','Minimal CGI Sculpture']
].map(([c,l])=>({category:'3D Studio',cmd:'/'+c,label:l,desc:'3D Studio preset',prompt:`Create the ${l} treatment for the current subject with physically coherent perspective, scale, contact, shadows, reflections, materials and lighting. Preserve the supplied subject exactly.`,kind:'image'}));

const gv=(k,d=null)=>{try{return GM_getValue(k,d)}catch{return d}};
const sv=(k,v)=>{try{GM_setValue(k,v)}catch{}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fetchJson=url=>new Promise((ok,no)=>GM_xmlhttpRequest({
 method:'GET',url:url+'?virag='+Date.now(),timeout:12000,
 onload:r=>{try{if(r.status<200||r.status>299)throw Error('HTTP '+r.status);ok(JSON.parse(r.responseText))}catch(e){no(e)}},
 onerror:no,ontimeout:no
}));

let state={
 registry:new Map(),
 sourceState:new Map(),
 modules:{},
 adRuntime:'',
 ratio:String(gv('virag.ratio','Auto')),
 count:String(gv('virag.count','1×1')),
 mode:'All',
 query:'',
 syncing:false,
 lastSync:0,
 host:null,sh:null,dock:null,launcher:null,toast:null,
 queue:false,cancel:false
};

function normCmd(c){c=String(c||'').trim(); if(!c)return''; return c.startsWith('/')?c:'/'+c}
function roleKind(role,x){
 if(x?.kind)return x.kind;
 if(role==='token')return'token';
 const cat=String(x?.category||'').toLowerCase();
 if(/\b(video|ugc|camera|ad multiplier|performance ads)\b/.test(cat))return'prompt';
 return'image';
}
function normalize(x,sourceId,role){
 if(!x||typeof x!=='object')return null;
 const cmd=normCmd(x.cmd);
 if(!/^\/[A-Za-z0-9][A-Za-z0-9_-]*$/.test(cmd))return null;
 return {
  source:sourceId, role,
  category:String(x.category||'Library'),
  cmd,
  key:cmd.toLowerCase(),
  label:String(x.label||cmd.slice(1)),
  desc:String(x.desc||''),
  prompt:String(x.prompt||x.desc||x.label||cmd),
  tags:Array.isArray(x.tags)?x.tags.map(String):[],
  kind:roleKind(role,x)
 }
}
function cacheKey(id){return'virag.cache.'+id}
function cached(id){const v=gv(cacheKey(id),null);if(!v)return null;try{return typeof v==='string'?JSON.parse(v):v}catch{return null}}
function saveCache(id,v){try{sv(cacheKey(id),JSON.stringify(v))}catch{}}
function register(list,sourceId,role,prefer=true){
 let added=0,bad=0;
 for(const raw of list||[]){
  const x=normalize(raw,sourceId,role);
  if(!x){bad++;continue}
  const old=state.registry.get(x.key);
  if(!old||prefer)state.registry.set(x.key,{...(old||{}),...x});
  added++;
 }
 return {added,bad};
}
function seedRegistry(){
 state.registry.clear();
 register(BUILTIN,'builtin','image',true);
 register(AI_FALLBACK,'builtin-ai','token',false);
 register(D3_FALLBACK,'builtin-3d','image',false);
 for(const s of SOURCES){
  if(s.role==='modules')continue;
  const c=cached(s.id);
  if(c?.commands)register(c.commands,'cache:'+s.id,s.role,true);
 }
}
seedRegistry();

async function sync(force=false){
 if(state.syncing||(!force&&Date.now()-state.lastSync<15*60*1000))return;
 state.syncing=true; setStatus('SYNCING');
 const rs=await Promise.allSettled(SOURCES.map(s=>fetchJson(s.url)));
 let loaded=0,failed=0,totalBad=0;
 for(let i=0;i<SOURCES.length;i++){
  const s=SOURCES[i],r=rs[i];
  if(r.status!=='fulfilled'){failed++;state.sourceState.set(s.id,'cache');continue}
  const v=r.value;
  saveCache(s.id,v);
  if(s.role==='modules'){state.modules=v?.modules||state.modules;state.sourceState.set(s.id,'live');loaded++;continue}
  if(s.id==='ad3x')state.adRuntime=String(v?.runtime||'');
  const z=register(v?.commands,s.id,s.role,true);
  totalBad+=z.bad; loaded++; state.sourceState.set(s.id,'live');
 }
 state.lastSync=Date.now();state.syncing=false;
 const h=health();
 setStatus(failed?`READY ${h.valid}/${h.total} · CACHE ${failed}`:`READY ${h.valid}/${h.total}`);
 render();
}
function health(){
 const a=[...state.registry.values()];
 const malformed=a.filter(x=>!x.cmd||!x.kind||!x.prompt);
 const dups=0;
 return {total:a.length,valid:a.length-malformed.length,malformed:malformed.length,dups};
}
function exact(q){return state.registry.get(normCmd(q).toLowerCase())||null}
function allCommands(){return [...state.registry.values()].sort((a,b)=>a.category.localeCompare(b.category)||a.label.localeCompare(b.label))}
function groupOf(x){
 if(x.kind==='token'||/^AI Tools/i.test(x.category))return'AI';
 if(/^3D (Studio|Creatives)/i.test(x.category)||x.tags.includes('3d'))return'3D';
 if(/^Movie Lab/i.test(x.category))return'Movie';
 if(/flyer/i.test(x.category)||x.tags.includes('flyer'))return'Flyer';
 if(/packag|label/i.test(x.category)||x.tags.includes('packaging'))return'Packaging';
 if(/video|ugc|camera|ad multiplier|performance ads/i.test(x.category))return'Video';
 return'Library';
}
function resultList(){
 let a=allCommands();
 if(state.mode!=='All')a=a.filter(x=>groupOf(x)===state.mode);
 const q=state.query.trim().toLowerCase().replace(/^\//,'');
 if(q)a=a.filter(x=>[x.cmd,x.label,x.desc,x.category,...x.tags].join(' ').toLowerCase().includes(q));
 return a;
}

function buildPrompt(x,seq=''){
 const m=state.modules||{};
 const catMap=cached('creative')?.categoryMap||{};
 const modeKey=catMap[x.category]||catMap[x.category?.split(' / ')[0]];
 const pieces=[
  m.master||LOCK,
  `SELECTED COMMAND: ${x.cmd} — ${x.label}.`,
  x.prompt,
  state.ratio!=='Auto'?`FORMAT: ${state.ratio}.`:'',
  state.ratio!=='Auto'?(m.format||'FORMAT LOCK: selected ratio is mandatory; recompose surroundings and never stretch a locked subject.'):'',
  m.assetLocks||SRC
 ];
 if(modeKey&&m[modeKey])pieces.push(m[modeKey]);
 if(groupOf(x)==='3D')pieces.push(cached('3d')?.executionRule||'3D STUDIO DIRECT EXECUTION: generate the final image now.',cached('3d')?.sourceLock||'',cached('3d')?.renderStandard||'',cached('3d')?.diversityRule||'',cached('3d')?.safetyRule||'');
 if(groupOf(x)==='Movie')pieces.push(cached('movie')?.masterRule||'MOVIE LAB: create original cinema-marketing art from the current brief without copying official key art.');
 if(/^Ad Multiplier & Performance Ads$/i.test(x.category)&&state.adRuntime)pieces.push(state.adRuntime);
 if(x.kind==='image')pieces.push(seq||m.singleOutput||ONE);
 pieces.push(m.designQuality||'DESIGN QUALITY: deliver a finished professional result, not a generic template.',m.copy||'COPY POLICY: use only current supplied/visible factual copy; never invent claims.',m.safety||'FACTUAL LOCK: never invent factual claims, prices, offers, specs, certifications, nutrition, awards, testimonials or hidden internals.');
 return [...new Set(pieces.filter(Boolean).map(String))].join(' ');
}

function visible(e){if(!e||!e.isConnected)return false;const r=e.getBoundingClientRect?.();return !!(r&&r.width>16&&r.height>10)}
function editors(){
 const out=[],seen=new Set();
 const sels=['#prompt-textarea','textarea[data-testid="prompt-textarea"]','[data-lexical-editor="true"]','div.ProseMirror','[contenteditable="true"][role="textbox"]','form [contenteditable="true"]','textarea','[contenteditable="true"]'];
 for(const s of sels)for(const e of document.querySelectorAll(s))if(visible(e)&&!seen.has(e)){seen.add(e);out.push(e)}
 return out;
}
function editor(){return editors()[0]||null}
function read(e){return e?.tagName==='TEXTAREA'?e.value:(e?.innerText||e?.textContent||'')}
function inputEvt(type='insertText',data=null){try{return new InputEvent('input',{bubbles:true,inputType:type,data})}catch{return new Event('input',{bubbles:true})}}
function setTextarea(e,t){
 const p=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;
 p?p.call(e,t):e.value=t;
 e.dispatchEvent(inputEvt('insertText',t));e.dispatchEvent(new Event('change',{bubbles:true}));
 return read(e)===t;
}
function setEditableExec(e,t){
 try{
  e.focus({preventScroll:true});
  const s=getSelection(),r=document.createRange();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);
  document.execCommand('delete',false,null);
  if(!document.execCommand('insertText',false,t))return false;
  e.dispatchEvent(inputEvt('insertText',t));
  return read(e).trim()===t.trim();
 }catch{return false}
}
function setEditableDOM(e,t){
 try{
  e.focus({preventScroll:true});
  e.replaceChildren(document.createTextNode(t));
  e.dispatchEvent(new InputEvent('beforeinput',{bubbles:true,cancelable:true,inputType:'insertText',data:t}));
  e.dispatchEvent(inputEvt('insertText',t));
  return read(e).trim()===t.trim();
 }catch{return false}
}
async function write(e,t){
 if(!e)return false;
 try{e.focus({preventScroll:true})}catch{}
 let ok=e.tagName==='TEXTAREA'?setTextarea(e,t):setEditableExec(e,t);
 if(!ok&&e.tagName!=='TEXTAREA')ok=setEditableDOM(e,t);
 if(!ok)return false;
 for(let i=0;i<20;i++){
  const now=read(e);
  if(now&&now.trim().length>=Math.min(8,t.trim().length))return true;
  await sleep(50);
 }
 return false;
}
function replaceSlash(raw,t){
 const rx=/(?:^|\n)\s*\/[A-Za-z0-9_-]*\s*$/;
 if(rx.test(raw))return raw.replace(rx,m=>(m.includes('\n')?'\n':'')+t);
 return raw.trim()?raw.trimEnd()+'\n'+t:t;
}
async function insert(t){
 const e=editor();if(!e)return {ok:false,reason:'EDITOR NOT FOUND'};
 const next=replaceSlash(read(e)||'',t);
 const ok=await write(e,next);
 return {ok,e,reason:ok?'':'INSERT FAILED'};
}
function findSend(e){
 const form=e?.closest?.('form');
 const selectors=['button[data-testid="send-button"]','button[aria-label="Send prompt"]','button[aria-label*="Send" i]','button[type="submit"]'];
 if(form)for(const s of selectors)for(const b of form.querySelectorAll(s))if(visible(b))return b;
 for(const s of selectors)for(const b of document.querySelectorAll(s))if(visible(b))return b;
 return null;
}
function findStop(){
 for(const s of ['button[data-testid="stop-button"]','button[aria-label*="Stop generating" i]','button[aria-label*="Stop" i]'])for(const b of document.querySelectorAll(s))if(visible(b))return b;
 return null;
}
async function sendNow(e){
 for(let i=0;i<100;i++){
  const b=findSend(e)||findSend(editor());
  if(b&&!b.disabled){b.click();return true}
  await sleep(80);
 }
 const f=(e||editor())?.closest?.('form');
 if(f?.requestSubmit){try{f.requestSubmit();await sleep(250);if(findStop()||!read(editor()).trim())return true}catch{}}
 return false;
}
async function waitDone(ms=300000){
 const start=Date.now();let sawBusy=false;
 while(Date.now()-start<ms){
  if(state.cancel)return false;
  if(findStop())sawBusy=true;
  const e=editor(),b=findSend(e);
  if(!findStop()&&(!e||!read(e).trim())&&(sawBusy||(b&&!b.disabled&&Date.now()-start>6000)))return true;
  await sleep(700);
 }
 return false;
}
function counts(){
 const [a,b]=String(state.count||'1×1').split('×').map(Number);
 return [a||1,b||1];
}
function jobPrompts(x){
 if(x.kind!=='image')return[];
 const [items,each]=counts(),total=items*each;
 if(total<=1)return[];
 const a=[];let n=0;
 for(let i=1;i<=items;i++)for(let j=1;j<=each;j++)a.push(buildPrompt(x,`SEQUENTIAL OUTPUT ${++n} OF ${total}: generate exactly one standalone image for reference item ${i}, variation ${j}; never combine outputs.`));
 return a;
}
async function execute(x){
 if(!x)return;
 if(x.kind==='token'){
  const z=await insert(x.cmd+' ');
  setStatus(z.ok?'TOKEN READY':z.reason); if(z.ok)hide(); else showToast(z.reason,true);
  return;
 }
 const jobs=jobPrompts(x);
 if(jobs.length){hide();runQueue(jobs);return}
 const z=await insert(buildPrompt(x));
 if(!z.ok){setStatus(z.reason);showToast(z.reason,true);return}
 setStatus('SENDING');hide();
 if(!await sendNow(z.e)){setStatus('SEND FAILED');showToast('Virag could not activate ChatGPT Send. Prompt is still in the composer.',true)}
}
async function runQueue(jobs){
 if(state.queue)return;
 state.queue=true;state.cancel=false;
 for(let i=0;i<jobs.length&&!state.cancel;i++){
  const z=await insert(jobs[i]);
  if(!z.ok){showToast(z.reason,true);break}
  if(!await sendNow(z.e)){showToast('SEND FAILED',true);break}
  setStatus(`QUEUE ${i+1}/${jobs.length}`);
  if(!await waitDone()){showToast('QUEUE WAIT FAILED',true);break}
 }
 state.queue=false;setStatus(state.cancel?'STOPPED':'READY');
}
function selfTest(){
 const h=health(),e=editor(),send=e?findSend(e):null;
 const sourceLive=[...state.sourceState.values()].filter(x=>x==='live').length;
 const sourceCache=SOURCES.length-sourceLive;
 const pass=h.malformed===0&&h.total>30&&!!e;
 const msg=`${pass?'PASS':'CHECK'} · commands ${h.valid}/${h.total} · editor ${e?'OK':'MISSING'} · send ${send?'FOUND':'IDLE'} · live ${sourceLive} · cache/fallback ${sourceCache}`;
 setStatus(pass?'HEALTH PASS':'HEALTH CHECK');
 showToast(msg,!pass);
 return pass;
}

const CSS=`:host{all:initial;--p:#9a55ff;--p2:#d7b8ff;--t:#f8f3ff;--m:#aaa0b8}*{box-sizing:border-box}.dock{position:fixed;z-index:2147483647;left:50%;bottom:84px;transform:translateX(-50%);width:min(1120px,calc(100vw - 20px));display:none;color:var(--t);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.dock.on{display:block}.shell{padding:10px;border:1px solid #a96dff45;border-radius:25px;background:linear-gradient(145deg,#181228f2,#07070bf7);backdrop-filter:blur(24px) saturate(140%);box-shadow:0 26px 70px #000a,inset 0 1px #fff1}.bar{display:flex;gap:9px;align-items:center;padding:9px;border:1px solid #ffffff12;border-radius:18px;background:#0b0913c7}.v{width:42px;height:42px;border:1px solid #d4aeff66;border-radius:13px;background:linear-gradient(145deg,#a957ff,#5620bd);color:#fff;font-weight:950;box-shadow:0 0 18px #9441ff80;cursor:pointer}.brand{min-width:112px}.brand b{display:block;font-size:12px}.brand small{font-size:8px;color:#a99eb9}.q{flex:1;height:42px;border:1px solid #b88aff28;border-radius:13px;background:#07070c;color:#fff;padding:0 13px;outline:0}.q:focus{border-color:#bb78ff88;box-shadow:0 0 0 3px #8c40ff18}.ver{font-size:8px;color:#b6a9c5;padding:8px}.tabs,.foot{display:flex;gap:6px;overflow:auto;padding:9px 2px}.tab,.chip,.btn,.sel{height:30px;border:1px solid #9e7bc52d;border-radius:10px;background:#14101d;color:#a9a0b4;padding:0 9px;font-size:8px;font-weight:800;white-space:nowrap}.tab{cursor:pointer}.tab.on{color:#fff;border-color:#cf9cff80;background:linear-gradient(145deg,#9f4eff,#5820bd);box-shadow:0 0 15px #8434ff60}.content{border:1px solid #9a75c72c;border-radius:18px;background:#09080e;overflow:hidden}.list{max-height:540px;overflow:auto;padding:9px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.card{min-height:82px;display:grid;grid-template-columns:38px minmax(0,1fr) auto;grid-template-rows:auto auto;gap:4px 9px;align-items:center;padding:11px;border:1px solid #ab87d82b;border-radius:15px;background:linear-gradient(145deg,#1b1528,#0d0b12);cursor:pointer}.card:hover{border-color:#b970ff72;transform:translateY(-1px)}.ic{grid-row:1/3;width:38px;height:38px;display:grid;place-items:center;border:1px solid #b67cff44;border-radius:11px;background:#6e30bb2e;color:#d9b8ff}.name{font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.desc{font-size:8px;color:var(--m);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cmd{grid-column:3;grid-row:1/3;border:1px solid #b67cff55;border-radius:99px;padding:5px 7px;color:#debfff;background:#5d279a30;font:800 8px ui-monospace,monospace}.good{color:#8edbab;border-color:#57bd7a44}.warn{color:#f0cf83;border-color:#c69b4b44}.bad{color:#ff9ca1;border-color:#ff626c44}.sp{flex:1}.btn{cursor:pointer;color:#fff}.launcher{position:fixed;right:22px;bottom:80px;z-index:2147483647;width:58px;height:48px;border:1px solid #c596ff70;border-radius:15px;background:linear-gradient(145deg,#211a34,#0a0910);color:#eadcff;font-weight:950;box-shadow:0 0 20px #9145ff80;cursor:pointer}.dock.on~.launcher{display:none}.toast{position:fixed;right:18px;bottom:144px;z-index:2147483647;max-width:440px;padding:10px 12px;border:1px solid #a277c744;border-radius:12px;background:#0b0910f5;color:#ddd2e8;font:10px Inter,system-ui;box-shadow:0 12px 40px #000a;display:none}.toast.on{display:block}.toast.bad{border-color:#ff6d764f;color:#ffb4b9}@media(max-width:820px){.list{grid-template-columns:1fr}.brand,.ver{display:none}.dock{bottom:72px}}`;
const TABS=[['All','All'],['Library','Creative'],['AI','AI Tools'],['3D','3D Studio'],['Movie','Movie Lab'],['Video','Video / Ad3X'],['Flyer','Flyer'],['Packaging','Packaging']];

function mount(){
 if(state.dock)return;
 state.host=document.createElement('div');document.documentElement.appendChild(state.host);
 state.sh=state.host.attachShadow({mode:'open'});
 state.sh.innerHTML=`<style>${CSS}</style><div class="dock"><div class="shell"><div class="bar"><button class="v">V</button><div class="brand"><b>Virag Stable</b><small>Universal Core</small></div><input class="q" placeholder="Search any /command…"><div class="ver">v${V}</div></div><div class="tabs"></div><div class="content"><div class="list"></div></div><div class="foot"><span class="chip good lock">Active Brief Lock</span><span class="chip health good">BOOTING</span><select class="sel ratio"><option>Auto</option><option>4:5</option><option>1:1</option><option>9:16</option><option>16:9</option></select><select class="sel count"><option>1×1</option><option>1×2</option><option>1×3</option><option>2×1</option><option>2×2</option><option>3×1</option></select><span class="sp"></span><button class="btn test">Self Test</button><button class="btn sync">Sync</button></div></div></div><button class="launcher">V</button><div class="toast"></div>`;
 state.dock=state.sh.querySelector('.dock');state.launcher=state.sh.querySelector('.launcher');state.toast=state.sh.querySelector('.toast');
 state.launcher.onclick=show;state.sh.querySelector('.v').onclick=hide;state.sh.querySelector('.sync').onclick=()=>sync(true);state.sh.querySelector('.test').onclick=selfTest;
 const q=state.sh.querySelector('.q');q.oninput=()=>{state.query=q.value||'';state.mode='All';render()};q.onkeydown=e=>{if(e.key==='Enter'){const x=exact(q.value)||resultList()[0];if(x){e.preventDefault();execute(x)}}if(e.key==='Escape')hide()};
 const r=state.sh.querySelector('.ratio');r.value=state.ratio;r.onchange=()=>{state.ratio=r.value;sv('virag.ratio',state.ratio)};
 const c=state.sh.querySelector('.count');c.value=state.count;c.onchange=()=>{state.count=c.value;sv('virag.count',state.count)};
 render();
}
function setStatus(s){
 mount();const e=state.sh.querySelector('.health');e.textContent=s;e.className='chip health '+(/PASS|READY|ONLINE|TOKEN|SENDING/.test(s)?'good':/FAIL|MISSING|NOT FOUND/.test(s)?'bad':'warn');
}
function showToast(msg,bad=false){
 mount();const e=state.toast;e.textContent=msg;e.className='toast on'+(bad?' bad':'');clearTimeout(showToast.t);showToast.t=setTimeout(()=>e.className='toast',6000);
}
function icon(x){const g=groupOf(x);return g==='AI'?'✦':g==='3D'?'◇':g==='Movie'?'◈':g==='Video'?'▶':g==='Packaging'?'▣':g==='Flyer'?'▱':'◆'}
function render(){
 if(!state.dock)return;
 const tabs=state.sh.querySelector('.tabs');tabs.innerHTML='';
 for(const [v,l] of TABS){const b=document.createElement('button');b.className='tab'+(state.mode===v?' on':'');b.textContent=l;b.onclick=()=>{state.mode=v;state.query='';state.sh.querySelector('.q').value='';render()};tabs.appendChild(b)}
 const list=state.sh.querySelector('.list');list.innerHTML='';
 for(const x of resultList()){const c=document.createElement('div');c.className='card';c.innerHTML='<div class="ic"></div><div class="name"></div><div class="desc"></div><div class="cmd"></div>';c.querySelector('.ic').textContent=icon(x);c.querySelector('.name').textContent=x.label;c.querySelector('.desc').textContent=x.desc||x.category;c.querySelector('.cmd').textContent=x.cmd;c.onmousedown=e=>e.preventDefault();c.onclick=()=>execute(x);list.appendChild(c)}
 if(!list.children.length){const d=document.createElement('div');d.style='grid-column:1/-1;padding:28px;text-align:center;color:#9e94aa;font-size:10px';d.textContent='No matching Virag commands.';list.appendChild(d)}
}
function show(){mount();state.dock.classList.add('on');sync(false);setTimeout(()=>state.sh.querySelector('.q')?.focus({preventScroll:true}),0)}
function hide(){state.dock?.classList.remove('on')}

document.addEventListener('input',e=>{
 const t=e.target;if(!(t?.tagName==='TEXTAREA'||t?.isContentEditable||t?.closest?.('[contenteditable="true"]')))return;
 const ed=t.tagName==='TEXTAREA'||t.isContentEditable?t:t.closest('[contenteditable="true"]');
 const m=read(ed).match(/(?:^|\n)\/([A-Za-z0-9_-]*)$/);if(!m)return;
 state.query=m[1]||'';state.mode='All';show();render();
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.dock?.classList.contains('on'))hide()},true);

(window.requestIdleCallback||((f)=>setTimeout(f,500)))(()=>{mount();sync(true);setInterval(()=>sync(true),21600000)});
})();