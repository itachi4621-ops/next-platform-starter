// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      5.7.1
// @description  Auto Project Brand confirmation + live Creative/Video slash commands.
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

(() => {
'use strict';

const V='5.7.1';
const BASE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const URLS={c:BASE+'commands.json',r:BASE+'runtime.json',b:BASE+'brands.json'};
const KEY={c:'csm571.c',r:'csm571.r',b:'csm571.b',manual:'csm571.manual',fam:'csm571.fam'};

const FB={
  runtime:{
    syncSeconds:30,
    baseRules:'Create a finished professional 4:5 Instagram creative, not merely a beautiful product photograph. Preserve the exact uploaded product and brand identity. Use visible graphic design, hierarchy, brand-specific art direction, and separate standalone creatives. Never make a collage unless explicitly requested.',
    families:['typography-led campaign poster','editorial social poster','kinetic diagonal composition','CGI scene finished with graphic design','ingredient/flavour world','technical performance poster','playful branded poster','minimal premium poster']
  },
  brands:{
    'Uji':{aliases:['uji','uji beverages'],type:'beverage',tone:['playful','fresh','youthful'],style:['fruity','dynamic','bright premium'],avoid:['dull static bottle shot','supplement style']},
    'ANS Performance':{aliases:['ans','ans performance'],type:'sports nutrition',tone:['bold','strong','performance-driven'],style:['athletic','high-energy'],avoid:['cute beverage styling','spa look']},
    'Halt Nutrition':{aliases:['halt','halt nutrition','halt uk'],type:'nutrition',tone:['clean','premium','modern'],style:['bright commercial','clean editorial'],avoid:['childish styling']},
    'Joker Nutrition':{aliases:['joker','joker nutrition','joker uk','joker india'],type:'sports nutrition',tone:['bold','edgy','rebellious'],style:['dark premium','aggressive'],avoid:['soft wellness styling']},
    'Ace Vitals':{aliases:['ace vitals','acevitals'],type:'sports nutrition',tone:['clean','energetic','premium'],style:['white premium','performance-focused'],avoid:['generic flat-lay product photo']},
    'Rasa':{aliases:['rasa','rasa indian cuisine'],type:'restaurant',tone:['inviting','appetizing','premium'],style:['food-first','modern Indian'],avoid:['clinical product ad']},
    'Pashtun':{aliases:['pashtun','pashtun restaurant'],type:'restaurant',tone:['bold','social','flavourful'],style:['rich atmosphere','social dining'],avoid:['supplement CGI language']},
    'Ekyam':{aliases:['ekyam','ekyam.ai','ekyam ai'],type:'enterprise technology',tone:['modern','intelligent','clear'],style:['3D systems','clean enterprise'],avoid:['consumer product advertising']}
  },
  commands:[
    {category:'Core',cmd:'/creative',label:'Fresh Creative',desc:'Finished Instagram creative'},
    {category:'Core',cmd:'/trend',label:'Trend-Led',desc:'Current high-end direction'},
    {category:'Core',cmd:'/redesign',label:'Redesign',desc:'Complete visual redesign'},
    {category:'Product',cmd:'/productad',label:'Product Ad',desc:'Designed product advertisement'},
    {category:'Product',cmd:'/cgi',label:'CGI Creative',desc:'CGI + graphic design post'},
    {category:'Video',cmd:'/video',label:'Video Concept',desc:'Complete AI video concept'},
    {category:'Video',cmd:'/productvideo',label:'Product Video',desc:'Cinematic product video'},
    {category:'Video',cmd:'/cgivideo',label:'CGI Video',desc:'CGI product animation'},
    {category:'Video',cmd:'/seedance',label:'Seedance Prompt',desc:'Seedance-ready prompt'},
    {category:'Video',cmd:'/kling',label:'Kling Prompt',desc:'Kling-ready prompt'},
    {category:'Video',cmd:'/runway',label:'Runway Prompt',desc:'Runway-ready prompt'},
    {category:'UGC Video',cmd:'/ugcvideo',label:'UGC Video',desc:'Natural creator-style UGC'},
    {category:'UGC Video',cmd:'/ugc-indian',label:'Indian UGC',desc:'Indian English / Hinglish'},
    {category:'Camera',cmd:'/camera',label:'Camera Motion',desc:'Cinematic camera moves'},
    {category:'Camera',cmd:'/transition',label:'Transitions',desc:'Premium transitions'}
  ]
};

const getJ=(k,f)=>{try{const x=GM_getValue(k,'');return x?JSON.parse(x):f}catch{return f}};
const setJ=(k,v)=>{try{GM_setValue(k,JSON.stringify(v))}catch{}};
const getS=k=>{try{return String(GM_getValue(k,'')||'')}catch{return ''}};
const setS=(k,v)=>{try{GM_setValue(k,String(v||''))}catch{}};

let RT={...FB.runtime,...getJ(KEY.r,{})};
let BR={...FB.brands,...(getJ(KEY.b,{})?.brands||{})};
let CMDS=getJ(KEY.c,FB.commands);
let autoBrand='',projectLabel='',status='Cached',lastSync=0,syncing=false;
let host,shadow,menu,badge,editor,items=[],selected=0,mode='Creatives',cat='All',query='',lastBadge='';

const req=url=>new Promise((ok,no)=>GM_xmlhttpRequest({
  method:'GET',url:url+'?t='+Date.now(),timeout:12000,
  onload:r=>{try{if(r.status<200||r.status>=300)throw 0;ok(JSON.parse(r.responseText))}catch(e){no(e)}},
  onerror:no,ontimeout:no
}));

const norm=s=>String(s||'').toLowerCase().replace(/[_\-–—|/]+/g,' ').replace(/[^\p{L}\p{N}. ]/gu,' ').replace(/\s+/g,' ').trim();
const manual=()=>getS(KEY.manual);
const active=()=>autoBrand||manual();

function mergeCommands(remote){
  const inc=Array.isArray(remote?.commands)?remote.commands:[];
  const map=new Map();
  [...FB.commands,...inc].forEach(x=>x?.cmd&&map.set(x.cmd,{...(map.get(x.cmd)||{}),...x}));
  return [...map.values()];
}
function brandMatch(text){
  const q=norm(text); if(!q)return '';
  const hits=[];
  Object.entries(BR).forEach(([name,p])=>{
    const aliases=[name,...(p.aliases||[])].map(norm).filter(Boolean);
    if(aliases.some(a=>q===a||q.startsWith(a+' ')||q.endsWith(' '+a)||q.includes(' '+a+' ')))hits.push(name);
  });
  const u=[...new Set(hits)];
  return u.length===1?u[0]:'';
}
function projectKey(){
  const p=decodeURIComponent(location.pathname);
  return (p.match(/\/g\/(g-p-[^/]+)/i)||p.match(/\/projects?\/([^/]+)/i)||[])[1]||'';
}
function visible(el){
  if(!el)return '';
  try{const r=el.getBoundingClientRect();if(!r.width||!r.height)return ''}catch{}
  return String(el.innerText||el.textContent||'').trim();
}
function detectProjectBrand(){
  const key=projectKey(),cand=[];
  if(key){
    document.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(href.includes(key)){
        const t=visible(a); if(t&&t.length<120)cand.push(t);
        const p=a.closest('[aria-current="page"],[data-state="active"],[data-active="true"]');
        const pt=visible(p); if(pt&&pt.length<120)cand.unshift(pt);
      }
    });
    cand.push(decodeURIComponent(location.pathname).replace(/[\/_-]+/g,' '));
    if(document.title)cand.push(document.title);
  }
  ['[aria-current="page"][data-testid*="project" i]','[data-testid*="project" i][data-state="active"]','header [aria-label*="project" i]']
    .forEach(sel=>document.querySelectorAll(sel).forEach(el=>{const t=visible(el);if(t&&t.length<120)cand.push(t)}));
  let found='',label='';
  for(const c of cand){const b=brandMatch(c);if(b){found=b;label=c;break}}
  autoBrand=found; projectLabel=label;
  if(found)status='Project → '+found;
  updateUI();
  return found;
}

