// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      5.7.0
// @description  Auto-detect ChatGPT Project brand + live creative/video command sync.
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

const VERSION='5.7.0';
const BASE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const URL={commands:BASE+'commands.json',runtime:BASE+'runtime.json',brands:BASE+'brands.json'};
const K={lib:'csm57.lib',rt:'csm57.rt',brands:'csm57.brands',manual:'csm57.manualBrand',family:'csm57.family'};

const FALLBACK_RT={
  syncSeconds:30,
  baseRules:'Create a finished 4:5 Instagram creative, not merely a product photograph. Preserve the exact uploaded product and brand identity. Use intentional graphic design, hierarchy, brand-specific art direction and separate standalone creatives. Never make a collage unless explicitly requested.',
  families:[
    'typography-led campaign poster with oversized type and product integration',
    'editorial social poster with strong grid, crop, labels and hierarchy',
    'kinetic diagonal composition with bold graphic movement',
    'CGI hero scene finished with typography, frames and brand graphics',
    'ingredient/flavour world with designed social layout',
    'technical performance poster with linework and structured hierarchy',
    'playful branded poster with custom shapes, stickers and dynamic scale',
    'minimal premium poster with disciplined grid and one strong type gesture'
  ]
};

const FALLBACK_BRANDS={brands:{
  'Uji':{aliases:['uji','uji beverages','uji beverage'],type:'beverage',tone:['playful','fresh','youthful','vibrant'],style:['fruity','dynamic','bright premium'],preferred:['flavour storytelling','motion','bold graphic composition'],avoid:['dull static bottle shot','generic luxury poster','supplement style']},
  'ANS Performance':{aliases:['ans','ans performance','ans performance india'],type:'sports nutrition',tone:['bold','strong','performance-driven'],style:['athletic','high-energy','premium performance'],preferred:['strength cues','technical credibility','dynamic product scale'],avoid:['cute beverage styling','spa look']},
  'Halt Nutrition':{aliases:['halt','halt nutrition','halt uk'],type:'nutrition and supplements',tone:['clean','premium','modern'],style:['bright commercial','modern wellness','clean editorial'],preferred:['clean product focus','credible nutrition storytelling'],avoid:['childish styling','same dark setup repeatedly']},
  'Joker Nutrition':{aliases:['joker','joker nutrition','joker uk','joker india'],type:'sports nutrition',tone:['bold','edgy','rebellious'],style:['dark premium','aggressive','graphic'],preferred:['impact visuals','attitude','dramatic framing'],avoid:['soft wellness styling','plain catalogue setup']},
  'Ace Vitals':{aliases:['ace vitals','acevitals'],type:'sports nutrition',tone:['clean','energetic','premium'],style:['white premium','performance-focused'],preferred:['technical confidence','fresh performance graphics'],avoid:['generic flat-lay product photo','muddy dark styling']},
  'Muscle Mantra':{aliases:['muscle mantra','musclemantra'],type:'sports nutrition',tone:['strong','energetic','credible'],style:['performance commercial','bold product hero'],preferred:['athletic cues','high-impact product focus'],avoid:['soft spa styling']},
  'Bodybuilding India':{aliases:['bbi','bodybuilding india'],type:'sports nutrition retail',tone:['credible','strong','professional'],style:['bright premium','retail authority'],preferred:['fitness cues','clear hierarchy'],avoid:['soft lifestyle-only imagery']},
  'Chawla Bakers':{aliases:['chawla bakers','chawala bakers'],type:'bakery and food',tone:['warm','delicious','friendly'],style:['appetite-led','fresh bakery'],preferred:['food texture','celebration','warm editorial'],avoid:['supplement-style ad']},
  'Rasa':{aliases:['rasa','rasa indian cuisine'],type:'restaurant and hospitality',tone:['inviting','appetizing','premium'],style:['food-first','rich culinary','modern Indian'],preferred:['appetite appeal','dining emotion','food texture'],avoid:['clinical product ad']},
  'Pashtun':{aliases:['pashtun','pashtun restaurant'],type:'restaurant and hospitality',tone:['bold','social','flavourful'],style:['food and drink lifestyle','rich atmosphere'],preferred:['social dining energy','food texture'],avoid:['supplement CGI language']},
  'Ekyam':{aliases:['ekyam','ekyam.ai','ekyam ai'],type:'enterprise technology and AI',tone:['modern','intelligent','clear'],style:['3D system visuals','clean enterprise','minimal information design'],preferred:['clear visual systems','minimal text'],avoid:['consumer product advertising','random cyberpunk']},
  'ACESTAR':{aliases:['acestar','ace star'],type:'sports nutrition',tone:['premium','strong','technical'],style:['metallic gold','black premium','structured'],preferred:['metallic detail','performance hierarchy'],avoid:['cute styling','random colourful props']}
}};

