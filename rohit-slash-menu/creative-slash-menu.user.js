// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      5.2.0
// @description  Creative + Video slash menu for ChatGPT with visible Video/UGC tabs and live sync.
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
const VERSION='5.2.0';
const URL='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/commands.json';
const CK='creativeSlashMenu.library.v52';
const BASE='Use the uploaded product/image/reference whenever present. Preserve product shape, packaging, label, logo, colors and brand identity accurately. Keep every concept fresh and avoid repeating recent composition, background, lighting, camera angle, typography, pedestal, splash or layout. Default creative format is standalone 4:5. Never make a collage unless explicitly requested.';
const FALLBACK={libraryVersion:'5.2-fallback',categories:['Core','Product','Campaign','Style','Social','Video','UGC Video','Camera'],commands:[
{category:'Core',cmd:'/creative',label:'Fresh Creative',desc:'Fresh premium creative'},
{category:'Core',cmd:'/trend',label:'Trend-Led',desc:'Current high-end direction'},
{category:'Core',cmd:'/redesign',label:'Redesign',desc:'Complete visual redesign'},
{category:'Product',cmd:'/cgi',label:'CGI Creative',desc:'High-end 3D CGI product world'},
{category:'Product',cmd:'/productad',label:'Product Ad',desc:'Premium product advertisement'},
{category:'Social',cmd:'/story',label:'Story',desc:'9:16 Instagram Story'},
{category:'Video',cmd:'/video',label:'Fresh Video Concept',desc:'Complete AI video concept'},
{category:'Video',cmd:'/productvideo',label:'Product Video',desc:'Cinematic product advertising video'},
{category:'Video',cmd:'/cgivideo',label:'CGI Product Video',desc:'High-end 3D CGI product animation'},
{category:'Video',cmd:'/cinematicvideo',label:'Cinematic Video',desc:'Film-style commercial video'},
{category:'Video',cmd:'/reelvideo',label:'Reel Video',desc:'High-retention Instagram Reel'},
{category:'Video',cmd:'/productreveal',label:'Product Reveal',desc:'Premium reveal sequence'},
{category:'Video',cmd:'/unboxing',label:'Unboxing',desc:'Natural product unboxing video'},
{category:'Video',cmd:'/testimonial',label:'Testimonial',desc:'Natural creator testimonial'},
{category:'Video',cmd:'/broll',label:'B-Roll',desc:'Premium supporting B-roll'},
{category:'Video',cmd:'/seedance',label:'Seedance Prompt',desc:'Seedance-ready video prompt'},
{category:'Video',cmd:'/kling',label:'Kling Prompt',desc:'Kling-ready video prompt'},
{category:'Video',cmd:'/runway',label:'Runway Prompt',desc:'Runway-ready video prompt'},
{category:'UGC Video',cmd:'/ugcvideo',label:'UGC Video',desc:'Natural creator-style UGC'},
{category:'UGC Video',cmd:'/ugc-indian',label:'Indian UGC',desc:'Indian creator • Indian English / Hinglish'},
{category:'UGC Video',cmd:'/ugc-american',label:'American UGC',desc:'US creator • American English'},
{category:'UGC Video',cmd:'/ugc-british',label:'British UGC',desc:'UK creator • British English'},
{category:'UGC Video',cmd:'/ugc-australian',label:'Australian UGC',desc:'Australian creator style'},
{category:'UGC Video',cmd:'/ugc-middleeast',label:'Middle East UGC',desc:'Middle East / Gulf creator style'},
{category:'UGC Video',cmd:'/ugc-european',label:'European UGC',desc:'Modern European creator style'},
{category:'UGC Video',cmd:'/ugc-latam',label:'Latin American UGC',desc:'Latin American creator style'},
{category:'UGC Video',cmd:'/ugc-global',label:'Global UGC',desc:'Region-neutral international UGC'},
{category:'Camera',cmd:'/camera',label:'Camera Motion',desc:'Natural cinematic camera moves'},
{category:'Camera',cmd:'/transition',label:'Transitions',desc:'Premium transition ideas'},
{category:'Camera',cmd:'/slowmotion',label:'Slow Motion',desc:'Premium slow-motion prompt'}]};
const SPECIAL={
'/creative':`Create a completely fresh high-end professional creative. ${BASE}`,
'/trend':`Create a current trend-led premium creative. Research current relevant high-end advertising and design references online when useful, then synthesize an original direction. ${BASE}`,
'/redesign':`Completely redesign the uploaded creative with a genuinely new composition, hierarchy, background, typography treatment, lighting and visual story. ${BASE}`,
'/cgi':`Create a high-end 3D CGI advertising creative using the uploaded product as the exact hero reference. Use premium physically believable materials, cinematic commercial lighting, realistic reflections/shadows and atmospheric depth. Avoid generic repeated pedestal, smoke, splash, rocks or camera angles. ${BASE}`,
'/video':'Create a complete premium AI video concept using the uploaded product, image or brief. Default: 15 seconds, 9:16. Build a coherent shot-by-shot sequence with a strong hook, realistic motion, natural camera movement, consistent product identity, smooth transitions and a final hero shot. Avoid random morphing and repeated shots.',
'/productvideo':'Create a premium cinematic product advertising video using the uploaded product as the exact reference. Preserve packaging, logo, shape, label, proportions and colors in every shot. Default: 15 seconds, 9:16, 6-10 distinct shots, natural camera moves, macro details and a strong final packshot.',
'/cgivideo':'Create a high-end 3D CGI product advertising video using the uploaded product as the exact reference. Use believable materials, cinematic lighting, realistic reflections/shadows, elegant camera choreography and smooth motion. Preserve the product exactly in every frame. Default: 15 seconds, 9:16, 6-8 shots.',
'/cinematicvideo':'Create a cinematic commercial video with film-like framing, realistic camera motion, depth of field, atmospheric detail, premium lighting and coherent visual storytelling. Default: 15 seconds, 9:16.',
'/reelvideo':'Create a high-retention 9:16 Instagram Reel. Default: 15 seconds with a strong first-second hook, 7-10 coherent shots, natural handheld/gimbal movement, clean transitions and a final hero shot.',
'/productreveal':'Create a premium product reveal video. Build anticipation, reveal progressively through light, motion or environment, and finish on a clean hero frame. Preserve product shape and label. Default: 8-12 seconds, 9:16.',
'/unboxing':'Create a natural premium unboxing video showing believable hands, packaging interaction, opening, reveal, close-up details, reaction and final product shot. Default: 15-20 seconds, 9:16, realistic smartphone behavior.',
'/testimonial':'Create a believable vertical creator testimonial with an authentic hook, natural speech, pauses, expressions, gestures, product interaction, one clear benefit/story and a natural recommendation. Default: 15-30 seconds, 9:16.',
'/broll':'Create 8-12 premium B-roll shots covering wide, medium, close-up, macro, details, environment, interaction and hero angles. Camera movement must feel physically filmed.',
'/seedance':'Write a production-ready Seedance video prompt using the uploaded references, including duration, aspect ratio, subject/product lock, shot progression, camera movement, lighting, transitions and negative constraints.',
'/kling':'Write a production-ready Kling video prompt with identity/product consistency, realistic physics, controlled camera movement, coherent action and constraints against warping, morphing or label changes.',
'/runway':'Write a production-ready Runway video prompt specifying subject lock, action, camera move, environment, lighting, motion speed, continuity and what must remain unchanged.',
'/ugcvideo':'Create a natural creator-style UGC video. Default: 15-30 seconds, 9:16, realistic smartphone camera behavior, natural lighting, authentic speech, believable gestures and product interaction.',
'/ugc-indian':'Create a natural Indian-market UGC video. Use an Indian creator and believable contemporary Indian setting. Dialogue should sound like natural Indian English or Hinglish, not formal translation. Keep expressions, gestures, pacing, smartphone-camera movement and product interaction authentic. Default: 15-30 seconds, 9:16.',
'/ugc-american':'Create a natural US-market UGC video with an American creator, believable US setting, natural American English, conversational pacing, smartphone-camera behavior and realistic product interaction. Default: 15-30 seconds, 9:16.',
'/ugc-british':'Create a natural UK-market UGC video with a British creator, believable UK setting, natural British English, understated delivery and genuine product interaction. Default: 15-30 seconds, 9:16.',
'/ugc-australian':'Create a natural Australian-market UGC video with an Australian creator, authentic Australian English, local lifestyle context and realistic smartphone behavior. Default: 15-30 seconds, 9:16.',
'/ugc-middleeast':'Create a natural Middle East/Gulf UGC video with a believable contemporary regional setting. Use English by default; Arabic only if requested. Default: 15-30 seconds, 9:16.',
'/ugc-european':'Create a natural European-market UGC video with a believable contemporary European setting. Use neutral English unless a specific country/language is requested. Default: 15-30 seconds, 9:16.',
'/ugc-latam':'Create a natural Latin American-market UGC video with an authentic regional setting. Use English by default unless Spanish or Portuguese is requested. Default: 15-30 seconds, 9:16.',
'/ugc-global':'Create globally neutral UGC suitable for international use with a universal setting, neutral English, natural smartphone behavior and realistic product interaction. Default: 15-30 seconds, 9:16.',
'/camera':'Create 8 practical cinematic camera-motion options: push-in, pull-out, left/right slide, slow arc, low-angle rise, top-down drift and gentle handheld/gimbal movement. Keep product identity stable.',
'/transition':'Create 8 premium motivated transitions including match cuts, foreground wipes, whip pans, light passes, rack-focus, speed ramps and object wipes. Avoid random AI morphing.',
'/slowmotion':'Create a premium slow-motion video prompt with realistic high-frame-rate behavior, physically believable motion, controlled lighting and stable subject/product identity.'};
function gp(x){return SPECIAL[x.cmd]||x.prompt||`${x.desc||x.label}. Create a production-ready ${['Video','UGC Video','Camera'].includes(x.category)?'AI video':'creative'} output with stable identity, realistic behavior and clear visual direction. ${['Video','UGC Video','Camera'].includes(x.category)?'':BASE}`;}
function norm(r){const incoming=Array.isArray(r?.commands)?r.commands:[];const a=Object.fromEntries(FALLBACK.commands.map(x=>[x.cmd,x])),b=Object.fromEntries(incoming.filter(x=>x?.cmd).map(x=>[x.cmd,x]));const order=[];incoming.concat(FALLBACK.commands).forEach(x=>{if(x?.cmd&&!order.includes(x.cmd))order.push(x.cmd)});const commands=order.map(c=>({...a[c],...b[c]})).filter(x=>x.cmd&&x.label);const categories=[...new Set([...(r?.categories||[]),...FALLBACK.categories,...commands.map(x=>x.category)])];return {...FALLBACK,...(r||{}),commands,categories};}
function cache(){try{const x=GM_getValue(CK,'');return x?norm(JSON.parse(x)):norm(FALLBACK)}catch{return norm(FALLBACK)}}
let LIB=cache(),status='Cached';
function sync(){status='Syncing…';return new Promise(res=>{GM_xmlhttpRequest({method:'GET',url:`${URL}?t=${Date.now()}`,timeout:15000,onload:r=>{try{if(r.status<200||r.status>=300)throw 0;LIB=norm(JSON.parse(r.responseText));GM_setValue(CK,JSON.stringify(LIB));status='Synced';res(true)}catch{status='Offline';res(false)}},onerror:()=>{status='Offline';res(false)},ontimeout:()=>{status='Offline';res(false)}})})}
let host,root,menu,editor,items=[],idx=0,q='',mode='Creatives',cat='All';
const CSS=`:host{all:initial}.m{position:fixed;z-index:2147483647;display:none;overflow:hidden;border:1px solid #ffffff20;border-radius:18px;background:#161619fa;color:#fff;box-shadow:0 22px 70px #0008;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.m.show{display:block}.h{display:flex;justify-content:space-between;align-items:center;padding:13px 14px 10px;border-bottom:1px solid #ffffff12}.t{font-size:14px;font-weight:750}.s{font-size:10px;color:#ffffff80;margin-top:3px}.st{font-size:10px;background:#ffffff12;padding:5px 8px;border-radius:99px}.modes{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:9px;border-bottom:1px solid #ffffff12}.mode,.cat,.sync{border:0;cursor:pointer;color:#ffffffb0;background:#ffffff0e}.mode{border-radius:10px;padding:8px 4px;font-weight:650;font-size:11px}.mode.a,.mode:hover{background:#a78bfa30;color:#e6ddff}.cats{display:flex;gap:6px;overflow-x:auto;padding:7px 9px;border-bottom:1px solid #ffffff0d}.cat{border-radius:99px;padding:5px 8px;font-size:10px;white-space:nowrap}.cat.a{background:#a78bfa28;color:#e6ddff}.list{max-height:min(430px,50vh);overflow:auto;padding:7px}.i{display:grid;grid-template-columns:128px 1fr;gap:10px;padding:10px;border-radius:11px;cursor:pointer}.i:hover,.i.a{background:#ffffff14}.cmd{font:750 12px ui-monospace,monospace;color:#b9a5ff}.lab{font-size:12.5px;font-weight:680}.chip{font-size:9px;color:#ffffff70;background:#ffffff0d;border-radius:5px;padding:2px 5px;margin-left:6px}.d{font-size:11px;color:#ffffff88;margin-top:2px}.f{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-top:1px solid #ffffff0d;font-size:10px;color:#ffffff70}.sync{border-radius:7px;padding:6px 9px;background:#a78bfa22;color:#d9ccff}`;
const isEd=e=>!!e&&(e.tagName==='TEXTAREA'||e.isContentEditable||e.closest?.('[contenteditable="true"]'));
const ed=e=>e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]'));
const txt=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function setTxt(e,t){if(e.tagName==='TEXTAREA'){const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();return}e.focus();const sel=getSelection(),r=document.createRange();r.selectNodeContents(e);sel.removeAllRanges();sel.addRange(r);let ok=false;try{ok=document.execCommand('insertText',false,t)}catch{}if(!ok){e.replaceChildren();const p=document.createElement('p');p.textContent=t;e.appendChild(p);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}))}}
function make(){if(menu)return;host=document.createElement('div');host.style.cssText='position:fixed;z-index:2147483647';document.documentElement.appendChild(host);root=host.attachShadow({mode:'open'});const st=document.createElement('style');st.textContent=CSS;root.appendChild(st);menu=document.createElement('div');menu.className='m';menu.innerHTML=`<div class="h"><div><div class="t">Creative + Video Commands</div><div class="s">Creatives • Videos • UGC • Camera</div></div><div class="st">Ready</div></div><div class="modes"></div><div class="cats"></div><div class="list"></div><div class="f"><span>Script ${VERSION}</span><button class="sync">Force Sync</button></div>`;root.appendChild(menu);menu.querySelector('.sync').onmousedown=async e=>{e.preventDefault();menu.querySelector('.st').textContent='Syncing…';await sync();render(q)}}
function pos(){if(!menu||!editor)return;const r=editor.getBoundingClientRect(),w=Math.min(650,Math.max(400,r.width||400));menu.style.width=w+'px';menu.style.left=Math.max(12,Math.min(r.left,innerWidth-w-12))+'px';let y=r.top-Math.min(560,innerHeight*.65)-10;if(y<12)y=r.bottom+8;menu.style.top=Math.max(12,y)+'px'}
function modes(){const w=menu.querySelector('.modes');w.innerHTML='';[['Creatives','Creatives'],['Videos','Videos'],['UGC','UGC'],['Camera','Camera'],['All','All']].forEach(([n,l])=>{const b=document.createElement('button');b.className='mode'+(mode===n?' a':'');b.textContent=l;b.onmousedown=e=>{e.preventDefault();mode=n;cat='All';idx=0;render(q)};w.appendChild(b)})}
function cats(){const w=menu.querySelector('.cats');w.innerHTML='';let cs=[...(LIB.categories||[])];if(mode==='Videos')cs=['Video'];else if(mode==='UGC')cs=['UGC Video'];else if(mode==='Camera')cs=['Camera'];else if(mode==='Creatives')cs=cs.filter(x=>!['Video','UGC Video','Camera'].includes(x));['All',...cs].forEach(c=>{const b=document.createElement('button');b.className='cat'+(cat===c?' a':'');b.textContent=c;b.onmousedown=e=>{e.preventDefault();cat=c;idx=0;render(q)};w.appendChild(b)})}
function render(x=''){make();q=(x||'').toLowerCase();modes();cats();let a=[...(LIB.commands||[])];if(mode==='Videos')a=a.filter(x=>x.category==='Video');else if(mode==='UGC')a=a.filter(x=>x.category==='UGC Video');else if(mode==='Camera')a=a.filter(x=>x.category==='Camera');else if(mode==='Creatives')a=a.filter(x=>!['Video','UGC Video','Camera'].includes(x.category));if(cat!=='All')a=a.filter(x=>x.category===cat);if(q)a=a.filter(x=>[x.cmd,x.label,x.desc,...(x.tags||[])].join(' ').toLowerCase().includes(q));a=a.slice(0,24);items=a;idx=Math.min(idx,Math.max(0,a.length-1));const l=menu.querySelector('.list');l.innerHTML='';a.forEach((x,i)=>{const r=document.createElement('div');r.className='i'+(i===idx?' a':'');r.innerHTML='<div class="cmd"></div><div><span class="lab"></span><span class="chip"></span><div class="d"></div></div>';r.querySelector('.cmd').textContent=x.cmd;r.querySelector('.lab').textContent=x.label;r.querySelector('.chip').textContent=x.category;r.querySelector('.d').textContent=x.desc||'';r.onmousedown=e=>{e.preventDefault();choose(x)};l.appendChild(r)});menu.querySelector('.st').textContent=status;menu.classList.add('show');pos()}
function choose(x){const t=txt(editor),p=gp(x),n=t.replace(/(?:^|\n)\/[a-zA-Z0-9_-]*$/,m=>(m.startsWith('\n')?'\n':'')+p);setTxt(editor,n);menu.classList.remove('show')}
function sq(t){const m=String(t).match(/(?:^|\n)\/([\w-]*)$/);return m?m[1]:null}
document.addEventListener('input',e=>{if(!isEd(e.target))return;editor=ed(e.target);const x=sq(txt(editor));if(x===null){if(menu)menu.classList.remove('show');return}const z=x.toLowerCase();if(z.startsWith('ugc'))mode='UGC';else if(['camera','transition','slowmotion'].some(k=>k.startsWith(z)||z.startsWith(k)))mode='Camera';else if(z.includes('video')||['seedance','kling','runway','unboxing','testimonial','broll','productreveal'].some(k=>k.startsWith(z)||z.startsWith(k)))mode='Videos';else if(!z)mode='Creatives';cat='All';render(x)},true);
document.addEventListener('keydown',e=>{if(!menu?.classList.contains('show')||!isEd(e.target))return;if(e.key==='ArrowDown'){e.preventDefault();idx=(idx+1)%Math.max(1,items.length);render(q)}else if(e.key==='ArrowUp'){e.preventDefault();idx=(idx-1+Math.max(1,items.length))%Math.max(1,items.length);render(q)}else if(e.key==='Enter'&&!e.shiftKey&&items.length){e.preventDefault();e.stopPropagation();choose(items[idx])}else if(e.key==='Escape'){e.preventDefault();menu.classList.remove('show')}},true);
addEventListener('resize',pos);addEventListener('scroll',pos,true);sync();
})();
