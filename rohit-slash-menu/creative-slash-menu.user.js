// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      1.2.1
// @description  Virag V1.2.1 — six clean libraries with hard-refreshed CGI + 3D v2 concept/theme filtering.
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

const V='1.2.1';
const ROOT='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const U={
  Creative:ROOT+'creative-presets.json',
  Flyer:ROOT+'flyer-presets.json',
  '3D':ROOT+'3d-creative.json?lib=2.0.0',
  Packaging:ROOT+'packaging-presets.json',
  Video:ROOT+'video-presets.json',
  'AI Tools':ROOT+'ai-tools.json'
};
const TABS=['Creative','Flyer','3D','Packaging','Video','AI Tools'];
const GROUPS=['All','CGI Concepts','Environment Themes'];
const CACHE='virag.v121.';
const MODE={
  Creative:'STATIC CREATIVE MODE. Create one finished standalone static advertising/social creative for the current brief. Use deliberate hierarchy, a strong focal idea, polished typography when useful and category-fit art direction. Do not answer with only a prompt or plan.',
  Flyer:'FLYER MODE. Create one finished standalone flyer for the current brief only. Prioritize one dominant hook, clear hierarchy, concise factual copy and one CTA when supported. Never reuse an older flyer topic.',
  '3D':'CGI + 3D CAMPAIGN MODE. Create one finished standalone static CGI/3D campaign creative, not a video, storyboard, technical demo or generic pedestal render. Use physically believable scale, perspective, materials, contact, reflections, shadows and environmental lighting. The selected concept or environment is a creative mechanism, not permission to alter the supplied product.',
  Packaging:'PACKAGING MODE. Design the actual package, label or form-factor for the current brief. Use print-aware hierarchy, safe margins, material/finish logic and shelf readability. Do not turn the task into a social post unless explicitly requested.',
  Video:'VIDEO MODE. Return a production-ready video concept, script, motion prompt, camera direction or storyboard according to the selected tool. Keep timing, continuity, product/person identity and motion physically believable. Do not generate a static-image brief unless explicitly requested.'
};
const MASTER='CURRENT BRIEF LOCK. Use only the current composer text, current-turn uploads/attachments and the selected tool. Never import an older campaign, product, festival, offer, headline, CTA, script, visual style or topic unless the user explicitly says previous, above, same as before, continue or reuse.';
const LOCK='SOURCE LOCK. Preserve recognizable product/package geometry, proportions, cap/lid, label/logo/artwork/colors and supplied person identity unless the current user explicitly asks to change them. Do not invent prices, offers, ingredients, nutrition, certifications, specifications, medical/performance claims, awards, testimonials or hidden internals.';
const CONFLICT="CONFLICT RULE. The user's explicit current request outranks the selected preset. The preset controls its named creative task only; do not silently change unrelated facts or requirements.";

const gv=(k,d=null)=>{try{return GM_getValue(k,d)}catch{return d}};
const sv=(k,v)=>{try{GM_setValue(k,v)}catch{}};
const sleep=m=>new Promise(r=>setTimeout(r,m));
const getJSON=u=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:u+(u.includes('?')?'&':'?')+'v='+Date.now(),timeout:12000,onload:r=>{try{if(r.status<200||r.status>299)throw Error('HTTP '+r.status);ok(JSON.parse(r.responseText))}catch(e){no(e)}},onerror:no,ontimeout:no}));
const norm=c=>{c=String(c||'').trim();return c?(c.startsWith('/')?c:'/'+c):''};

let S={libs:{},vers:{},mode:'Creative',group:'All',q:'',syncing:false,online:false,host:null,sh:null,panel:null,toast:null};
for(const t of TABS){S.libs[t]=new Map();S.vers[t]='?'}

