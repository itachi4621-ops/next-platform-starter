// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      5.3.0
// @description  Creative + Video slash menu for ChatGPT with anti-repeat art direction and live GitHub sync.
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

const VERSION='5.3.0';
const LIB_URL='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/commands.json';
const CACHE_KEY='creativeSlashMenu.library.v53';
const FAMILY_KEY='creativeSlashMenu.recentFamilies.v53';

const BASE=`Use the uploaded product/image/reference whenever present. Preserve the exact product shape, packaging, label, logo, cap, colors, proportions and brand identity. Make the result feel like a real global advertising campaign, not a generic AI template. Do not default to the safe formula of a bottle standing on a glossy table with a headline on the left, a blurred lifestyle person in the background, fruit props around the product, pastel gradient panels, mirror/glass walls, symmetrical pedestal compositions, or a soft wellness/spa set. Use those devices only when the brief genuinely calls for them. Each new creative must visibly change at least six major design decisions: composition, camera angle, scale, environment, lighting, material language, depth, typography treatment, prop logic, and visual storytelling. No unnecessary headline or body copy unless the user supplied copy or explicitly asked for text. Default output is one standalone 4:5 Instagram creative. Never combine multiple creatives into one collage unless explicitly requested.`;

const FAMILIES=[
'architecture-scale CGI: make the product interact with monumental architecture or oversized spatial forms; dramatic scale, unusual perspective, no standard tabletop',
'ingredient world: build an immersive world from the product ingredient/flavour itself, with the product integrated naturally rather than surrounded by random props',
'macro surrealism: extreme close-up material world, shallow depth, unexpected scale relationships, tactile detail, unconventional crop',
'kinetic diagonal composition: strong directional motion, off-centre hero placement, layered foreground/background movement and energetic asymmetry',
'top-down designed scene: graphic overhead composition with precise object choreography, strong negative space and non-standard product orientation',
'editorial fashion set: art-directed campaign set with sculptural styling, confident cropping, sophisticated negative space and magazine-level composition',
'tactile material concept: paper, fabric, foam, clay, liquid glass, metal, ice or another single material becomes the visual system around the product',
'cinematic narrative frame: create a believable story moment that feels like one frame from a premium commercial rather than a static product poster',
'product-as-landscape: treat product details, label graphics, flavour or texture as a large visual environment; avoid literal pedestal staging',
'abstract geometry: bold custom geometric forms, depth and shadows create a distinctive brand world; avoid generic gradient panels',
'scientific visualisation: elegant technical or microscopic visual language, ingredient particles, structure or energy translated into premium design',
'real-world action: place product inside a believable active situation with motion, hands, environment or consequence instead of passive display',
'low-angle iconic hero: dramatic low camera, strong foreshortening, large scale and environmental depth; no centered eye-level catalogue shot',
'monochrome shadow sculpture: controlled single-colour environment with sculptural light/shadow as the main design device, minimal props',
'fake OOH / impossible scale: oversized product integrated into a convincing real-world location with believable perspective and premium ad logic',
'graphic editorial system: visual-first layout driven by cropping, shape, texture and image hierarchy; typography is secondary and only used if needed',
'floating spatial choreography: product and supporting elements occupy different depth planes with deliberate balance and realistic physics, not random levitation',
'nature transformed: use a specific natural phenomenon—mist, mineral, leaves, water, stone, sunlight, frost—as a conceptual environment rather than generic greenery'
];

const FALLBACK={libraryVersion:'5.3-fallback',categories:['Core','Product','Campaign','Style','Social','Video','UGC Video','Camera'],commands:[
{category:'Core',cmd:'/creative',label:'Fresh Creative',desc:'Fresh concept with anti-repeat art direction'},
{category:'Core',cmd:'/trend',label:'Trend-Led',desc:'Current high-end design direction'},
{category:'Core',cmd:'/surprise',label:'Surprise Me',desc:'Unexpected premium direction'},
{category:'Core',cmd:'/variation',label:'Fresh Variation',desc:'New concept, not a recolor'},
{category:'Core',cmd:'/redesign',label:'Redesign',desc:'Complete visual redesign'},
{category:'Product',cmd:'/productad',label:'Product Ad',desc:'Premium product advertisement'},
{category:'Product',cmd:'/producthero',label:'Product Hero',desc:'Distinctive hero product composition'},
{category:'Product',cmd:'/cgi',label:'CGI Creative',desc:'High-end 3D CGI product world'},
{category:'Product',cmd:'/studio',label:'Studio Shot',desc:'Art-directed commercial studio shot'},
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
{category:'Camera',cmd:'/slowmotion',label:'Slow Motion',desc:'Premium slow-motion prompt'}
]};