async function sync(force=false){
  if(syncing)return;
  if(!force&&Date.now()-lastSync<10000){detectProjectBrand();return}
  syncing=true;status='Syncing…';updateUI();
  try{
    const [c,r,b]=await Promise.all([req(URLS.c),req(URLS.r),req(URLS.b)]);
    CMDS=mergeCommands(c);RT={...FB.runtime,...r};BR={...FB.brands,...(b?.brands||{})};
    setJ(KEY.c,CMDS);setJ(KEY.r,RT);setJ(KEY.b,{brands:BR});
    lastSync=Date.now();status='Live';detectProjectBrand();
    if(menu?.classList.contains('show'))render(query,false);
  }catch{status='Offline';updateUI()}
  finally{syncing=false}
}
function syncLoop(){setTimeout(async()=>{await sync(true);syncLoop()},Math.max(15000,Number(RT.syncSeconds||30)*1000))}

function family(){
  const fs=RT.families?.length?RT.families:FB.runtime.families;
  let recent=getJ(KEY.fam,[]);
  let pool=fs.map((_,i)=>i).filter(i=>!recent.includes(i));if(!pool.length)pool=fs.map((_,i)=>i);
  const i=pool[Math.floor(Math.random()*pool.length)];
  setJ(KEY.fam,[i,...recent.filter(x=>x!==i)].slice(0,5));
  return fs[i];
}
function brandContext(){
  detectProjectBrand();
  const n=active(),p=BR[n];
  if(!n||!p)return 'No brand was detected. Infer brand/category from the uploaded product and brief before designing.';
  return `${autoBrand?'AUTO-DETECTED FROM CURRENT CHATGPT PROJECT':'MANUALLY SELECTED'} — ACTIVE BRAND: ${n}. CATEGORY: ${p.type||''}. TONE: ${(p.tone||[]).join(', ')}. STYLE: ${(p.style||[]).join(', ')}. STRICTLY AVOID: ${(p.avoid||[]).join(', ')}. The result must look unmistakably native to ${n}.`;
}
function promptFor(x){
  const bc=brandContext(),base=RT.baseRules||FB.runtime.baseRules;
  if(['Video','UGC Video','Camera'].includes(x.category)){
    return `${bc} ${x.prompt||''} ${x.desc||x.label}. Build a production-ready ${x.category==='UGC Video'?'natural vertical creator-style UGC video':'AI video prompt'} with stable product identity, realistic motion/camera behaviour and coherent flow.`;
  }
  const intent=x.cmd==='/cgi'
    ?'Create a high-end CGI Instagram advertisement but finish it as a true graphic-designed social post, not a standalone CGI beauty image.'
    :x.cmd==='/redesign'
    ?'Completely redesign the uploaded creative into a finished agency-level Instagram feed post.'
    :x.cmd==='/trend'
    ?'Create a current trend-led agency-level Instagram feed creative using an original design direction.'
    :'Create a finished agency-level Instagram feed creative, NOT just a beautiful product photograph.';
  return `${bc} ${intent} Main art-direction family: ${family()}. ${base}`;
}