function toMap(v,tab){
  const m=new Map();
  for(const r of v?.commands||[]){
    if(!r?.cmd)continue;
    const cmd=norm(r.cmd),id=+r.id||0;
    const group=tab==='3D'?(id>=301?'Environment Themes':'CGI Concepts'):'';
    m.set(cmd.toLowerCase(),{id,tab,group,cmd,label:String(r.label||cmd.slice(1)),desc:String(r.desc||''),instruction:String(r.instruction||r.prompt||r.desc||r.label||cmd)});
  }
  return m;
}
function versionMajor(v){return +(String(v||'0').split('.')[0]||0)}
function load(tab,v){
  const m=toMap(v,tab);
  if(!m.size)return false;
  if(tab==='3D'&&(m.size<50||versionMajor(v.libraryVersion)<2))return false;
  S.libs[tab]=m;S.vers[tab]=String(v.libraryVersion||'?');return true;
}
for(const tab of TABS){
  try{const c=JSON.parse(gv(CACHE+tab.replace(/\s/g,'_'),'null'));if(c)load(tab,c)}catch{}
}

async function sync(manual=false){
  if(S.syncing)return;
  S.syncing=true;status('SYNCING');
  const rs=await Promise.allSettled(TABS.map(t=>getJSON(U[t])));
  let ok=0;
  rs.forEach((r,i)=>{
    const tab=TABS[i];
    if(r.status==='fulfilled'&&load(tab,r.value)){
      sv(CACHE+tab.replace(/\s/g,'_'),JSON.stringify(r.value));ok++;
    }
  });
  S.online=ok===TABS.length;
  S.syncing=false;
  status(S.online?'ONLINE':`PARTIAL ${ok}/${TABS.length}`);
  render();
  if(manual){
    const d3=S.libs['3D'].size===50&&versionMajor(S.vers['3D'])>=2;
    toast(`${d3?'3D V2 LOADED':'3D V2 NOT LOADED'} · ${S.vers['3D']} · ${S.libs['3D'].size} tools`,!d3);
  }
}

function visible(e){if(!e||!e.isConnected)return false;const r=e.getBoundingClientRect?.();return !!(r&&r.width>20&&r.height>12)}
function editor(){for(const s of ['#prompt-textarea','textarea[data-testid="prompt-textarea"]','[data-lexical-editor="true"]','div.ProseMirror','[contenteditable="true"][role="textbox"]','form [contenteditable="true"]','textarea','[contenteditable="true"]'])for(const e of document.querySelectorAll(s))if(visible(e))return e;return null}
const read=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||e?.textContent||'');
function setText(e,t){
  if(!e)return false;try{e.focus({preventScroll:true})}catch{}
  if(e.tagName==='TEXTAREA'){
    const p=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;p?p.call(e,t):e.value=t;
    e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}));e.dispatchEvent(new Event('change',{bubbles:true}));return true;
  }
  try{const s=getSelection(),r=document.createRange();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);document.execCommand('delete',false,null);if(document.execCommand('insertText',false,t)){e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}));return true}}catch{}
  try{e.replaceChildren(document.createTextNode(t));e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}));return true}catch{return false}
}
function stripSlash(raw){return String(raw||'').replace(/(?:^|\n)\s*\/[A-Za-z0-9_-]*\s*$/,'').trim()}
function cleanKnown(raw){
  const known=new Set();for(const t of TABS)for(const k of S.libs[t].keys())known.add(k);
  return String(raw||'').replace(/\/[A-Za-z0-9_-]+/g,m=>known.has(m.toLowerCase())?'':m).replace(/[ \t]{2,}/g,' ').trim();
}
function currentBase(){const e=editor();return e?cleanKnown(stripSlash(read(e))):''}
function buildPrompt(x){
  const base=currentBase();
  const section=x.tab==='3D'?`3D SECTION: ${x.group}.`:'';
  return [MASTER,base?`CURRENT REQUEST / IDEA: ${base}`:'CURRENT REQUEST / IDEA: use the current-turn uploaded reference(s) and current composer intent only.',`SELECTED ${x.tab.toUpperCase()} TOOL: ${x.label}. ${x.instruction}`,section,MODE[x.tab],CONFLICT,LOCK].filter(Boolean).join(' ');
}
function insertToken(x){
  const e=editor();if(!e){status('EDITOR MISSING');toast('ChatGPT composer not found',1);return}
  const raw=read(e)||'',rx=/(?:^|\n)\s*\/[A-Za-z0-9_-]*\s*$/,token=x.cmd+' ';
  const next=rx.test(raw)?raw.replace(rx,m=>(m.includes('\n')?'\n':'')+token):(!raw.trim()?token:raw.trimEnd()+' '+token);
  setText(e,next);hide();
}
function sendBtn(e){const f=e?.closest?.('form'),sels=['button[data-testid="send-button"]','button[aria-label="Send prompt"]','button[aria-label*="Send" i]','button[type="submit"]'];if(f)for(const s of sels)for(const b of f.querySelectorAll(s))if(visible(b))return b;for(const s of sels)for(const b of document.querySelectorAll(s))if(visible(b))return b;return null}
async function send(e){for(let i=0;i<100;i++){const b=sendBtn(e)||sendBtn(editor());if(b&&!b.disabled){b.click();return true}await sleep(80)}const f=e?.closest?.('form');if(f?.requestSubmit){try{f.requestSubmit();return true}catch{}}return false}
async function exec(x){
  if(!x)return;if(x.tab==='AI Tools'){insertToken(x);return}
  const e=editor();if(!e){status('EDITOR MISSING');toast('ChatGPT composer not found',1);return}
  const t=buildPrompt(x);if(!setText(e,t)){status('INSERT FAILED');toast('Could not write to composer',1);return}
  status('SENDING');hide();if(!await send(e)){status('SEND FAILED');toast('Prompt inserted but Send could not be activated.',1)}
}

