// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      6.3.0
// @description  Universal Master Bar + right-docked Creative Studio + project awareness + LinkedIn auto-carousel.
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
const V='6.3.0',BASE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const URL={c:BASE+'commands.json',r:BASE+'runtime.json',b:BASE+'brands.json'};
const K={c:'csm630.c',r:'csm630.r',b:'csm630.b',m:'csm630.manual',f:'csm630.family'};
const J=(k,f)=>{try{let v=GM_getValue(k,'');return v?JSON.parse(v):f}catch{return f}},JS=(k,v)=>{try{GM_setValue(k,JSON.stringify(v))}catch{}},S=k=>{try{return String(GM_getValue(k,'')||'')}catch{return''}},SS=(k,v)=>{try{GM_setValue(k,String(v||''))}catch{}};
const FB=[
 {category:'Core',cmd:'/creative',label:'Fresh Creative',desc:'Finished social creative'},
 {category:'Core',cmd:'/trend',label:'Trend-Led',desc:'Current high-end direction'},
 {category:'Core',cmd:'/redesign',label:'Redesign',desc:'Complete visual redesign'},
 {category:'Product',cmd:'/productad',label:'Product Ad',desc:'Designed product advertisement'},
 {category:'Product',cmd:'/cgi',label:'CGI Creative',desc:'CGI + graphic design post'},
 {category:'Campaign',cmd:'/launch',label:'Launch',desc:'Launch campaign'},
 {category:'Campaign',cmd:'/offer',label:'Offer / Sale',desc:'Promotional offer creative'},
 {category:'Social',cmd:'/social',label:'Social Post',desc:'Standalone social post'},
 {category:'Social',cmd:'/story',label:'Story',desc:'Vertical social story'},
 {category:'Social',cmd:'/carousel',label:'Carousel',desc:'Separate social carousel slides'},
 {category:'Social',cmd:'/linkedin-carousel',label:'LinkedIn Profile Carousel',desc:'Analyze LinkedIn URL and create a complete carousel'},
 {category:'Info',cmd:'/infographic',label:'Infographic',desc:'Visual information design'},
 {category:'Print',cmd:'/poster',label:'Poster',desc:'Campaign poster'},
 {category:'Brand',cmd:'/brandstyle',label:'Brand Style',desc:'Extend the current brand system'},
 {category:'Video',cmd:'/video',label:'Video Concept',desc:'Complete AI video concept'},
 {category:'UGC Video',cmd:'/ugcvideo',label:'UGC Video',desc:'Natural creator UGC'},
 {category:'Camera',cmd:'/camera',label:'Camera Motion',desc:'Cinematic camera moves'}
];
const FBR={syncSeconds:30,baseRules:'Create a finished social-media creative, not just a product photo. Preserve exact product and brand identity. Default 2 separate creatives per product. If the user asks for N images/posts/slides, output exactly N separate standalone image files/generations. Never combine them into a collage, grid, contact sheet, preview sheet, storyboard board, split-screen or multi-panel image unless explicitly requested.',families:['typography-led poster','editorial social poster','kinetic diagonal layout','CGI + graphic campaign','ingredient/flavour world','technical performance poster','playful branded poster','minimal premium poster']};
let C=J(K.c,FB),R={...FBR,...J(K.r,{})},B=J(K.b,{brands:{}}).brands||{},auto='',project='',status='Cached',syncing=false,lastSync=0,host,sh,menu,badge,ed,items=[],sel=0,mode='Creatives',cat='All',query='';
const req=url=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:url+'?t='+Date.now(),timeout:10000,onload:r=>{try{if(r.status<200||r.status>=300)throw 0;ok(JSON.parse(r.responseText))}catch(e){no(e)}},onerror:no,ontimeout:no}));
const norm=s=>String(s||'').toLowerCase().replace(/[_\-–—|/]+/g,' ').replace(/[^\p{L}\p{N}. ]/gu,' ').replace(/\s+/g,' ').trim();
function merge(x){let m=new Map();[...FB,...(Array.isArray(x?.commands)?x.commands:[])].forEach(i=>i?.cmd&&m.set(i.cmd,{...(m.get(i.cmd)||{}),...i}));return[...m.values()]}
function brandMatch(t){let q=norm(t),h=[];Object.entries(B).forEach(([n,p])=>{let a=[n,...(p.aliases||[])].map(norm);if(a.some(x=>q===x||q.startsWith(x+' ')||q.endsWith(' '+x)||q.includes(' '+x+' ')))h.push(n)});h=[...new Set(h)];return h.length===1?h[0]:''}
function key(){let p=decodeURIComponent(location.pathname);return(p.match(/\/g\/(g-p-[^/]+)/i)||p.match(/\/projects?\/([^/]+)/i)||[])[1]||''}
function vis(e){if(!e)return'';try{let r=e.getBoundingClientRect();if(!r.width||!r.height)return''}catch{}return String(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim()}
function detect(){let k=key(),c=[];if(k)document.querySelectorAll('a[href]').forEach(a=>{if(!(a.getAttribute('href')||'').includes(k))return;[a.getAttribute('aria-label'),a.getAttribute('title'),vis(a)].filter(Boolean).forEach(x=>c.push(x));let p=a.closest('[aria-current="page"],[data-state="active"],[data-active="true"],li'),t=vis(p);if(t)c.unshift(t)});['[aria-current="page"][data-testid*="project" i]','[data-testid*="project" i][data-state="active"]','header [aria-label*="project" i]'].forEach(s=>document.querySelectorAll(s).forEach(e=>{let t=vis(e);if(t)c.push(t)}));auto='';project='';for(let t of c){let b=brandMatch(t);if(b){auto=b;project=t;break}}if(!project&&c.length)project=c[0];status=auto?'Brand → '+auto:project?'Project → '+project:status;ui()}
async function sync(force=false){if(syncing)return;if(!force&&Date.now()-lastSync<10000){detect();return}syncing=true;status='Syncing…';ui();try{let[c,r,b]=await Promise.all([req(URL.c),req(URL.r),req(URL.b)]);C=merge(c);R={...FBR,...r};B=b?.brands||{};JS(K.c,C);JS(K.r,R);JS(K.b,{brands:B});lastSync=Date.now();status='Live';detect();if(menu?.classList.contains('show'))render(query,false)}catch{status='Offline';ui()}finally{syncing=false}}
const manual=()=>S(K.m),active=()=>auto||manual();
function family(){let a=R.families?.length?R.families:FBR.families,r=J(K.f,[]),p=a.map((_,i)=>i).filter(i=>!r.includes(i));if(!p.length)p=a.map((_,i)=>i);let i=p[Math.floor(Math.random()*p.length)];JS(K.f,[i,...r.filter(x=>x!==i)].slice(0,5));return a[i]}
function context(){detect();let a=active(),p=B[a];if(a&&p)return `${auto?'AUTO-DETECTED PROJECT':'MANUAL BRAND'}: ${a}. CATEGORY: ${p.type||''}. TONE: ${(p.tone||[]).join(', ')}. STYLE: ${(p.style||[]).join(', ')}. PREFERRED: ${(p.preferred||[]).join(', ')}. AVOID: ${(p.avoid||[]).join(', ')}.`;if(project)return `CURRENT CHATGPT PROJECT: ${project}. Infer its brand/category from project context and uploaded references; do not borrow another brand's styling.`;return'Infer the brand/category from the current brief and uploaded references.'}
function liPrompt(url=''){return `${url?`LINKEDIN URL: ${url}. `:'Use the LinkedIn URL already included in my message. '}Research the public LinkedIn profile/company and reliable public web sources. Create a polished 7–9 slide LinkedIn carousel using only verified information. Each slide must be a SEPARATE 1080×1350 4:5 image. NEVER make a collage, grid, contact sheet, preview sheet, storyboard, 3x3 overview, split-screen or multi-panel image. ONE output = ONE slide. Build a strong profile-specific hook, logical story, concise copy, cohesive premium LinkedIn editorial design, strong typography hierarchy, deliberate grid, clean spacing and subject-relevant styling. Generate Slide 1 separately, then Slide 2 separately, and continue until all slides are delivered. Do not stop at only a plan if image generation is available.`}
function prompt(x){if(x.cmd==='/linkedin-carousel')return liPrompt();let c=context(),base=R.baseRules||FBR.baseRules;if(['Video','UGC Video','Camera'].includes(x.category))return `${c} ${x.prompt||x.desc||x.label}. Build a production-ready vertical AI video prompt with stable identity, realistic motion and coherent flow.`;let i=x.cmd==='/cgi'?'Create a high-end CGI social ad but finish it as a true graphic-designed post, not a standalone CGI image.':x.cmd==='/redesign'?'Completely redesign the uploaded creative into an agency-level social post.':x.cmd==='/trend'?'Create a current trend-led agency-level social creative.':'Create a finished agency-level social creative, NOT just a beautiful product photograph.';return `${c} ${i} Art direction: ${family()}. ${base}`}
const CSS=`:host{all:initial}*{box-sizing:border-box}
.m{
  --line:#ffffff12;--muted:#8f8f9b;--accent:#a78bfa;
  position:fixed;z-index:2147483647;display:none;flex-direction:column;
  right:16px;top:66px;bottom:74px;width:min(790px,calc(100vw - 300px));min-width:640px;
  max-width:calc(100vw - 24px);overflow:hidden;border:1px solid #ffffff20;border-radius:22px;
  background:
    radial-gradient(700px 260px at 82% -8%,#7666ff22,transparent 55%),
    radial-gradient(520px 220px at -10% 20%,#1e8fff12,transparent 50%),
    linear-gradient(180deg,#18181dfb,#101014fb);
  color:#f7f7fa;box-shadow:0 34px 105px #000b,0 0 0 1px #ffffff04 inset;
  backdrop-filter:blur(22px) saturate(120%);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
.m.show{display:flex;animation:csmOpen .16s cubic-bezier(.2,.8,.2,1)}
@keyframes csmOpen{from{opacity:.45;transform:translateX(12px) scale(.995)}to{opacity:1;transform:none}}
.h{
  flex:0 0 auto;display:flex;justify-content:space-between;gap:14px;align-items:flex-start;
  padding:14px 16px 12px;border-bottom:1px solid var(--line);background:#18181cee;
}
.head{display:flex;gap:10px;min-width:0}.mark{flex:0 0 auto;width:34px;height:34px;border-radius:11px;
  display:grid;place-items:center;background:linear-gradient(145deg,#9c82ff,#628cff);
  color:white;font-weight:850;font-size:11px;letter-spacing:.3px;box-shadow:0 8px 24px #7564ff33}
.t{font-size:15px;font-weight:790;letter-spacing:-.2px}.s{font-size:10px;color:#ffffff70;margin-top:3px}
.br{display:inline-flex;margin-top:6px;max-width:560px;padding:4px 7px;border-radius:8px;background:#a78bfa11;color:#ddd3ff;font-size:10.5px;font-weight:720;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{font-size:9.5px;color:#bdbdc7;background:#ffffff0c;border:1px solid #ffffff0e;padding:5px 8px;border-radius:999px;white-space:nowrap}
.modes{flex:0 0 auto;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;padding:8px 10px;border-bottom:1px solid var(--line)}
.btn,.chip,.sync,.ubtn{border:0;cursor:pointer;color:#b9b9c2;background:#ffffff08;transition:.13s ease}
.btn{border:1px solid #ffffff08;border-radius:10px;padding:8px 5px;font-size:10.5px;font-weight:680}
.btn:hover{background:#ffffff12;color:#fff}.btn.a{background:#a78bfa24;border-color:#a78bfa30;color:#f5f1ff}
.universal{
  flex:0 0 auto;padding:8px 10px 9px;border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,#131317f4,#111115f4);
}
.utitle{display:flex;align-items:center;justify-content:space-between;margin:0 2px 7px;font-size:9px;text-transform:uppercase;letter-spacing:.85px;color:#6f6f79}
.ugrid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:5px}
.ubtn{min-width:0;border:1px solid #ffffff0d;border-radius:9px;padding:7px 5px;background:linear-gradient(180deg,#ffffff0a,#ffffff05);font-size:9.7px;font-weight:680;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ubtn:hover{background:#ffffff14;color:#fff;transform:translateY(-1px)}
.ubtn.linked{color:#afd8ff;background:#0a66c21f;border-color:#2084de38}
.ubtn.info{color:#bfeccf;background:#4bbf7f13;border-color:#4bbf7f24}
.ubtn.video{color:#ffd4ba;background:#d66d3512;border-color:#d66d3524}
.body{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:182px minmax(0,1fr);overflow:hidden;background:#0f0f13a8}
.cats{min-height:0;display:flex;flex-direction:column;gap:4px;overflow-y:auto;padding:9px;border-right:1px solid var(--line);background:#ffffff025;scrollbar-width:thin;scrollbar-color:#ffffff1c transparent}
.chip{flex:0 0 auto;width:100%;border:1px solid transparent;border-radius:9px;padding:8px 9px;font-size:10.5px;text-align:left}
.chip:hover{background:#ffffff0c;color:#fff}.chip.a{background:linear-gradient(90deg,#a78bfa20,#a78bfa08);border-color:#a78bfa1b;color:#f2ecff;font-weight:700}
.list{min-height:0;overflow-y:auto;padding:9px;scrollbar-width:thin;scrollbar-color:#ffffff1c transparent}
.cats::-webkit-scrollbar,.list::-webkit-scrollbar{width:7px}.cats::-webkit-scrollbar-thumb,.list::-webkit-scrollbar-thumb{background:#ffffff1b;border-radius:99px}
.row{display:grid;grid-template-columns:150px minmax(0,1fr) 16px;gap:10px;align-items:center;padding:10px 11px;margin-bottom:3px;border:1px solid transparent;border-radius:11px;cursor:pointer}
.row:hover,.row.a{background:linear-gradient(90deg,#ffffff0d,#ffffff06);border-color:#ffffff0c}
.cmd{width:max-content;max-width:145px;padding:4px 7px;border-radius:7px;background:#a78bfa0e;border:1px solid #a78bfa16;font:750 10.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:#bba9ff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lab{font-size:12.4px;font-weight:710}.d{font-size:10.7px;color:#8d8d98;margin-top:3px;line-height:1.28}.arr{color:#595964;font-size:15px}.row:hover .arr{color:#b09cff}
.f{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-top:1px solid var(--line);font-size:9.5px;color:#74747e;background:#17171bf7}
.sync{border:1px solid #a78bfa20;border-radius:8px;padding:6px 10px;background:#a78bfa17;color:#d9ceff;font-weight:680}.sync:hover{background:#a78bfa27;color:#fff}
.badge{position:fixed;right:18px;bottom:92px;z-index:2147483647;display:flex;gap:7px;align-items:center;max-width:350px;padding:8px 11px;border:1px solid #ffffff1b;border-radius:999px;background:#17171bea;color:#fff;box-shadow:0 10px 30px #0008;font:700 10.5px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.m.show+.badge{display:none}
.dot{width:7px;height:7px;border-radius:50%;background:#4bd58b}.badge.none .dot{background:#f2b84b}.src{font-size:8.5px;color:#7f7f89}
@media(max-width:1100px){.ugrid{grid-template-columns:repeat(4,1fr)}}
@media(max-width:980px){.m{right:12px;top:62px;bottom:76px;width:calc(100vw - 24px);min-width:0}.body{grid-template-columns:154px 1fr}.row{grid-template-columns:128px 1fr 16px}}
@media(max-width:700px){.m{right:8px;top:56px;bottom:72px;width:calc(100vw - 16px);border-radius:17px}.modes{grid-template-columns:repeat(3,1fr)}.ugrid{grid-template-columns:repeat(3,1fr)}.body{grid-template-columns:124px 1fr}.row{grid-template-columns:1fr 16px}.row>div:nth-child(2){grid-column:1}.arr{grid-column:2;grid-row:1/3}.br{max-width:68vw}.badge{right:10px;bottom:82px;max-width:240px}}`;
function make(){if(menu)return;host=document.createElement('div');document.documentElement.appendChild(host);sh=host.attachShadow({mode:'open'});let st=document.createElement('style');st.textContent=CSS;sh.appendChild(st);menu=document.createElement('div');menu.className='m';menu.innerHTML=`<div class="h"><div class="head"><div class="mark">CS</div><div><div class="t">Creative Studio</div><div class="s">Universal creative workspace</div><div class="br"></div></div></div><div class="st">Ready</div></div><div class="modes"></div><div class="universal"><div class="utitle"><span>Universal Master Bar</span><span>Best entry points</span></div><div class="ugrid"></div></div><div class="body"><div class="cats"></div><div class="list"></div></div><div class="f"><span>Creative Studio • v${V}</span><button class="sync">Sync now</button></div>`;sh.appendChild(menu);badge=document.createElement('div');badge.className='badge none';badge.innerHTML='<span class="dot"></span><span class="bt">! Project/Brand not detected</span><span class="src">AUTO</span>';badge.onclick=()=>{mode='Brand';cat='All';query='';ed=ed||document.querySelector('textarea')||document.querySelector('[contenteditable="true"]');render('',true)};sh.appendChild(badge);menu.querySelector('.sync').onclick=()=>sync(true);ui()}
function ui(){if(!menu)return;let main=auto?`✓ Brand: ${auto}`:project?`✓ Project: ${project}`:manual()?`✓ Brand: ${manual()}`:'! Project/Brand not detected',src=auto?'AUTO PROJECT':project?'AUTO PROJECT':manual()?'MANUAL':'AUTO';menu.querySelector('.br').textContent=`${main} • ${src}`;menu.querySelector('.st').textContent=status;badge.classList.toggle('none',!(auto||project||manual()));badge.querySelector('.bt').textContent=main;badge.querySelector('.src').textContent=src}
function rows(){if(mode==='Brand')return[{category:'Brand',cmd:'@auto',label:'Auto Project',desc:auto||project||'Not detected'},...Object.keys(B).sort().map(x=>({category:'Brand',cmd:'@brand:'+x,label:x,desc:B[x].type||'Brand'}))];let a=[...C];if(mode==='Videos')a=a.filter(x=>x.category==='Video');else if(mode==='UGC')a=a.filter(x=>x.category==='UGC Video');else if(mode==='Camera')a=a.filter(x=>x.category==='Camera');else if(mode==='Creatives')a=a.filter(x=>!['Video','UGC Video','Camera','Brand'].includes(x.category));if(cat!=='All')a=a.filter(x=>x.category===cat);if(query)a=a.filter(x=>[x.cmd,x.label,x.desc].join(' ').toLowerCase().includes(query.toLowerCase()));return a}
function universal(){let e=menu.querySelector('.ugrid');e.innerHTML='';[
 ['/creative','✦ Creative',''],
 ['/redesign','↻ Redesign',''],
 ['/productad','◆ Product',''],
 ['/cgi','◈ CGI',''],
 ['/launch','🚀 Launch',''],
 ['/offer','% Offer',''],
 ['/social','◎ Social',''],
 ['/story','▯ Story',''],
 ['/carousel','▦ Carousel',''],
 ['/linkedin-carousel','in LinkedIn','linked'],
 ['/infographic','i Infographic','info'],
 ['/poster','▤ Poster',''],
 ['/brandstyle','◇ Brand',''],
 ['/video','▶ Video','video'],
 ['/ugcvideo','◉ UGC','video'],
 ['/camera','⌖ Camera','video']
].forEach(([cmd,l,cls])=>{let x=C.find(i=>i.cmd===cmd)||FB.find(i=>i.cmd===cmd);if(!x)return;let b=document.createElement('button');b.className='ubtn '+cls;b.textContent=l;b.title=x.label+' — '+(x.desc||'');b.onclick=()=>choose(x);e.appendChild(b)})}
function render(q='',doSync=true){make();if(doSync)sync();detect();query=q;let m=menu.querySelector('.modes');m.innerHTML='';['Creatives','Videos','UGC','Camera','Brand','All'].forEach(z=>{let b=document.createElement('button');b.className='btn'+(mode===z?' a':'');b.textContent=z;b.onclick=()=>{mode=z;cat='All';render('',true)};m.appendChild(b)});universal();let cs=mode==='Videos'?['Video']:mode==='UGC'?['UGC Video']:mode==='Camera'?['Camera']:mode==='Brand'?['Brand']:[...new Set(C.map(x=>x.category).filter(z=>mode!=='Creatives'||!['Video','UGC Video','Camera','Brand'].includes(z)))],order=['Core','Social','Product','Campaign','Style','Environment','Info','Print','Utility','Brand','Video','UGC Video','Camera'];cs.sort((a,b)=>(order.indexOf(a)<0?99:order.indexOf(a))-(order.indexOf(b)<0?99:order.indexOf(b)));let ce=menu.querySelector('.cats');ce.innerHTML='';['All',...cs].forEach(z=>{let b=document.createElement('button');b.className='chip'+(cat===z?' a':'');b.textContent=z;b.onclick=()=>{cat=z;render(query,false)};ce.appendChild(b)});items=rows().slice(0,40);sel=Math.min(sel,Math.max(0,items.length-1));let le=menu.querySelector('.list');le.innerHTML='';items.forEach((x,i)=>{let r=document.createElement('div');r.className='row'+(sel===i?' a':'');r.innerHTML='<div class="cmd"></div><div><div class="lab"></div><div class="d"></div></div><div class="arr">›</div>';r.querySelector('.cmd').textContent=x.cmd.startsWith('@brand:')?'SELECT':x.cmd==='@auto'?'AUTO':x.cmd;r.querySelector('.lab').textContent=x.label;r.querySelector('.d').textContent=x.desc||'';r.onclick=()=>choose(x);le.appendChild(r)});ui();menu.classList.add('show')}
const isEd=e=>!!e&&(e.tagName==='TEXTAREA'||e.isContentEditable||e.closest?.('[contenteditable="true"]')),getEd=e=>e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]')),text=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function setText(e,t){if(!e)return;if(e.tagName==='TEXTAREA'){let s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();return}e.focus();let se=getSelection(),r=document.createRange();r.selectNodeContents(e);se.removeAllRanges();se.addRange(r);let ok=false;try{ok=document.execCommand('insertText',false,t)}catch{}if(!ok){e.textContent=t;e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}))}}
function choose(x){if(x.cmd==='@auto'){SS(K.m,'');detect();if(ed)setText(ed,text(ed).replace(/(?:^|\n)\/[\w-]*$/,''));menu.classList.remove('show');return}if(x.cmd.startsWith('@brand:')){SS(K.m,x.cmd.slice(7));detect();if(ed)setText(ed,text(ed).replace(/(?:^|\n)\/[\w-]*$/,''));menu.classList.remove('show');return}let t=text(ed);setText(ed,t.replace(/(?:^|\n)\/[\w-]*$/,m=>(m.startsWith('\n')?'\n':'')+prompt(x)));menu.classList.remove('show')}
function slash(t){let m=String(t).match(/(?:^|\n)\/([\w-]*)$/);return m?m[1]:null}
function liURL(raw){let s=String(raw||'').trim();if(!/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[^\s?#]+\/?(?:\?[^\s]*)?$/i.test(s))return'';return /^https?:\/\//i.test(s)?s:'https://'+s}
function send(){let b=document.querySelector('button[data-testid="send-button"],button[aria-label*="Send message" i],button[aria-label^="Send" i]');if(b&&!b.disabled)b.click()}
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey||!isEd(e.target)||menu?.classList.contains('show'))return;let t=getEd(e.target),u=liURL(text(t));if(!u)return;e.preventDefault();e.stopImmediatePropagation();ed=t;setText(t,liPrompt(u));status='LinkedIn → Carousel';ui();setTimeout(send,150)},true);
document.addEventListener('input',e=>{if(!isEd(e.target))return;ed=getEd(e.target);let z=slash(text(ed));if(z===null){menu?.classList.remove('show');return}sync();detect();let s=z.toLowerCase();if(!s)mode='Creatives';else if(s.startsWith('brand'))mode='Brand';else if(s.startsWith('ugc'))mode='UGC';else if(s.includes('video')||['seedance','kling','runway'].some(k=>k.startsWith(s)))mode='Videos';else if(['camera','transition','slowmotion'].some(k=>k.startsWith(s)||s.startsWith(k)))mode='Camera';else mode='All';cat='All';render(mode==='Brand'?'':z,false)},true);
document.addEventListener('keydown',e=>{if(!menu?.classList.contains('show')||!isEd(e.target))return;if(e.key==='ArrowDown'){e.preventDefault();sel=(sel+1)%Math.max(1,items.length);render(query,false)}else if(e.key==='ArrowUp'){e.preventDefault();sel=(sel-1+Math.max(1,items.length))%Math.max(1,items.length);render(query,false)}else if(e.key==='Enter'&&!e.shiftKey&&items.length){e.preventDefault();e.stopPropagation();choose(items[sel])}else if(e.key==='Escape')menu.classList.remove('show')},true);
addEventListener('focus',()=>{sync(true);detect()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);detect()}});new MutationObserver(()=>detect()).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','data-state','data-active','href']});make();sync(true);setInterval(()=>sync(true),30000);
})();