const FALLBACK_COMMANDS=[
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
  {category:'UGC Video',cmd:'/ugc-american',label:'American UGC',desc:'American creator'},
  {category:'UGC Video',cmd:'/ugc-british',label:'British UGC',desc:'British creator'},
  {category:'Camera',cmd:'/camera',label:'Camera Motion',desc:'Cinematic camera moves'},
  {category:'Camera',cmd:'/transition',label:'Transitions',desc:'Premium transitions'}
];

const gv=(k,f)=>{try{const v=GM_getValue(k,'');return v?JSON.parse(v):f}catch{return f}};
const sv=(k,v)=>{try{GM_setValue(k,JSON.stringify(v))}catch{}};
const gs=k=>{try{return String(GM_getValue(k,'')||'')}catch{return ''}};
const ss=(k,v)=>{try{GM_setValue(k,String(v||''))}catch{}};

let LIB={commands:FALLBACK_COMMANDS,categories:[...new Set(FALLBACK_COMMANDS.map(x=>x.category))]};
let RT={...FALLBACK_RT,...gv(K.rt,{})};
let BR={brands:{...FALLBACK_BRANDS.brands,...(gv(K.brands,{})?.brands||{})}};
let status='Cached',lastSync=0,syncing=false,autoBrand='',projectLabel='',detectTimer=0;

function request(url){
  return new Promise((ok,no)=>GM_xmlhttpRequest({
    method:'GET',url:url+'?t='+Date.now(),timeout:12000,
    onload:r=>{try{if(r.status<200||r.status>=300)throw Error('HTTP '+r.status);ok(JSON.parse(r.responseText))}catch(e){no(e)}},
    onerror:no,ontimeout:()=>no(Error('timeout'))
  }));
}

function normalizeLibrary(remote){
  const incoming=Array.isArray(remote?.commands)?remote.commands:[];
  const local=Object.fromEntries(FALLBACK_COMMANDS.map(x=>[x.cmd,x]));
  const remoteMap=Object.fromEntries(incoming.filter(x=>x?.cmd).map(x=>[x.cmd,x]));
  const order=[];
  incoming.concat(FALLBACK_COMMANDS).forEach(x=>{if(x?.cmd&&!order.includes(x.cmd))order.push(x.cmd)});
  const commands=order.map(c=>({...local[c],...remoteMap[c]})).filter(x=>x.cmd&&x.label);
  return {commands,categories:[...new Set([...(remote?.categories||[]),...commands.map(x=>x.category)])]};
}

const allBrands=()=>BR.brands||{};
const manualBrand=()=>gs(K.manual);
const activeBrandName=()=>autoBrand||manualBrand();
const activeProfile=()=>allBrands()[activeBrandName()]||null;

function normal(s){return String(s||'').toLowerCase().replace(/[_\-–—|/]+/g,' ').replace(/[^\p{L}\p{N}. ]/gu,' ').replace(/\s+/g,' ').trim()}
function findBrandExact(q){
  q=normal(q); if(!q)return '';
  return Object.keys(allBrands()).find(name=>[name,...(allBrands()[name].aliases||[])].map(normal).includes(q))||'';
}
function brandFromProjectText(text){
  const q=normal(text); if(!q)return '';
  const hits=[];
  Object.entries(allBrands()).forEach(([name,b])=>{
    const aliases=[name,...(b.aliases||[])].map(normal).filter(Boolean).sort((a,b)=>b.length-a.length);
    if(aliases.some(a=>q===a||q.startsWith(a+' ')||q.endsWith(' '+a)||q.includes(' '+a+' ')))hits.push(name);
  });
  const unique=[...new Set(hits)];
  return unique.length===1?unique[0]:'';
}