function list(){
  let a=[...S.libs[S.mode].values()].sort((a,b)=>a.id-b.id);
  if(S.mode==='3D'&&S.group!=='All')a=a.filter(x=>x.group===S.group);
  const q=S.q.trim().toLowerCase().replace(/^\//,'');
  if(q)a=a.filter(x=>`${x.cmd} ${x.label} ${x.desc} ${x.group}`.toLowerCase().includes(q));
  return a;
}
function findForQuery(q){
  q=String(q||'').toLowerCase();if(!q)return null;
  const hits=[];
  for(const t of TABS)for(const x of S.libs[t].values()){
    const c=x.cmd.slice(1).toLowerCase();if(c===q||c.startsWith(q))hits.push(x);
  }
  return hits.length===1?hits[0]:null;
}

const CSS=`:host{all:initial;--ink:#111827;--muted:#64748b;--line:#dfe4ee;--violet:#7c3aed;--panel:rgba(248,250,252,.98)}*{box-sizing:border-box}.panel{position:fixed;z-index:2147483647;right:18px;top:72px;bottom:78px;width:min(1000px,calc(100vw - 260px));min-width:720px;display:none;flex-direction:column;overflow:hidden;color:var(--ink);border:1px solid #d8deea;border-radius:22px;background:radial-gradient(620px 220px at 0 0,#ede9fe 0,transparent 65%),radial-gradient(520px 220px at 100% 0,#cffafe 0,transparent 62%),var(--panel);box-shadow:0 28px 80px #0f172a2b;backdrop-filter:blur(18px);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.panel.on{display:flex}.top{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 11px;border-bottom:1px solid var(--line);background:#ffffffd9}.brand{display:flex;gap:10px;align-items:center}.logo{width:36px;height:36px;border:0;border-radius:11px;color:#fff;background:linear-gradient(135deg,#7c3aed,#4f46e5 58%,#0891b2);font-weight:950;cursor:pointer}.brand b{display:block;font-size:15px}.brand small{display:block;margin-top:2px;color:#64748b;font-size:8px;font-weight:700}.status{border:1px solid #a7f3d0;background:#ecfdf5;color:#047857;border-radius:999px;padding:6px 9px;font-size:8px;font-weight:900}.tabs{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;padding:10px 12px 8px;background:#fff9}.tab,.groupbtn{height:36px;border:1px solid #e2e8f0;border-radius:11px;background:#fff;color:#64748b;font-size:9px;font-weight:900;cursor:pointer}.tab.on{border-color:#c4b5fd;background:#f5f3ff;color:#5b21b6;box-shadow:0 0 0 2px #8b5cf612}.tab[data-t="3D"].on{border-color:#99f6e4;background:#ecfdf5;color:#047857}.groups{display:none;gap:7px;padding:0 12px 10px;border-bottom:1px solid var(--line);background:#fff9}.groups.on{display:flex}.groupbtn{height:31px;padding:0 12px}.groupbtn.on{border-color:#99f6e4;background:#ecfdf5;color:#047857}.searchrow{display:grid;grid-template-columns:1fr auto;gap:8px;padding:10px 12px}.q{height:40px;border:1px solid #d7deea;border-radius:12px;background:#fff;color:#0f172a;padding:0 12px;outline:none;font-size:10px}.q:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px #8b5cf61a}.sync{height:40px;border:1px solid #d7deea;border-radius:12px;background:#fff;color:#334155;padding:0 12px;font-size:9px;font-weight:900;cursor:pointer}.bar{display:flex;align-items:center;justify-content:space-between;padding:0 14px 9px}.title{font-size:13px;font-weight:950}.meta{font-size:8.5px;color:#64748b}.grid{flex:1;overflow:auto;padding:3px 12px 14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-content:start;gap:10px}.card{position:relative;min-height:114px;padding:12px;border:1px solid #dde3ed;border-radius:15px;background:#fff;cursor:pointer;transition:.15s}.card:before{content:"";position:absolute;inset:0 0 auto;height:3px;border-radius:15px 15px 0 0;background:linear-gradient(90deg,#8b5cf6,#22d3ee);opacity:.75}.card:hover{transform:translateY(-2px);border-color:#c4b5fd;box-shadow:0 12px 28px #64748b22}.card[data-tab="3D"]:before{background:linear-gradient(90deg,#10b981,#22d3ee)}.cmd{display:inline-block;border:1px solid #e5e7eb;border-radius:999px;padding:4px 7px;background:#f8fafc;color:#64748b;font:800 8.5px ui-monospace,monospace}.tag{float:right;border-radius:999px;padding:4px 7px;background:#ecfdf5;color:#047857;font-size:7.5px;font-weight:900}.name{margin-top:10px;font-size:12px;font-weight:950}.desc{margin-top:5px;color:#64748b;font-size:9.5px;line-height:1.4}.empty{grid-column:1/-1;padding:30px;border:1px dashed #cbd5e1;border-radius:15px;text-align:center;color:#64748b;font-size:10px}.foot{display:flex;gap:7px;align-items:center;padding:8px 11px;border-top:1px solid var(--line);background:#fff;overflow:auto}.chip{border:1px solid #e2e8f0;border-radius:999px;padding:5px 8px;background:#f8fafc;color:#64748b;font:800 7.5px ui-monospace,monospace;white-space:nowrap}.launcher{position:fixed;right:20px;bottom:88px;z-index:2147483647;width:46px;height:46px;border:1px solid #c4b5fd;border-radius:14px;background:linear-gradient(145deg,#7c3aed,#4f46e5 55%,#0891b2);color:#fff;box-shadow:0 12px 32px #7c3aed40;font-weight:950;cursor:pointer}.panel.on~.launcher{display:none}.toast{position:fixed;right:20px;bottom:145px;z-index:2147483647;display:none;max-width:520px;padding:10px 12px;border:1px solid #7acb9155;border-radius:11px;background:#111827;color:#f8fafc;font:9px Inter,system-ui}.toast.on{display:block}.toast.bad{border-color:#fb7185}@media(max-width:1050px){.panel{right:8px;width:calc(100vw - 16px);min-width:0}.tabs{grid-template-columns:repeat(3,1fr)}.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){.grid{grid-template-columns:1fr}.tabs{grid-template-columns:repeat(2,1fr)}.groups{overflow:auto}}`;

function mount(){
  if(S.panel)return;
  S.host=document.createElement('div');document.documentElement.appendChild(S.host);S.sh=S.host.attachShadow({mode:'open'});
  S.sh.innerHTML=`<style>${CSS}</style><div class="panel"><div class="top"><div class="brand"><button class="logo">V</button><div><b>Virag Creative OS</b><small>SIX CLEAN LIBRARIES · CGI + 3D V2 HARD REFRESH</small></div></div><div class="status">v${V} · READY</div></div><div class="tabs"></div><div class="groups"></div><div class="searchrow"><input class="q" placeholder="Search inside Creative…"><button class="sync">SYNC</button></div><div class="bar"><div class="title"></div><div class="meta"></div></div><div class="grid"></div><div class="foot"></div></div><button class="launcher">V</button><div class="toast"></div>`;
  S.panel=S.sh.querySelector('.panel');S.toast=S.sh.querySelector('.toast');
  S.sh.querySelector('.launcher').onclick=show;S.sh.querySelector('.logo').onclick=hide;S.sh.querySelector('.sync').onclick=()=>sync(true);
  const q=S.sh.querySelector('.q');q.oninput=()=>{S.q=q.value;render()};q.onkeydown=e=>{if(e.key==='Escape')hide();if(e.key==='Enter'){const x=list()[0];if(x){e.preventDefault();exec(x)}}};render();
}
function status(s){mount();S.sh.querySelector('.status').textContent=`v${V} · ${s}`}
function toast(m,b=0){mount();const e=S.toast;e.textContent=m;e.className='toast on'+(b?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='toast',5500)}
function render(){
  if(!S.panel)return;
  const tabs=S.sh.querySelector('.tabs');tabs.innerHTML='';
  for(const t of TABS){
    const b=document.createElement('button');b.className='tab'+(S.mode===t?' on':'');b.dataset.t=t;b.textContent=t;
    b.onclick=()=>{S.mode=t;S.group='All';S.q='';const q=S.sh.querySelector('.q');q.value='';q.placeholder=`Search inside ${t}…`;render()};tabs.appendChild(b);
  }
  const groups=S.sh.querySelector('.groups');groups.innerHTML='';groups.classList.toggle('on',S.mode==='3D');
  if(S.mode==='3D')for(const g of GROUPS){const b=document.createElement('button');b.className='groupbtn'+(S.group===g?' on':'');b.textContent=g+(g==='All'?` (${S.libs['3D'].size})`:g==='CGI Concepts'?' (25)':' (25)');b.onclick=()=>{S.group=g;S.q='';S.sh.querySelector('.q').value='';render()};groups.appendChild(b)}
  const a=list();S.sh.querySelector('.title').textContent=S.mode==='3D'?`CGI + 3D · ${S.group}`:S.mode;
  S.sh.querySelector('.meta').textContent=`Library ${S.vers[S.mode]} · ${S.libs[S.mode].size} tools${S.mode==='3D'?` · showing ${a.length}`:''}`;
  const grid=S.sh.querySelector('.grid');grid.innerHTML='';
  for(const x of a){const c=document.createElement('div');c.className='card';c.dataset.tab=x.tab;c.innerHTML='<span class="cmd"></span><span class="tag"></span><div class="name"></div><div class="desc"></div>';c.querySelector('.cmd').textContent=x.cmd;const tag=c.querySelector('.tag');tag.textContent=x.tab==='3D'?x.group:'';tag.style.display=x.tab==='3D'?'inline-block':'none';c.querySelector('.name').textContent=x.label;c.querySelector('.desc').textContent=x.desc;c.onmousedown=e=>e.preventDefault();c.onclick=()=>exec(x);grid.appendChild(c)}
  if(!a.length)grid.innerHTML='<div class="empty">No tools found in this library.</div>';
  const f=S.sh.querySelector('.foot');f.innerHTML='';for(const t of TABS){const c=document.createElement('span');c.className='chip';c.textContent=`${t} ${S.vers[t]}${t==='3D'?` · ${S.libs[t].size}`:''}`;f.appendChild(c)}
}
function show(){mount();S.panel.classList.add('on');setTimeout(()=>S.sh.querySelector('.q')?.focus({preventScroll:true}),0)}
function hide(){S.panel?.classList.remove('on')}

document.addEventListener('input',ev=>{
  const t=ev.target;if(!(t?.tagName==='TEXTAREA'||t?.isContentEditable||t?.closest?.('[contenteditable="true"]')))return;
  const e=t.tagName==='TEXTAREA'||t.isContentEditable?t:t.closest('[contenteditable="true"]');
  const m=read(e).match(/(?:^|\n)\s*\/([A-Za-z0-9_-]*)$/);if(!m)return;
  mount();S.q=m[1]||'';const hit=findForQuery(S.q);if(hit){S.mode=hit.tab;S.group=hit.tab==='3D'?hit.group:'All'}show();const q=S.sh.querySelector('.q');q.value=S.q;q.placeholder=`Search inside ${S.mode}…`;render();
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.panel?.classList.contains('on'))hide()},true);

(window.requestIdleCallback||((f)=>setTimeout(f,450)))(()=>{mount();status('READY');sync(false)});
})();