const SPECIAL={
'/creative':`Create a completely fresh high-end professional creative. Chosen visual direction: {{FRESH_FAMILY}}. Treat this direction as the main concept, not a minor styling note. {{BASE}}`,
'/trend':`Create a current trend-led premium creative. Research current relevant high-end advertising, CGI, editorial and social design references online when useful, then synthesize an original direction rather than copying a reference. Chosen composition family: {{FRESH_FAMILY}}. {{BASE}}`,
'/surprise':`Create an unexpected, bold but commercially usable premium creative. Do not choose the safest obvious layout. Chosen visual direction: {{FRESH_FAMILY}}. Push composition, scale and visual storytelling while keeping the product accurate. {{BASE}}`,
'/variation':`Create a genuinely new variation, not a recolor and not the same composition with different props. Chosen visual direction: {{FRESH_FAMILY}}. Change at least six major visual decisions from the previous design. {{BASE}}`,
'/redesign':`Completely redesign the uploaded creative. Keep only required brand/product information; rebuild composition, camera, spatial depth, background, lighting, typography logic and visual story. Do not preserve the old layout. Chosen visual direction: {{FRESH_FAMILY}}. {{BASE}}`,
'/productad':`Create a premium product advertisement with a strong original concept instead of a catalogue-style product shot. Chosen visual direction: {{FRESH_FAMILY}}. Make the product unmistakably important without defaulting to centered bottle + headline + props. {{BASE}}`,
'/producthero':`Create an iconic hero-product campaign visual. Chosen visual direction: {{FRESH_FAMILY}}. Use scale, angle, depth, light and environment to make the product memorable; avoid standard eye-level tabletop staging. {{BASE}}`,
'/cgi':`Create a high-end 3D CGI advertising creative using the uploaded product as the exact hero reference. Chosen visual direction: {{FRESH_FAMILY}}. Use physically believable materials, premium lighting, realistic reflections/shadows and atmospheric depth. Do not recycle generic rocks, smoke, splash, pedestal or centered product formulas. {{BASE}}`,
'/studio':`Create an art-directed commercial studio image, not a plain ecommerce shot. Chosen visual direction: {{FRESH_FAMILY}}. Use distinctive framing, lighting and material language while preserving product identity. {{BASE}}`,
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
'/slowmotion':'Create a premium slow-motion video prompt with realistic high-frame-rate behavior, physically believable motion, controlled lighting and stable subject/product identity.'
};

function pickFamily(){
  let recent=[];
  try{recent=JSON.parse(GM_getValue(FAMILY_KEY,'[]'))||[]}catch{}
  const available=FAMILIES.map((x,i)=>i).filter(i=>!recent.includes(i));
  const pool=available.length?available:FAMILIES.map((_,i)=>i);
  const idx=pool[Math.floor(Math.random()*pool.length)];
  recent=[idx,...recent.filter(i=>i!==idx)].slice(0,5);
  try{GM_setValue(FAMILY_KEY,JSON.stringify(recent))}catch{}
  return FAMILIES[idx];
}

function hydrate(text){
  const needsFamily=String(text).includes('{{FRESH_FAMILY}}');
  const family=needsFamily?pickFamily():'';
  return String(text)
    .replaceAll('{{FRESH_FAMILY}}',family)
    .replaceAll('{{BASE}}',BASE);
}

function genericPrompt(x){
  if(['Video','UGC Video','Camera'].includes(x.category))
    return `${x.desc||x.label}. Create a production-ready AI video prompt with stable identity/product continuity, realistic physics, clear camera behavior and a coherent visual sequence.`;
  return `Create a premium ${x.label||'creative'} output. Use this fresh art direction: {{FRESH_FAMILY}}. ${x.desc||''}. {{BASE}}`;
}

function gp(x){
  const source=x.prompt||SPECIAL[x.cmd]||genericPrompt(x);
  return hydrate(source);
}

function norm(remote){
  const incoming=Array.isArray(remote?.commands)?remote.commands:[];
  const local=Object.fromEntries(FALLBACK.commands.map(x=>[x.cmd,x]));
  const remoteMap=Object.fromEntries(incoming.filter(x=>x?.cmd).map(x=>[x.cmd,x]));
  const order=[];
  incoming.concat(FALLBACK.commands).forEach(x=>{if(x?.cmd&&!order.includes(x.cmd))order.push(x.cmd)});
  const commands=order.map(cmd=>({...local[cmd],...remoteMap[cmd]})).filter(x=>x.cmd&&x.label);
  const categories=[...new Set([...(remote?.categories||[]),...FALLBACK.categories,...commands.map(x=>x.category)])];
  return {...FALLBACK,...(remote||{}),commands,categories};
}