function projectRouteKey(){
  const p=decodeURIComponent(location.pathname);
  let m=p.match(/\/g\/(g-p-[^/]+)/i); if(m)return m[1];
  m=p.match(/\/projects?\/([^/]+)/i); if(m)return m[1];
  return '';
}
function vis(el){
  if(!el)return '';
  try{const r=el.getBoundingClientRect();if(!r.width||!r.height)return ''}catch{}
  return String(el.innerText||el.textContent||'').trim();
}
function detectProject(){
  const key=projectRouteKey(),candidates=[];
  if(key){
    document.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(href.includes(key)){
        const t=vis(a);if(t&&t.length<100)candidates.push(t);
        const parent=a.closest('[aria-current="page"],[data-state="active"],[data-active="true"]');
        const pt=vis(parent);if(pt&&pt.length<100)candidates.unshift(pt);
      }
    });
  }
  [
    '[aria-current="page"][data-testid*="project" i]',
    '[data-testid*="project" i][data-state="active"]',
    '[data-testid*="project" i][data-active="true"]',
    'header [aria-label*="project" i]'
  ].forEach(sel=>document.querySelectorAll(sel).forEach(el=>{const t=vis(el);if(t&&t.length<100)candidates.push(t)}));
  if(key){
    candidates.push(decodeURIComponent(location.pathname).replace(/[\/_-]+/g,' '));
    if(document.title)candidates.push(document.title);
  }
  for(const label of candidates){
    const brand=brandFromProjectText(label);
    if(brand)return {brand,label};
  }
  return {brand:'',label:candidates[0]||''};
}
function detectProjectBrand(){
  const d=detectProject();
  autoBrand=d.brand||'';
  projectLabel=d.label||'';
  if(autoBrand)status='Project → '+autoBrand;
  updateHeader();
  return autoBrand;
}
function scheduleDetect(){clearTimeout(detectTimer);detectTimer=setTimeout(detectProjectBrand,180)}

async function sync(force=false){
  if(syncing)return;
  if(!force&&Date.now()-lastSync<10000){detectProjectBrand();return}
  syncing=true;status='Syncing…';updateHeader();
  try{
    const [commands,runtime,brands]=await Promise.all([request(URL.commands),request(URL.runtime),request(URL.brands)]);
    LIB=normalizeLibrary(commands);
    RT={...FALLBACK_RT,...runtime};
    BR={brands:{...FALLBACK_BRANDS.brands,...(brands?.brands||{})}};
    sv(K.lib,LIB);sv(K.rt,RT);sv(K.brands,BR);
    lastSync=Date.now();status='Live';detectProjectBrand();
    if(menu?.classList.contains('show'))render(query,false);
  }catch{status='Offline';updateHeader()}
  finally{syncing=false}
}
function syncLoop(){setTimeout(async()=>{await sync(true);syncLoop()},Math.max(15000,Number(RT.syncSeconds||30)*1000))}