const CSS=`:host{all:initial}.m{position:fixed;z-index:2147483647;display:none;overflow:hidden;width:min(670px,calc(100vw - 24px));border:1px solid #ffffff20;border-radius:18px;background:#161619fa;color:#fff;box-shadow:0 22px 70px #0008;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.m.show{display:block}.h{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:13px 14px 10px;border-bottom:1px solid #ffffff12}.t{font-size:14px;font-weight:760}.sub{font-size:10px;color:#ffffff80;margin-top:3px}.brand{font-size:11px;color:#d8ccff;margin-top:4px;font-weight:700}.st{font-size:10px;background:#ffffff12;padding:5px 8px;border-radius:99px}.modes{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:9px;border-bottom:1px solid #ffffff12}.mode,.chip,.sync{border:0;cursor:pointer;color:#ffffffb0;background:#ffffff0e}.mode{border-radius:10px;padding:8px 4px;font-size:11px;font-weight:650}.mode.a{background:#a78bfa30;color:#e6ddff}.cats{display:flex;gap:6px;overflow:auto;padding:7px 9px}.chip{border-radius:99px;padding:5px 8px;font-size:10px;white-space:nowrap}.chip.a{background:#a78bfa28;color:#e6ddff}.list{max-height:min(430px,50vh);overflow:auto;padding:7px}.row{display:grid;grid-template-columns:130px 1fr;gap:10px;padding:10px;border-radius:11px;cursor:pointer}.row:hover,.row.a{background:#ffffff14}.cmd{font:750 11px ui-monospace,monospace;color:#b9a5ff}.lab{font-size:12.5px;font-weight:680}.desc{font-size:11px;color:#ffffff88;margin-top:2px}.foot{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-top:1px solid #ffffff0d;font-size:10px;color:#ffffff70}.sync{border-radius:7px;padding:6px 9px;background:#a78bfa22;color:#d9ccff}.badge{position:fixed;right:18px;bottom:92px;z-index:2147483647;display:flex;align-items:center;gap:7px;max-width:310px;padding:8px 11px;border:1px solid #ffffff20;border-radius:999px;background:#17171bea;color:#fff;box-shadow:0 8px 28px #0007;font:700 11px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;backdrop-filter:blur(12px);cursor:pointer}.dot{width:8px;height:8px;border-radius:50%;background:#50d890}.badge.none .dot{background:#f2b84b}.btxt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.src{font-size:9px;color:#ffffff72}.badge.flash{transform:scale(1.04)}@media(max-width:700px){.badge{right:10px;bottom:82px;max-width:230px}}`;

