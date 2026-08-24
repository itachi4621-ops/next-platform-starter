// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      6.2.0
// @description  Premium Creative Studio UI + project-aware brand context + LinkedIn auto-carousel.
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
const V='6.2.0',BASE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const U={c:BASE+'commands.json',r:BASE+'runtime.json',b:BASE+'brands.json'};
const K={c:'csm620.c',r:'csm620.r',b:'csm620.b',m:'csm620.manual',f:'csm620.family'};
const gj=(k,f)=>{try{let v=GM_getValue(k,'');return v?JSON.parse(v):f}catch{return f}},sj=(k,v)=>{try{GM_setValue(k,JSON.stringify(v))}catch{}},gs=k=>{try{return String(GM_getValue(k,'')||'')}catch{return''}},ss=(k,v)=>{try{GM_setValue(k,String(v||''))}catch{}};
const FB=[
 {category:'Core',cmd:'/creative',label:'Fresh Creative',desc:'Finished social creative'},
 {category:'Core',cmd:'/trend',label:'Trend-Led',desc:'Current high-end direction'},
 {category:'Core',cmd:'/redesign',label:'Redesign',desc:'Complete visual redesign'},
 {category:'Product',cmd:'/productad',label:'Product Ad',desc:'Designed product advertisement'},
 {category:'Product',cmd:'/cgi',label:'CGI Creative',desc:'CGI + graphic design post'},
 {category:'Social',cmd:'/carousel',label:'Carousel',desc:'Separate social carousel slides'},
 {category:'Social',cmd:'/linkedin-carousel',label:'LinkedIn Profile Carousel',desc:'Analyze LinkedIn URL and create a complete carousel'},
 {category:'Info',cmd:'/infographic',label:'Infographic',desc:'Clear information-led visual design'},
 {category:'Video',cmd:'/video',label:'Video Concept',desc:'Complete AI video concept'},
 {category:'UGC Video',cmd:'/ugcvideo',label:'UGC Video',desc:'Natural creator UGC'},
 {category:'Camera',cmd:'/camera',label:'Camera Motion',desc:'Cinematic camera moves'}
];
const FR={syncSeconds:30,baseRules:'Create a finished social-media creative, not just a product photo. Preserve exact product and brand identity. Default 2 separate creatives per product. If the user asks for N images/posts/slides, output exactly N separate standalone image files/generations. Never combine them into a collage, grid, contact sheet, preview sheet, storyboard, split-screen or multi-panel image unless explicitly requested.',families:['typography-led campaign poster','editorial social poster','kinetic diagonal layout','CGI + graphic campaign','ingredient/flavour world','technical performance poster','playful branded poster','minimal premium poster']};
let C=gj(K.c,FB),R={...FR,...gj(K.r,{})},B=gj(K.b,{brands:{}}).brands||{},auto='',project='',status='Cached',busy=false,last=0,host,root,menu,badge,ed,items=[],sel=0,mode='Creatives',cat='All',query='';
const req=url=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:url+'?t='+Date.now(),timeout:10000,onload:r=>{try{if(r.status<200||r.status>=300)throw 0;ok(JSON.parse(r.responseText))}catch(e){no(e)}},onerror:no,ontimeout:no}));
const norm=s=>String(s||'').toLowerCase().replace(/[_\-–—|/]+/g,' ').replace(/[^\p{L}\p{N}. ]/gu,' ').replace(/\s+/g,' ').trim();
function merge(x){let m=new Map();[...FB,...(Array.isArray(x?.commands)?x.commands:[])].forEach(i=>i?.cmd&&m.set(i.cmd,{...(m.get(i.cmd)||{}),...i}));return[...m.values()]}
function bmatch(t){let q=norm(t),h=[];Object.entries(B).forEach(([n,p])=>{let a=[n,...(p.aliases||[])].map(norm);if(a.some(x=>q===x||q.startsWith(x+' ')||q.endsWith(' '+x)||q.includes(' '+x+' ')))h.push(n)});h=[...new Set(h)];return h.length===1?h[0]:''}
function pkey(){let p=decodeURIComponent(location.pathname);return(p.match(/\/g\/(g-p-[^/]+)/i)||p.match(/\/projects?\/([^/]+)/i)||[])[1]||''}
function visible(e){if(!e)return'';try{let r=e.getBoundingClientRect();if(!r.width||!r.height)return''}catch{}return String(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim()}
function detect(){
 let k=pkey(),a=[];
 if(k)document.querySelectorAll('a[href]').forEach(x=>{if(!(x.getAttribute('href')||'').includes(k))return;[x.getAttribute('aria-label'),x.getAttribute('title'),visible(x)].filter(Boolean).forEach(t=>a.push(t));let p=x.closest('[aria-current="page"],[data-state="active"],[data-active="true"],li'),t=visible(p);if(t)a.unshift(t)});
 ['[aria-current="page"][data-testid*="project" i]','[data-testid*="project" i][data-state="active"]','header [aria-label*="project" i]'].forEach(s=>document.querySelectorAll(s).forEach(e=>{let t=visible(e);if(t)a.push(t)}));
 auto='';project='';
 for(let t of a){let b=bmatch(t);if(b){auto=b;project=t;break}}
 if(!project&&a.length)project=a[0];
 if(auto)status='Brand → '+auto;else if(project)status='Project → '+project;
 ui();
}
async function sync(force=false){
 if(busy)return;if(!force&&Date.now()-last<10000){detect();return}
 busy=true;status='Syncing…';ui();
 try{let[c,r,b]=await Promise.all([req(U.c),req(U.r),req(U.b)]);C=merge(c);R={...FR,...r};B=b?.brands||{};sj(K.c,C);sj(K.r,R);sj(K.b,{brands:B});last=Date.now();status='Live';detect();if(menu?.classList.contains('show'))render(query,false)}
 catch{status='Offline';ui()}finally{busy=false}
}
const manual=()=>gs(K.m),active=()=>auto||manual();
function family(){let a=R.families?.length?R.families:FR.families,r=gj(K.f,[]),p=a.map((_,i)=>i).filter(i=>!r.includes(i));if(!p.length)p=a.map((_,i)=>i);let i=p[Math.floor(Math.random()*p.length)];sj(K.f,[i,...r.filter(x=>x!==i)].slice(0,5));return a[i]}
function ctx(){detect();let a=active(),p=B[a];if(a&&p)return `${auto?'AUTO-DETECTED PROJECT':'MANUAL BRAND'}: ${a}. CATEGORY: ${p.type||''}. TONE: ${(p.tone||[]).join(', ')}. STYLE: ${(p.style||[]).join(', ')}. PREFERRED: ${(p.preferred||[]).join(', ')}. AVOID: ${(p.avoid||[]).join(', ')}.`;if(project)return `CURRENT CHATGPT PROJECT: ${project}. Infer its brand/category from project context and uploaded references. Do not borrow another brand's styling.`;return'Infer brand/category from the current brief and uploaded references.'}
function liPrompt(url=''){return `${url?`LINKEDIN URL: ${url}. `:'Use the LinkedIn URL already included in my message. '}Research the public LinkedIn profile/company and reliable public sources. Create a polished 7–9 slide LinkedIn carousel using verified information only. Each slide must be a SEPARATE 1080×1350 4:5 image. NEVER make a collage, grid, contact sheet, preview sheet, storyboard, 3x3 overview, split-screen or multi-panel image. ONE output = ONE slide. Build a profile-specific hook, logical story, concise copy and cohesive premium LinkedIn editorial design. Generate Slide 1 separately, then Slide 2 separately, continuing until all slides are delivered. Do not stop at only a plan if image generation is available.`}
function prompt(x){
 if(x.cmd==='/linkedin-carousel')return liPrompt();
 let c=ctx(),base=R.baseRules||FR.baseRules;
 if(['Video','UGC Video','Camera'].includes(x.category))return `${c} ${x.prompt||x.desc||x.label}. Build a production-ready vertical AI video prompt with stable identity, realistic motion and coherent flow.`;
 let intent=x.cmd==='/cgi'?'Create a high-end CGI social ad but finish it as a true graphic-designed post, not a standalone CGI image.':x.cmd==='/redesign'?'Completely redesign the uploaded creative into an agency-level social post.':x.cmd==='/trend'?'Create a current trend-led agency-level social creative.':x.cmd==='/infographic'?'Create a professional information-led social infographic with strong hierarchy, icons/visual systems and no invented facts.':'Create a finished agency-level social creative, NOT just a beautiful product photograph.';
 return `${c} ${intent} Art direction: ${family()}. ${base}`;
}
const CSS=`:host{all:initial}*{box-sizing:border-box}
.m{position:fixed;z-index:2147483647;display:none;flex-direction:column;right:16px;top:68px;bottom:76px;width:min(760px,calc(100vw - 300px));min-width:620px;max-width:calc(100vw - 24px);overflow:hidden;border:1px solid #ffffff1d;border-radius:22px;background:radial-gradient(650px 240px at 82% -8%,#6e5df72b,transparent 55%),radial-gradient(500px 250px at -8% 20%,#278cff18,transparent 52%),linear-gradient(180deg,#19191efc,#111115fc);color:#f7f7fa;box-shadow:0 34px 100px #000b,0 0 0 1px #ffffff05 inset;backdrop-filter:blur(22px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.m.show{display:flex;animation:op .15s ease-out}@keyframes op{from{opacity:.4;transform:translateX(12px)}to{opacity:1;transform:none}}
.h{flex:0 0 auto;display:flex;justify-content:space-between;gap:12px;padding:14px 16px 12px;border-bottom:1px solid #ffffff12;background:#1a1a20ee}.head{display:flex;gap:10px;min-width:0}.logo{flex:0 0 auto;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(145deg,#9d83ff,#5e8cff);font-size:12px;font-weight:850;box-shadow:0 8px 24px #7766ff38}.title{font-size:15px;font-weight:790;letter-spacing:-.2px}.sub{font-size:10px;color:#ffffff70;margin-top:3px}.brand{display:inline-flex;margin-top:5px;max-width:550px;padding:4px 7px;border-radius:8px;background:#a78bfa12;color:#ded4ff;font-size:10.5px;font-weight:720;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.status{font-size:9.5px;color:#bdbdc6;background:#ffffff0d;border:1px solid #ffffff0f;padding:5px 8px;border-radius:99px;height:max-content}
.tabs{flex:0 0 auto;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:9px 10px 8px;border-bottom:1px solid #ffffff0d;background:#141418ee}.tab,.cat,.quick,.sync{border:0;cursor:pointer;transition:.13s ease}.tab{border:1px solid #ffffff09;border-radius:10px;padding:8px 5px;background:#ffffff08;color:#b7b7c0;font-size:10.5px;font-weight:680}.tab.on{color:#fff;background:linear-gradient(180deg,#a78bfa28,#7d6cf11a);border-color:#a78bfa38}.tab:hover{color:#fff;background:#ffffff12}
.quickbar{flex:0 0 auto;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:8px 10px;border-bottom:1px solid #ffffff0d}.quick{border:1px solid #ffffff0d;border-radius:11px;padding:8px 6px;background:linear-gradient(180deg,#ffffff0b,#ffffff06);color:#bfc0c9;font-size:10.3px;font-weight:680}.quick:hover{background:#ffffff13;color:#fff;transform:translateY(-1px)}.quick.li{color:#b7dcff;background:#0a66c21f;border-color:#2084de44}
.body{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:180px 1fr;overflow:hidden;background:#0f0f13b8}.cats{min-height:0;display:flex;flex-direction:column;gap:4px;overflow-y:auto;padding:9px;border-right:1px solid #ffffff0d}.cat{width:100%;display:flex;align-items:center;gap:8px;border:1px solid transparent;border-radius:10px;padding:8px 9px;background:transparent;color:#aaaab4;font-size:10.5px;text-align:left}.cat:hover{background:#ffffff0b;color:#eee}.cat.on{color:#f6f2ff;font-weight:720;background:linear-gradient(90deg,#a78bfa22,#a78bfa0b);border-color:#a78bfa20}.ico{width:18px;text-align:center;color:#83838d}
.list{min-height:0;overflow-y:auto;padding:9px}.row{display:grid;grid-template-columns:145px 1fr 18px;align-items:center;gap:10px;padding:10px 11px;margin-bottom:3px;border:1px solid transparent;border-radius:12px;cursor:pointer}.row:hover,.row.on{background:linear-gradient(90deg,#ffffff0e,#ffffff08);border-color:#ffffff0d}.cmd{display:inline-flex;width:max-content;max-width:140px;padding:4px 7px;border-radius:7px;background:#a78bfa0f;border:1px solid #a78bfa18;font:750 10.5px ui-monospace,Menlo,monospace;color:#bba9ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lab{font-size:12.5px;font-weight:710}.desc{font-size:10.7px;color:#8f8f99;margin-top:3px;line-height:1.25}.arr{color:#5f5f68;font-size:15px}.row:hover .arr{color:#a99aff;transform:translateX(2px)}
.foot{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-top:1px solid #ffffff0d;background:#17171bfa;color:#777782;font-size:9.5px}.sync{border:1px solid #a78bfa20;border-radius:8px;padding:6px 10px;background:#a78bfa18;color:#d8ccff;font-weight:680}.sync:hover{background:#a78bfa28;color:#fff}
.badge{position:fixed;right:18px;bottom:92px;z-index:2147483647;display:flex;gap:7px;align-items:center;max-width:350px;padding:8px 11px;border:1px solid #ffffff1c;border-radius:999px;background:#18181deF;color:#fff;box-shadow:0 10px 30px #0008;font:700 10.5px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.m.show+.badge{display:none}.dot{width:7px;height:7px;border-radius:50%;background:#4bd58b}.badge.none .dot{background:#f2b84b}.src{font-size:8.5px;color:#7f7f89}
@media(max-width:980px){.m{right:12px;top:62px;bottom:78px;width:calc(100vw - 24px);min-width:0}.body{grid-template-columns:155px 1fr}.row{grid-template-columns:125px 1fr 18px}}
@media(max-width:700px){.m{right:8px;top:56px;bottom:72px;width:calc(100vw - 16px);border-radius:17px}.tabs{grid-template-columns:repeat(3,1fr)}.quickbar{grid-template-columns:repeat(3,1fr)}.body{grid-template-columns:124px 1fr}.row{grid-template-columns:1fr 18px}.row .cmd,.row .copy{grid-column:1}.arr{grid-column:2;grid-row:1/3}.brand{max-width:70vw}}
`;
function make(){
 if(menu)return;
 host=document.createElement('div');document.documentElement.appendChild(host);root=host.attachShadow({mode:'open'});
 let st=document.createElement('style');st.textContent=CSS;root.appendChild(st);
 menu=document.createElement('div');menu.className='m';
 menu.innerHTML=`<div class="h"><div class="head"><div class="logo">CS</div><div><div class="title">Creative Studio</div><div class="sub">Project-aware command workspace</div><div class="brand"></div></div></div><div class="status">Ready</div></div><div class="tabs"></div><div class="quickbar"></div><div class="body"><div class="cats"></div><div class="list"></div></div><div class="foot"><span>Creative Studio • v${V}</span><button class="sync">Sync now</button></div>`;
 root.appendChild(menu);
 badge=document.createElement('div');badge.className='badge none';badge.innerHTML='<span class="dot"></span><span class="bt">! Project/Brand not detected</span><span class="src">AUTO</span>';badge.onclick=()=>{mode='Brand';cat='All';query='';ed=ed||document.querySelector('textarea')||document.querySelector('[contenteditable="true"]');render('',true)};root.appendChild(badge);
 menu.querySelector('.sync').onclick=()=>sync(true);ui();
}
function ui(){if(!menu)return;let main=auto?`✓ Brand: ${auto}`:project?`✓ Project: ${project}`:manual()?`✓ Brand: ${manual()}`:'! Project/Brand not detected',src=auto?'AUTO PROJECT':project?'AUTO PROJECT':manual()?'MANUAL':'AUTO';menu.querySelector('.brand').textContent=`${main} • ${src}`;menu.querySelector('.status').textContent=status;badge.classList.toggle('none',!(auto||project||manual()));badge.querySelector('.bt').textContent=main;badge.querySelector('.src').textContent=src}
function rows(){if(mode==='Brand')return[{category:'Brand',cmd:'@auto',label:'Auto Project',desc:auto||project||'Not detected'},...Object.keys(B).sort().map(x=>({category:'Brand',cmd:'@brand:'+x,label:x,desc:B[x].type||'Brand'}))];let a=[...C];if(mode==='Videos')a=a.filter(x=>x.category==='Video');else if(mode==='UGC')a=a.filter(x=>x.category==='UGC Video');else if(mode==='Camera')a=a.filter(x=>x.category==='Camera');else if(mode==='Creatives')a=a.filter(x=>!['Video','UGC Video','Camera','Brand'].includes(x.category));if(cat!=='All')a=a.filter(x=>x.category===cat);if(query)a=a.filter(x=>[x.cmd,x.label,x.desc].join(' ').toLowerCase().includes(query.toLowerCase()));return a}
function quick(){
 let e=menu.querySelector('.quickbar');e.innerHTML='';
 [['/creative','✦ Creative'],['/infographic','i Infographic'],['/carousel','▦ Carousel'],['/linkedin-carousel','in LinkedIn'],['/cgi','◈ CGI'],['/video','▶ Video']].forEach(([cmd,l])=>{let x=C.find(i=>i.cmd===cmd)||FB.find(i=>i.cmd===cmd);if(!x)return;let b=document.createElement('button');b.className='quick'+(cmd==='/linkedin-carousel'?' li':'');b.textContent=l;b.onclick=()=>choose(x);e.appendChild(b)});
}
function render(q='',doSync=true){
 make();if(doSync)sync();detect();query=q;
 let t=menu.querySelector('.tabs');t.innerHTML='';
 [['Creatives','✦ Creatives'],['Videos','▶ Videos'],['UGC','◉ UGC'],['Camera','⌁ Camera'],['Brand','◆ Brand'],['All','⌘ All']].forEach(([v,l])=>{let b=document.createElement('button');b.className='tab'+(mode===v?' on':'');b.textContent=l;b.onclick=()=>{mode=v;cat='All';render('',true)};t.appendChild(b)});
 quick();
 let cs=mode==='Videos'?['Video']:mode==='UGC'?['UGC Video']:mode==='Camera'?['Camera']:mode==='Brand'?['Brand']:[...new Set(C.map(x=>x.category).filter(z=>mode!=='Creatives'||!['Video','UGC Video','Camera','Brand'].includes(z)))];
 const order=['Core','Social','Product','Campaign','Style','Environment','Info','Print','Utility','Brand','Video','UGC Video','Camera'],icons={All:'◈',Core:'✦',Social:'◎',Product:'◆',Campaign:'✺',Style:'◐',Environment:'⌁',Info:'i',Print:'▤',Utility:'⌘',Brand:'◇',Video:'▶','UGC Video':'◉',Camera:'⌖'};
 cs.sort((a,b)=>(order.indexOf(a)<0?99:order.indexOf(a))-(order.indexOf(b)<0?99:order.indexOf(b)));
 let ce=menu.querySelector('.cats');ce.innerHTML='';
 ['All',...cs].forEach(v=>{let b=document.createElement('button');b.className='cat'+(cat===v?' on':'');b.innerHTML=`<span class="ico">${icons[v]||'•'}</span><span>${v}</span>`;b.onclick=()=>{cat=v;render(query,false)};ce.appendChild(b)});
 items=rows().slice(0,50);sel=Math.min(sel,Math.max(0,items.length-1));
 let le=menu.querySelector('.list');le.innerHTML='';
 items.forEach((x,i)=>{let r=document.createElement('div');r.className='row'+(sel===i?' on':'');r.innerHTML='<div class="cmd"></div><div class="copy"><div class="lab"></div><div class="desc"></div></div><div class="arr">›</div>';r.querySelector('.cmd').textContent=x.cmd.startsWith('@brand:')?'SELECT':x.cmd==='@auto'?'AUTO':x.cmd;r.querySelector('.lab').textContent=x.label;r.querySelector('.desc').textContent=x.desc||'';r.onclick=()=>choose(x);le.appendChild(r)});
 ui();menu.classList.add('show');
}
const isEd=e=>!!e&&(e.tagName==='TEXTAREA'||e.isContentEditable||e.closest?.('[contenteditable="true"]')),getEd=e=>e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]')),text=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function setText(e,t){if(!e)return;if(e.tagName==='TEXTAREA'){let s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();return}e.focus();let se=getSelection(),r=document.createRange();r.selectNodeContents(e);se.removeAllRanges();se.addRange(r);let ok=false;try{ok=document.execCommand('insertText',false,t)}catch{}if(!ok){e.textContent=t;e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}))}}
function choose(x){if(x.cmd==='@auto'){ss(K.m,'');detect();if(ed)setText(ed,text(ed).replace(/(?:^|\n)\/[\w-]*$/,''));menu.classList.remove('show');return}if(x.cmd.startsWith('@brand:')){ss(K.m,x.cmd.slice(7));detect();if(ed)setText(ed,text(ed).replace(/(?:^|\n)\/[\w-]*$/,''));menu.classList.remove('show');return}let t=text(ed);setText(ed,t.replace(/(?:^|\n)\/[\w-]*$/,m=>(m.startsWith('\n')?'\n':'')+prompt(x)));menu.classList.remove('show')}
function slash(t){let m=String(t).match(/(?:^|\n)\/([\w-]*)$/);return m?m[1]:null}
function liURL(raw){let s=String(raw||'').trim();if(!/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[^\s?#]+\/?(?:\?[^\s]*)?$/i.test(s))return'';return /^https?:\/\//i.test(s)?s:'https://'+s}
function send(){let b=document.querySelector('button[data-testid="send-button"],button[aria-label*="Send message" i],button[aria-label^="Send" i]');if(b&&!b.disabled)b.click()}
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey||!isEd(e.target)||menu?.classList.contains('show'))return;let t=getEd(e.target),u=liURL(text(t));if(!u)return;e.preventDefault();e.stopImmediatePropagation();ed=t;setText(t,liPrompt(u));status='LinkedIn → Carousel';ui();setTimeout(send,150)},true);
document.addEventListener('input',e=>{if(!isEd(e.target))return;ed=getEd(e.target);let z=slash(text(ed));if(z===null){menu?.classList.remove('show');return}sync();detect();let s=z.toLowerCase();if(!s)mode='Creatives';else if(s.startsWith('brand'))mode='Brand';else if(s.startsWith('ugc'))mode='UGC';else if(s.includes('video')||['seedance','kling','runway'].some(k=>k.startsWith(s)))mode='Videos';else if(['camera','transition','slowmotion'].some(k=>k.startsWith(s)||s.startsWith(k)))mode='Camera';else mode='All';cat='All';render(mode==='Brand'?'':z,false)},true);
document.addEventListener('keydown',e=>{if(!menu?.classList.contains('show')||!isEd(e.target))return;if(e.key==='ArrowDown'){e.preventDefault();sel=(sel+1)%Math.max(1,items.length);render(query,false)}else if(e.key==='ArrowUp'){e.preventDefault();sel=(sel-1+Math.max(1,items.length))%Math.max(1,items.length);render(query,false)}else if(e.key==='Enter'&&!e.shiftKey&&items.length){e.preventDefault();e.stopPropagation();choose(items[sel])}else if(e.key==='Escape')menu.classList.remove('show')},true);
addEventListener('focus',()=>{sync(true);detect()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);detect()}});new MutationObserver(()=>detect()).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','data-state','data-active','href']});make();sync(true);setInterval(()=>sync(true),30000);
})();