function brandContext(){
  detectProjectBrand();
  const name=activeBrandName(),b=activeProfile();
  if(!name||!b)return 'No active brand was detected. Infer the brand/category from the uploaded product and brief before designing; never force the same style on every brand.';
  const src=autoBrand?'AUTO-DETECTED FROM THE CURRENT CHATGPT PROJECT':'MANUALLY SELECTED';
  return `${src}. ACTIVE BRAND: ${name}. CATEGORY: ${b.type||''}. TONE: ${(b.tone||[]).join(', ')}. STYLE: ${(b.style||[]).join(', ')}. PREFERRED: ${(b.preferred||[]).join(', ')}. STRICTLY AVOID: ${(b.avoid||[]).join(', ')}. Make the output unmistakably native to ${name}.`;
}
function pickFamily(){
  const fs=RT.families?.length?RT.families:FALLBACK_RT.families;
  let recent=gv(K.family,[]);
  let pool=fs.map((_,i)=>i).filter(i=>!recent.includes(i));
  if(!pool.length)pool=fs.map((_,i)=>i);
  const i=pool[Math.floor(Math.random()*pool.length)];
  sv(K.family,[i,...recent.filter(x=>x!==i)].slice(0,5));
  return fs[i];
}
function promptFor(x){
  const bc=brandContext(),base=RT.baseRules||FALLBACK_RT.baseRules;
  if(['Video','UGC Video','Camera'].includes(x.category)){
    const remote=x.prompt?`${x.prompt} `:'';
    return `${bc} ${remote}${x.desc||x.label}. Build a production-ready ${x.category==='UGC Video'?'natural vertical creator-style UGC video':'AI video prompt'} with stable product identity, realistic motion/camera behaviour and coherent visual flow.`;
  }
  const f=pickFamily();
  const intent=x.cmd==='/cgi'
    ?'Create a high-end CGI-based Instagram advertisement, but finish it as a true graphic-designed social post rather than a standalone CGI beauty image.'
    :x.cmd==='/redesign'
    ?'Completely redesign the uploaded creative into a finished agency-level Instagram feed post.'
    :x.cmd==='/trend'
    ?'Create a current trend-led, agency-level Instagram feed creative; research current high-end references when useful and synthesize an original design.'
    :'Create a finished agency-level Instagram feed creative, NOT just a beautiful product photograph.';
  return `${bc} ${intent} Main art-direction family: ${f}. ${base}`;
}

let host,root,menu,editor,items=[],selected=0,query='',mode='Creatives',category='All';
const CSS=`:host{all:initial}.m{position:fixed;z-index:2147483647;display:none;overflow:hidden;border:1px solid #ffffff20;border-radius:18px;background:#161619fa;color:#fff;box-shadow:0 22px 70px #0008;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.m.show{display:block}.h{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:13px 14px 10px;border-bottom:1px solid #ffffff12}.t{font-size:14px;font-weight:750}.s{font-size:10px;color:#ffffff80;margin-top:3px}.brand{font-size:11px;color:#d8ccff;margin-top:4px;font-weight:650;max-width:520px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.st{font-size:10px;background:#ffffff12;padding:5px 8px;border-radius:99px}.modes{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:9px;border-bottom:1px solid #ffffff12}.mode,.cat,.sync{border:0;cursor:pointer;color:#ffffffb0;background:#ffffff0e}.mode{border-radius:10px;padding:8px 4px;font-weight:650;font-size:11px}.mode.a,.mode:hover{background:#a78bfa30;color:#e6ddff}.cats{display:flex;gap:6px;overflow-x:auto;padding:7px 9px;border-bottom:1px solid #ffffff0d}.cat{border-radius:99px;padding:5px 8px;font-size:10px;white-space:nowrap}.cat.a{background:#a78bfa28;color:#e6ddff}.list{max-height:min(430px,50vh);overflow:auto;padding:7px}.i{display:grid;grid-template-columns:130px 1fr;gap:10px;padding:10px;border-radius:11px;cursor:pointer}.i:hover,.i.a{background:#ffffff14}.cmd{font:750 11.5px ui-monospace,monospace;color:#b9a5ff}.lab{font-size:12.5px;font-weight:680}.chip{font-size:9px;color:#ffffff70;background:#ffffff0d;border-radius:5px;padding:2px 5px;margin-left:6px}.d{font-size:11px;color:#ffffff88;margin-top:2px}.f{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-top:1px solid #ffffff0d;font-size:10px;color:#ffffff70}.sync{border-radius:7px;padding:6px 9px;background:#a78bfa22;color:#d9ccff}`;