function makeUI(){
  if(menu)return;
  host=document.createElement('div');document.documentElement.appendChild(host);shadow=host.attachShadow({mode:'open'});
  const style=document.createElement('style');style.textContent=CSS;shadow.appendChild(style);
  menu=document.createElement('div');menu.className='m';
  menu.innerHTML=`<div class="h"><div><div class="t">Creative + Video Commands</div><div class="sub">Auto Project Brand • Live Sync • Instagram Creative First</div><div class="brand"></div></div><div class="st">Ready</div></div><div class="modes"></div><div class="cats"></div><div class="list"></div><div class="foot"><span>Script ${V}</span><button class="sync">Sync now</button></div>`;
  shadow.appendChild(menu);
  badge=document.createElement('div');badge.className='badge none';
  badge.innerHTML='<span class="dot"></span><span class="btxt">! Brand not detected</span><span class="src">AUTO</span>';
  badge.onclick=()=>{mode='Brand';cat='All';query='';editor=editor||document.querySelector('textarea')||document.querySelector('[contenteditable="true"]');render('',true)};
  shadow.appendChild(badge);
  menu.querySelector('.sync').onclick=async()=>{await sync(true);render(query,false)};
  updateUI();
}
function updateUI(){
  if(!menu)return;
  const n=active(),source=autoBrand?'AUTO PROJECT':(manual()?'MANUAL':'AUTO');
  menu.querySelector('.brand').textContent=`✓ Brand: ${n||'not detected'} • ${source}${autoBrand&&projectLabel?' • '+projectLabel:''}`;
  menu.querySelector('.st').textContent=status;
  badge.classList.toggle('none',!n);
  badge.querySelector('.btxt').textContent=n?`✓ Brand: ${n}`:'! Brand not detected';
  badge.querySelector('.src').textContent=source;
  badge.title=n?`Confirmed brand: ${n}. Click to change.`:'Brand not detected. Click to choose.';
  if(lastBadge!==n){lastBadge=n;badge.classList.add('flash');setTimeout(()=>badge?.classList.remove('flash'),600)}
}
function position(){
  if(!editor||!menu)return;
  const r=editor.getBoundingClientRect(),w=Math.min(670,Math.max(410,r.width||410));
  menu.style.width=w+'px';menu.style.left=Math.max(12,Math.min(r.left,innerWidth-w-12))+'px';
  let y=r.top-Math.min(570,innerHeight*.66)-10;if(y<12)y=r.bottom+8;menu.style.top=Math.max(12,y)+'px';
}
function modeButtons(){
  const el=menu.querySelector('.modes');el.innerHTML='';
  ['Creatives','Videos','UGC','Camera','Brand','All'].forEach(n=>{const b=document.createElement('button');b.className='mode'+(mode===n?' a':'');b.textContent=n;b.onclick=()=>{mode=n;cat='All';query='';render('',true)};el.appendChild(b)});
}
function categories(){
  let cs=[...new Set(CMDS.map(x=>x.category).filter(Boolean))];
  if(mode==='Videos')cs=['Video'];else if(mode==='UGC')cs=['UGC Video'];else if(mode==='Camera')cs=['Camera'];else if(mode==='Brand')cs=['Brand'];else if(mode==='Creatives')cs=cs.filter(x=>!['Video','UGC Video','Camera','Brand'].includes(x));
  const el=menu.querySelector('.cats');el.innerHTML='';
  ['All',...cs].forEach(c=>{const b=document.createElement('button');b.className='chip'+(cat===c?' a':'');b.textContent=c;b.onclick=()=>{cat=c;render(query,true)};el.appendChild(b)});
}
function brandRows(){
  return [{category:'Brand',cmd:'@auto',label:'Auto Project Brand',desc:autoBrand?`Detected: ${autoBrand}`:'No project brand detected'},...Object.keys(BR).sort().map(n=>({category:'Brand',cmd:'@brand:'+n,label:n,desc:BR[n].type||'Brand'}))];
}
function render(q='',doSync=true){
  makeUI();if(doSync)sync();detectProjectBrand();query=String(q||'').toLowerCase();modeButtons();categories();
  let list=mode==='Brand'?brandRows():[...CMDS];
  if(mode==='Videos')list=list.filter(x=>x.category==='Video');
  else if(mode==='UGC')list=list.filter(x=>x.category==='UGC Video');
  else if(mode==='Camera')list=list.filter(x=>x.category==='Camera');
  else if(mode==='Creatives')list=list.filter(x=>!['Video','UGC Video','Camera','Brand'].includes(x.category));
  if(cat!=='All'&&mode!=='Brand')list=list.filter(x=>x.category===cat);
  if(query)list=list.filter(x=>[x.cmd,x.label,x.desc].join(' ').toLowerCase().includes(query));
  items=list.slice(0,30);selected=Math.min(selected,Math.max(0,items.length-1));
  const el=menu.querySelector('.list');el.innerHTML='';
  items.forEach((x,i)=>{const row=document.createElement('div');row.className='row'+(i===selected?' a':'');row.innerHTML='<div class="cmd"></div><div><div class="lab"></div><div class="desc"></div></div>';row.querySelector('.cmd').textContent=x.cmd.startsWith('@brand:')?'SELECT':x.cmd==='@auto'?'AUTO':x.cmd;row.querySelector('.lab').textContent=x.label;row.querySelector('.desc').textContent=x.desc||'';row.onclick=()=>choose(x);el.appendChild(row)});
  updateUI();menu.classList.add('show');position();
}
const isEd=e=>!!e&&(e.tagName==='TEXTAREA'||e.isContentEditable||e.closest?.('[contenteditable="true"]'));
const getEd=e=>e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]'));
const text=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function setText(e,t){
  if(!e)return;
  if(e.tagName==='TEXTAREA'){const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();return}
  e.focus();const sel=getSelection(),r=document.createRange();r.selectNodeContents(e);sel.removeAllRanges();sel.addRange(r);let ok=false;try{ok=document.execCommand('insertText',false,t)}catch{}if(!ok){e.textContent=t;e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}))}
}
function clearSlash(){if(editor)setText(editor,text(editor).replace(/(?:^|\n)\/[a-zA-Z0-9_-]*$/,''))}
function choose(x){
  if(x.cmd==='@auto'){setS(KEY.manual,'');detectProjectBrand();clearSlash();menu.classList.remove('show');return}
  if(x.cmd.startsWith('@brand:')){setS(KEY.manual,x.cmd.slice(7));detectProjectBrand();clearSlash();menu.classList.remove('show');return}
  const t=text(editor),p=promptFor(x);setText(editor,t.replace(/(?:^|\n)\/[a-zA-Z0-9_-]*$/,m=>(m.startsWith('\n')?'\n':'')+p));menu.classList.remove('show');
}
const slash=t=>{const m=String(t).match(/(?:^|\n)\/([\w-]*)$/);return m?m[1]:null};