function cached(){
  try{const raw=GM_getValue(CACHE_KEY,'');return raw?norm(JSON.parse(raw)):norm(FALLBACK)}catch{return norm(FALLBACK)}
}

let LIB=cached(),status='Cached';
function sync(){
  status='Syncing…';
  return new Promise(resolve=>{
    GM_xmlhttpRequest({method:'GET',url:`${LIB_URL}?t=${Date.now()}`,timeout:15000,
      onload:r=>{try{if(r.status<200||r.status>=300)throw 0;LIB=norm(JSON.parse(r.responseText));GM_setValue(CACHE_KEY,JSON.stringify(LIB));status='Synced';resolve(true)}catch{status='Offline';resolve(false)}},
      onerror:()=>{status='Offline';resolve(false)},ontimeout:()=>{status='Offline';resolve(false)}
    });
  });
}

let host,root,menu,editor,items=[],selected=0,query='',mode='Creatives',category='All';
const CSS=`:host{all:initial}.m{position:fixed;z-index:2147483647;display:none;overflow:hidden;border:1px solid #ffffff20;border-radius:18px;background:#161619fa;color:#fff;box-shadow:0 22px 70px #0008;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.m.show{display:block}.h{display:flex;justify-content:space-between;align-items:center;padding:13px 14px 10px;border-bottom:1px solid #ffffff12}.t{font-size:14px;font-weight:750}.s{font-size:10px;color:#ffffff80;margin-top:3px}.st{font-size:10px;background:#ffffff12;padding:5px 8px;border-radius:99px}.modes{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:9px;border-bottom:1px solid #ffffff12}.mode,.cat,.sync{border:0;cursor:pointer;color:#ffffffb0;background:#ffffff0e}.mode{border-radius:10px;padding:8px 4px;font-weight:650;font-size:11px}.mode.a,.mode:hover{background:#a78bfa30;color:#e6ddff}.cats{display:flex;gap:6px;overflow-x:auto;padding:7px 9px;border-bottom:1px solid #ffffff0d}.cat{border-radius:99px;padding:5px 8px;font-size:10px;white-space:nowrap}.cat.a{background:#a78bfa28;color:#e6ddff}.list{max-height:min(430px,50vh);overflow:auto;padding:7px}.i{display:grid;grid-template-columns:128px 1fr;gap:10px;padding:10px;border-radius:11px;cursor:pointer}.i:hover,.i.a{background:#ffffff14}.cmd{font:750 12px ui-monospace,monospace;color:#b9a5ff}.lab{font-size:12.5px;font-weight:680}.chip{font-size:9px;color:#ffffff70;background:#ffffff0d;border-radius:5px;padding:2px 5px;margin-left:6px}.d{font-size:11px;color:#ffffff88;margin-top:2px}.f{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-top:1px solid #ffffff0d;font-size:10px;color:#ffffff70}.sync{border-radius:7px;padding:6px 9px;background:#a78bfa22;color:#d9ccff}`;
const isEditor=e=>!!e&&(e.tagName==='TEXTAREA'||e.isContentEditable||e.closest?.('[contenteditable="true"]'));
const getEditor=e=>e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]'));
const getText=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function setText(e,t){if(e.tagName==='TEXTAREA'){const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();return}e.focus();const sel=getSelection(),r=document.createRange();r.selectNodeContents(e);sel.removeAllRanges();sel.addRange(r);let ok=false;try{ok=document.execCommand('insertText',false,t)}catch{}if(!ok){e.replaceChildren();const p=document.createElement('p');p.textContent=t;e.appendChild(p);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}))}}
function make(){if(menu)return;host=document.createElement('div');host.style.cssText='position:fixed;z-index:2147483647';document.documentElement.appendChild(host);root=host.attachShadow({mode:'open'});const st=document.createElement('style');st.textContent=CSS;root.appendChild(st);menu=document.createElement('div');menu.className='m';menu.innerHTML=`<div class="h"><div><div class="t">Creative + Video Commands</div><div class="s">Anti-repeat creative engine • Video • Regional UGC</div></div><div class="st">Ready</div></div><div class="modes"></div><div class="cats"></div><div class="list"></div><div class="f"><span>Script ${VERSION}</span><button class="sync">Force Sync</button></div>`;root.appendChild(menu);menu.querySelector('.sync').onmousedown=async e=>{e.preventDefault();menu.querySelector('.st').textContent='Syncing…';await sync();render(query)}}
function position(){if(!menu||!editor)return;const r=editor.getBoundingClientRect(),w=Math.min(650,Math.max(400,r.width||400));menu.style.width=w+'px';menu.style.left=Math.max(12,Math.min(r.left,innerWidth-w-12))+'px';let y=r.top-Math.min(560,innerHeight*.65)-10;if(y<12)y=r.bottom+8;menu.style.top=Math.max(12,y)+'px'}
function renderModes(){const w=menu.querySelector('.modes');w.innerHTML='';[['Creatives','Creatives'],['Videos','Videos'],['UGC','UGC'],['Camera','Camera'],['All','All']].forEach(([n,l])=>{const b=document.createElement('button');b.className='mode'+(mode===n?' a':'');b.textContent=l;b.onmousedown=e=>{e.preventDefault();mode=n;category='All';selected=0;render(query)};w.appendChild(b)})}
function renderCats(){const w=menu.querySelector('.cats');w.innerHTML='';let cats=[...(LIB.categories||[])];if(mode==='Videos')cats=['Video'];else if(mode==='UGC')cats=['UGC Video'];else if(mode==='Camera')cats=['Camera'];else if(mode==='Creatives')cats=cats.filter(x=>!['Video','UGC Video','Camera'].includes(x));['All',...cats].forEach(c=>{const b=document.createElement('button');b.className='cat'+(category===c?' a':'');b.textContent=c;b.onmousedown=e=>{e.preventDefault();category=c;selected=0;render(query)};w.appendChild(b)})}
function render(x=''){make();query=(x||'').toLowerCase();renderModes();renderCats();let list=[...(LIB.commands||[])];if(mode==='Videos')list=list.filter(x=>x.category==='Video');else if(mode==='UGC')list=list.filter(x=>x.category==='UGC Video');else if(mode==='Camera')list=list.filter(x=>x.category==='Camera');else if(mode==='Creatives')list=list.filter(x=>!['Video','UGC Video','Camera'].includes(x.category));if(category!=='All')list=list.filter(x=>x.category===category);if(query)list=list.filter(x=>[x.cmd,x.label,x.desc,...(x.tags||[])].join(' ').toLowerCase().includes(query));list=list.slice(0,24);items=list;selected=Math.min(selected,Math.max(0,list.length-1));const el=menu.querySelector('.list');el.innerHTML='';list.forEach((x,i)=>{const row=document.createElement('div');row.className='i'+(i===selected?' a':'');row.innerHTML='<div class="cmd"></div><div><span class="lab"></span><span class="chip"></span><div class="d"></div></div>';row.querySelector('.cmd').textContent=x.cmd;row.querySelector('.lab').textContent=x.label;row.querySelector('.chip').textContent=x.category;row.querySelector('.d').textContent=x.desc||'';row.onmousedown=e=>{e.preventDefault();choose(x)};el.appendChild(row)});menu.querySelector('.st').textContent=status;menu.classList.add('show');position()}
function choose(x){const t=getText(editor),prompt=gp(x),next=t.replace(/(?:^|\n)\/[a-zA-Z0-9_-]*$/,m=>(m.startsWith('\n')?'\n':'')+prompt);setText(editor,next);menu.classList.remove('show')}
function slashQuery(t){const m=String(t).match(/(?:^|\n)\/([\w-]*)$/);return m?m[1]:null}
document.addEventListener('input',e=>{if(!isEditor(e.target))return;editor=getEditor(e.target);const x=slashQuery(getText(editor));if(x===null){if(menu)menu.classList.remove('show');return}const z=x.toLowerCase();if(z.startsWith('ugc'))mode='UGC';else if(['camera','transition','slowmotion'].some(k=>k.startsWith(z)||z.startsWith(k)))mode='Camera';else if(z.includes('video')||['seedance','kling','runway','unboxing','testimonial','broll','productreveal'].some(k=>k.startsWith(z)||z.startsWith(k)))mode='Videos';else if(!z)mode='Creatives';category='All';render(x)},true);
document.addEventListener('keydown',e=>{if(!menu?.classList.contains('show')||!isEditor(e.target))return;if(e.key==='ArrowDown'){e.preventDefault();selected=(selected+1)%Math.max(1,items.length);render(query)}else if(e.key==='ArrowUp'){e.preventDefault();selected=(selected-1+Math.max(1,items.length))%Math.max(1,items.length);render(query)}else if(e.key==='Enter'&&!e.shiftKey&&items.length){e.preventDefault();e.stopPropagation();choose(items[selected])}else if(e.key==='Escape'){e.preventDefault();menu.classList.remove('show')}},true);
addEventListener('resize',position);addEventListener('scroll',position,true);sync();
})();