const isEd=e=>!!e&&(e.tagName==='TEXTAREA'||e.isContentEditable||e.closest?.('[contenteditable="true"]'));
const getEd=e=>e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]'));
const txt=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function setTxt(e,t){
  if(!e)return;
  if(e.tagName==='TEXTAREA'){
    const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;
    s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();return;
  }
  e.focus();const sel=getSelection(),r=document.createRange();r.selectNodeContents(e);sel.removeAllRanges();sel.addRange(r);
  let ok=false;try{ok=document.execCommand('insertText',false,t)}catch{}
  if(!ok){e.replaceChildren();const p=document.createElement('p');p.textContent=t;e.appendChild(p);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}))}
}
function make(){
  if(menu)return;
  host=document.createElement('div');host.style.cssText='position:fixed;z-index:2147483647';document.documentElement.appendChild(host);
  root=host.attachShadow({mode:'open'});const st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
  menu=document.createElement('div');menu.className='m';
  menu.innerHTML=`<div class="h"><div><div class="t">Creative + Video Commands</div><div class="s">Auto Project Brand • Live Sync • Instagram Creative First</div><div class="brand"></div></div><div class="st">Ready</div></div><div class="modes"></div><div class="cats"></div><div class="list"></div><div class="f"><span>Script ${VERSION}</span><button class="sync">Sync now</button></div>`;
  root.appendChild(menu);
  menu.querySelector('.sync').onmousedown=async e=>{e.preventDefault();await sync(true);render(query,false)};
  updateHeader();
}
function updateHeader(){
  if(!menu)return;
  const source=autoBrand?'Auto Project':'Manual/Auto';
  menu.querySelector('.brand').textContent=`${source}: ${activeBrandName()||'none'}${autoBrand&&projectLabel?' • '+projectLabel:''}`;
  menu.querySelector('.st').textContent=status;
}
function pos(){
  if(!menu||!editor)return;
  const r=editor.getBoundingClientRect(),w=Math.min(670,Math.max(410,r.width||410));
  menu.style.width=w+'px';menu.style.left=Math.max(12,Math.min(r.left,innerWidth-w-12))+'px';
  let y=r.top-Math.min(570,innerHeight*.66)-10;if(y<12)y=r.bottom+8;menu.style.top=Math.max(12,y)+'px';
}
function modes(){
  const w=menu.querySelector('.modes');w.innerHTML='';
  [['Creatives','Creatives'],['Videos','Videos'],['UGC','UGC'],['Camera','Camera'],['Brand','Brand'],['All','All']].forEach(([n,l])=>{
    const b=document.createElement('button');b.className='mode'+(mode===n?' a':'');b.textContent=l;
    b.onmousedown=e=>{e.preventDefault();mode=n;category='All';selected=0;query='';render('',true)};w.appendChild(b)
  });
}
function cats(){
  const w=menu.querySelector('.cats');w.innerHTML='';let cs=[...(LIB.categories||[])];
  if(mode==='Videos')cs=['Video'];else if(mode==='UGC')cs=['UGC Video'];else if(mode==='Camera')cs=['Camera'];else if(mode==='Brand')cs=['Brand'];else if(mode==='Creatives')cs=cs.filter(x=>!['Video','UGC Video','Camera','Brand'].includes(x));
  ['All',...cs].forEach(c=>{const b=document.createElement('button');b.className='cat'+(category===c?' a':'');b.textContent=c;b.onmousedown=e=>{e.preventDefault();category=c;selected=0;render(query,true)};w.appendChild(b)});
}
function brandRows(){
  const rows=[{category:'Brand',cmd:'@clear',label:'Clear Manual Brand',desc:'Project auto-detection remains enabled'}];
  Object.keys(allBrands()).sort().forEach(n=>{const b=allBrands()[n];rows.push({category:'Brand',cmd:'@brand:'+n,label:n,desc:`${b.type||'brand'} • ${(b.tone||[]).slice(0,3).join(', ')}`})});
  return rows;
}
function render(q='',doSync=true){
  make();if(doSync)sync();detectProjectBrand();query=String(q||'').toLowerCase();modes();cats();
  let a=mode==='Brand'?brandRows():[...(LIB.commands||[])];
  if(mode==='Videos')a=a.filter(x=>x.category==='Video');
  else if(mode==='UGC')a=a.filter(x=>x.category==='UGC Video');
  else if(mode==='Camera')a=a.filter(x=>x.category==='Camera');
  else if(mode==='Creatives')a=a.filter(x=>!['Video','UGC Video','Camera','Brand'].includes(x.category));
  if(category!=='All'&&mode!=='Brand')a=a.filter(x=>x.category===category);
  if(query)a=a.filter(x=>[x.cmd,x.label,x.desc,...(x.tags||[])].join(' ').toLowerCase().includes(query));
  a=a.slice(0,30);items=a;selected=Math.min(selected,Math.max(0,a.length-1));
  const l=menu.querySelector('.list');l.innerHTML='';
  a.forEach((x,i)=>{
    const row=document.createElement('div');row.className='i'+(i===selected?' a':'');
    row.innerHTML='<div class="cmd"></div><div><span class="lab"></span><span class="chip"></span><div class="d"></div></div>';
    row.querySelector('.cmd').textContent=x.cmd.startsWith('@brand:')?'SELECT':x.cmd==='@clear'?'AUTO':x.cmd;
    row.querySelector('.lab').textContent=x.label;row.querySelector('.chip').textContent=x.category;row.querySelector('.d').textContent=x.desc||'';
    row.onmousedown=e=>{e.preventDefault();choose(x)};l.appendChild(row);
  });
  updateHeader();menu.classList.add('show');pos();
}
function clearSlash(){if(!editor)return;setTxt(editor,txt(editor).replace(/(?:^|\n)\/[a-zA-Z0-9_-]*$/,''))}
function choose(x){
  if(x.cmd==='@clear'){ss(K.manual,'');detectProjectBrand();clearSlash();menu.classList.remove('show');return}
  if(x.cmd.startsWith('@brand:')){ss(K.manual,x.cmd.slice(7));detectProjectBrand();clearSlash();menu.classList.remove('show');return}
  const t=txt(editor),p=promptFor(x),n=t.replace(/(?:^|\n)\/[a-zA-Z0-9_-]*$/,m=>(m.startsWith('\n')?'\n':'')+p);
  setTxt(editor,n);menu.classList.remove('show');
}
function slash(t){const m=String(t).match(/(?:^|\n)\/([\w-]*)$/);return m?m[1]:null}