document.addEventListener('input',e=>{
  if(!isEd(e.target))return;editor=getEd(e.target);const q=slash(text(editor));
  if(q===null){menu?.classList.remove('show');return}
  sync();detectProjectBrand();const z=q.toLowerCase();
  if(z.startsWith('brand')||z==='setbrand')mode='Brand';else if(z.startsWith('ugc'))mode='UGC';else if(['camera','transition'].some(k=>k.startsWith(z)||z.startsWith(k)))mode='Camera';else if(z.includes('video')||['seedance','kling','runway'].some(k=>k.startsWith(z)||z.startsWith(k)))mode='Videos';else if(!z)mode='Creatives';
  cat='All';render(mode==='Brand'?'':q,false);
},true);

document.addEventListener('keydown',e=>{
  if(!menu?.classList.contains('show')||!isEd(e.target))return;
  if(e.key==='ArrowDown'){e.preventDefault();selected=(selected+1)%Math.max(1,items.length);render(query,false)}
  else if(e.key==='ArrowUp'){e.preventDefault();selected=(selected-1+Math.max(1,items.length))%Math.max(1,items.length);render(query,false)}
  else if(e.key==='Enter'&&!e.shiftKey&&items.length){e.preventDefault();e.stopPropagation();choose(items[selected])}
  else if(e.key==='Escape'){menu.classList.remove('show')}
},true);

let detectTimer;
const scheduleDetect=()=>{clearTimeout(detectTimer);detectTimer=setTimeout(detectProjectBrand,180)};
addEventListener('focus',()=>{sync(true);detectProjectBrand()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);detectProjectBrand()}});
addEventListener('popstate',()=>{sync(true);scheduleDetect()});
['pushState','replaceState'].forEach(k=>{const orig=history[k];history[k]=function(...a){const r=orig.apply(this,a);setTimeout(()=>{sync(true);scheduleDetect()},50);return r}});
new MutationObserver(scheduleDetect).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','data-state','data-active','href']});
addEventListener('resize',position);addEventListener('scroll',position,true);

makeUI();
sync(true).then(()=>{detectProjectBrand();syncLoop()});
})();