document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'||e.shiftKey||!isEd(e.target))return;
  const ed=getEd(e.target),raw=txt(ed),m=raw.match(/(?:^|\n)\/setbrand\s+(.+)$/i);if(!m)return;
  const found=findBrandExact(m[1]);e.preventDefault();e.stopPropagation();
  if(found){ss(K.manual,found);setTxt(ed,raw.replace(/(?:^|\n)\/setbrand\s+(.+)$/i,''));detectProjectBrand();if(menu)menu.classList.remove('show')}
  else{editor=ed;mode='Brand';render('',true)}
},true);

document.addEventListener('input',e=>{
  if(!isEd(e.target))return;editor=getEd(e.target);const q=slash(txt(editor));
  if(q===null){if(menu)menu.classList.remove('show');return}
  sync();detectProjectBrand();
  const z=q.toLowerCase();
  if(z==='setbrand'||z.startsWith('brand'))mode='Brand';
  else if(z.startsWith('ugc'))mode='UGC';
  else if(['camera','transition','slowmotion'].some(k=>k.startsWith(z)||z.startsWith(k)))mode='Camera';
  else if(z.includes('video')||['seedance','kling','runway','unboxing','testimonial','broll','productreveal'].some(k=>k.startsWith(z)||z.startsWith(k)))mode='Videos';
  else if(!z)mode='Creatives';
  category='All';render(mode==='Brand'?'':q,false);
},true);

document.addEventListener('keydown',e=>{
  if(!menu?.classList.contains('show')||!isEd(e.target))return;
  if(e.key==='ArrowDown'){e.preventDefault();selected=(selected+1)%Math.max(1,items.length);render(query,false)}
  else if(e.key==='ArrowUp'){e.preventDefault();selected=(selected-1+Math.max(1,items.length))%Math.max(1,items.length);render(query,false)}
  else if(e.key==='Enter'&&!e.shiftKey&&items.length){e.preventDefault();e.stopPropagation();choose(items[selected])}
  else if(e.key==='Escape'){e.preventDefault();menu.classList.remove('show')}
},true);

addEventListener('resize',pos);addEventListener('scroll',pos,true);
addEventListener('focus',()=>{sync(true);detectProjectBrand()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);detectProjectBrand()}});
addEventListener('popstate',()=>{sync(true);scheduleDetect()});
['pushState','replaceState'].forEach(k=>{const orig=history[k];history[k]=function(...args){const out=orig.apply(this,args);setTimeout(()=>{sync(true);scheduleDetect()},50);return out}});
new MutationObserver(scheduleDetect).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','data-state','data-active','href']});

sync(true).then(()=>{detectProjectBrand();syncLoop()});
})();