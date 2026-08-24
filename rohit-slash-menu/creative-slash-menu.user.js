// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      7.4.0
// @description  Creative Library Pro 7.4: expanded 3D Studio, premium UI, product geometry lock, format controls, favorites, recent and stable auto-update channel.
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
const V='7.4.0';
const BASE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const URL={commands:BASE+'commands.json',runtime:BASE+'runtime.json',brands:BASE+'brands.json',self:BASE+'creative-slash-menu.user.js'};
const K={commands:'csm740.commands',runtime:'csm740.runtime',brands:'csm740.brands',brand:'csm.manualBrand',format:'csm.format',layout:'csm.layout',platform:'csm.platform',favorites:'csm.favorites',recent:'csm.recent'};
const getJSON=(k,d)=>{try{const v=GM_getValue(k,'');return v?JSON.parse(v):d}catch{return d}};
const setJSON=(k,v)=>{try{GM_setValue(k,JSON.stringify(v))}catch{}};
const getStr=(k,d='')=>{try{return String(GM_getValue(k,d)||d)}catch{return d}};
const setStr=(k,v)=>{try{GM_setValue(k,String(v))}catch{}};

const productLock=`PRODUCT GEOMETRY LOCK — HIGHEST PRIORITY: when a product reference is uploaded, treat it as an immutable master reference. Preserve the exact visible silhouette, height-to-width ratio, proportions, cap/lid/neck/shoulder/base geometry, corners, curvature, handles/openings, label dimensions and placement, logo/artwork placement, colors, materials and distinctive visible surface details. Do not stretch, squash, slim, widen, shorten, elongate, taper, inflate, reshape, substitute, beautify, simplify, stylize or morph the product. Camera perspective may change apparent screen measurements, but the underlying product geometry must remain unchanged. In CGI/video, keep the same product geometry across all frames/shots. If real-world inch/mm accuracy is required, use supplied dimensions/CAD/3D data; never guess hidden measurements from a photo.`;
const noInvent=`Do not invent claims, prices, certifications, nutrition facts, ingredients, technical specs, legal/regulatory copy or hidden product internals. Use supplied facts and uploaded references as source-of-truth.`;
const multiAsset=`If N separate assets are requested, deliver exactly N separate standalone assets; never combine them into a collage/contact sheet unless explicitly requested.`;

const cmd=(category,command,label,desc,tags=[],prompt='')=>({category,cmd:command,label,desc,tags,prompt:prompt||`Create a ${label} direction: ${desc}.`});

const CREATE=[
cmd('Create','/creative','Fresh Creative','Agency-level social creative with a new composition and art direction',['social','creative']),
cmd('Create','/clean','Clean Minimal','Bright low-content creative with disciplined negative space',['minimal']),
cmd('Create','/bold','Bold Campaign','High-impact graphic campaign with expressive type and strong blocks',['bold']),
cmd('Create','/editorial','Editorial','Magazine-inspired art direction and refined grid',['editorial']),
cmd('Create','/banner','Banner / Hero','Campaign key visual or banner composition; ratio is controlled separately',['banner']),
cmd('Product Ads','/productad','Premium Product Ad','Designed product advertisement, not a catalogue photo',['product']),
cmd('Product Ads','/ingredient','Ingredient World','Ingredient/flavour-led world using supplied ingredients only',['product','ingredient']),
cmd('Product Ads','/technical','Technical Performance','Structured performance/science poster using supplied facts only',['product','technical'])
];

const PACK=[
cmd('Packaging','/packaging','Packaging Design','Create or redesign the actual packaging itself',['pack']),
cmd('Packaging','/labeldesign','Label Design','Print-aware label system with strong shelf hierarchy',['pack']),
cmd('Packaging','/labelredesign','Label Redesign','Upgrade an existing label while preserving required facts',['pack']),
cmd('Packaging','/frontlabel','Front Label','Principal display panel / front face only',['pack']),
cmd('Packaging','/backlabel','Back Label','Structured back/information panel',['pack']),
cmd('Packaging','/fullwrap','Full Wrap','360-degree wrap with seam-aware continuity',['pack']),
cmd('Packaging','/boxpack','Box Packaging','Carton with front, side and back panel logic',['pack']),
cmd('Packaging','/pouchpack','Pouch Packaging','Stand-up pouch packaging',['pack']),
cmd('Packaging','/bottlepack','Bottle Packaging','Bottle label system respecting bottle geometry',['pack']),
cmd('Packaging','/jarpack','Jar Packaging','Jar/tub packaging preserving existing container geometry',['pack']),
cmd('Packaging','/canpack','Can Packaging','360-degree can packaging design',['pack']),
cmd('Packaging','/tubepack','Tube Packaging','Actual tube packaging design; not a social-media post',['pack']),
cmd('Packaging','/mockuppack','Packaging Mockup','Packaging-focused realistic presentation',['pack']),
cmd('Packaging','/dieline','Dieline Concept','Flat print-aware panel layout / information architecture',['pack']),
cmd('Packaging','/flavorvariants','Variant System','Master packaging system with differentiated variants',['pack']),
cmd('Packaging','/shelfpack','Shelf Presentation','Retail shelf lineup / range presentation',['pack'])
];

const CGI=[
cmd('CGI / 3D','/cgihero','Cinematic CGI Hero','Feature-advertising 3D hero scene',['hero']),
cmd('CGI / 3D','/floating3d','Floating Product 3D','Controlled levitation with believable contact shadows and depth',['hero']),
cmd('CGI / 3D','/studio3d','Sculptural Studio 3D','Premium art-directed studio with dimensional set pieces',['hero']),
cmd('CGI / 3D','/monolith3d','Monolith Hero 3D','Monumental architectural plinth / monolith composition',['hero']),
cmd('CGI / 3D','/infiniteroom3d','Infinite Room 3D','Seamless architectural infinity-room composition',['hero']),
cmd('CGI / 3D','/suspended3d','Suspended Frame 3D','Product framed by suspended dimensional structures',['hero']),
cmd('CGI / 3D','/macrohero3d','Macro Hero 3D','Extreme macro + full hero composition using visible product details',['hero']),
cmd('CGI / 3D','/tunnelhero3d','Tunnel Hero 3D','Product placed inside a dimensional light/architecture tunnel',['hero']),
cmd('CGI / 3D','/billboardcgi','Billboard Breakout','Product physically extends beyond a billboard frame',['ooh']),
cmd('CGI / 3D','/buildingcgi','Building Breakout','Product emerges from / interacts with architecture',['ooh']),
cmd('CGI / 3D','/anamorphiccgi','Anamorphic LED','Forced-perspective 3D screen illusion',['ooh']),
cmd('CGI / 3D','/oohcgi','Street OOH Takeover','City-scale real-world campaign activation',['ooh']),
cmd('CGI / 3D','/giantproduct','Giant Product','Massive grounded product installation with scale cues',['ooh']),
cmd('CGI / 3D','/busstopcgi','Bus Shelter CGI','Transit shelter activation with physical interaction',['ooh']),
cmd('CGI / 3D','/metrocgi','Metro / Station CGI','Metro environment takeover',['ooh']),
cmd('CGI / 3D','/mallcgi','Mall Atrium CGI','Large retail atrium installation',['ooh']),
cmd('CGI / 3D','/rooftopcgi','Rooftop Installation','Large-scale rooftop activation',['ooh']),
cmd('CGI / 3D','/storefrontcgi','Storefront Breakout','Product breaks through / transforms storefront space',['ooh']),
cmd('CGI / 3D','/portalcgi','Portal CGI','Product crossing a believable spatial portal',['ooh']),
cmd('CGI / 3D','/stadiumcgi','Stadium CGI','Arena-scale product installation / takeover',['ooh']),
cmd('CGI / 3D','/glass3d','Glass World 3D','Transparent, refractive glass environment around unchanged product',['materials']),
cmd('CGI / 3D','/chrome3d','Chrome World 3D','Reflective metallic set language',['materials']),
cmd('CGI / 3D','/hologram3d','Holographic 3D','Iridescent spectral environment / surfaces',['materials']),
cmd('CGI / 3D','/matte3d','Matte Sculptural 3D','Soft tactile matte set pieces',['materials']),
cmd('CGI / 3D','/acrylic3d','Acrylic 3D','Layered transparent acrylic forms and refractions',['materials']),
cmd('CGI / 3D','/liquidmetal3d','Liquid Metal World','Molten metallic environment without changing product geometry',['materials']),
cmd('CGI / 3D','/frostedglass3d','Frosted Glass 3D','Soft translucent architectural surfaces',['materials']),
cmd('CGI / 3D','/neon3d','Neon Spatial 3D','Luminous spatial light structures',['materials']),
cmd('CGI / 3D','/productexplosion','Product Energy Explosion','Dynamic elements burst around an intact unchanged product',['effects']),
cmd('CGI / 3D','/ingredientburst','Ingredient Burst 3D','Supplied ingredients orbit / burst in dimensional composition',['effects']),
cmd('CGI / 3D','/liquidsplash3d','Liquid Splash 3D','Physically believable premium fluid simulation',['effects']),
cmd('CGI / 3D','/energywave3d','Energy Wave 3D','Abstract dimensional energy field / wave',['effects']),
cmd('CGI / 3D','/icecgi','Ice / Frost CGI','Ice, frost, condensation and frozen atmosphere',['effects']),
cmd('CGI / 3D','/firecgi','Fire / Heat CGI','Controlled flame / heat interaction',['effects']),
cmd('CGI / 3D','/smokecgi','Smoke / Vapor CGI','Volumetric smoke/vapor scene',['effects']),
cmd('CGI / 3D','/particlecgi','Particle Field 3D','Branded particle field with depth',['effects']),
cmd('CGI / 3D','/ribbon3d','Ribbon Flow 3D','Sculptural ribbons flowing around the product',['effects']),
cmd('CGI / 3D','/gravitycgi','Zero Gravity CGI','Believable weightless product environment',['effects']),
cmd('CGI / 3D','/shockwave3d','Shockwave 3D','Radial energy / pressure-wave visual around product',['effects']),
cmd('CGI / 3D','/lighttrails3d','Light Trails 3D','Controlled cinematic light trails and motion energy',['effects']),
cmd('CGI / 3D','/exploded3d','Exploded View 3D','Separate only known/visible components; do not invent hidden internals',['technical']),
cmd('CGI / 3D','/blueprint3d','Blueprint 3D','Technical grid, linework and measured-looking visual language without fake specs',['technical']),
cmd('CGI / 3D','/wireframe3d','Wireframe Surround','Wireframe environment / supporting geometry around exact product',['technical']),
cmd('CGI / 3D','/hud3d','Holographic HUD 3D','Spatial technical HUD using supplied facts only',['technical']),
cmd('CGI / 3D','/macro3d','Macro Material 3D','Extreme visible surface/material study',['technical']),
cmd('CGI / 3D','/xray3d','X-Ray 3D','Transparent/internal view only when internal structure is supplied',['technical']),
cmd('CGI / 3D','/cutaway3d','Cutaway 3D','Sectional view only when source data/reference supports it',['technical']),
cmd('CGI / 3D','/productworld3d','Product Universe 3D','Immersive brand-specific world built around the product',['worlds']),
cmd('CGI / 3D','/factorycgi','Factory CGI','Industrial engineered environment',['worlds']),
cmd('CGI / 3D','/cosmiccgi','Cosmic CGI','Cinematic space-scale world',['worlds']),
cmd('CGI / 3D','/waterworldcgi','Water World CGI','Aquatic world with realistic optics / caustics',['worlds']),
cmd('CGI / 3D','/iceworldcgi','Ice World CGI','Sculptural frozen landscape',['worlds']),
cmd('CGI / 3D','/desertcgi','Desert / Stone CGI','Monumental terrain / stone environment',['worlds']),
cmd('CGI / 3D','/botanicalcgi','Botanical CGI','Premium plant/nature world when category-appropriate',['worlds']),
cmd('CGI / 3D','/futuristiccgi','Futuristic Architecture','Advanced architectural product world',['worlds']),
cmd('CGI / 3D','/cybertunnelcgi','Cyber Tunnel','High-tech tunnel environment without generic clutter',['worlds']),
cmd('CGI / 3D','/luxurygallery3d','Luxury Gallery 3D','Museum/gallery-style premium spatial environment',['worlds']),
cmd('CGI / 3D','/sportsarena3d','Sports Arena 3D','Performance-focused arena / training environment',['worlds']),
cmd('CGI / 3D','/urbanroof3d','Urban Rooftop 3D','Cinematic city rooftop campaign world',['worlds']),
cmd('CGI / 3D','/typography3d','3D Typography','Dimensional typography integrated around unchanged product',['social3d']),
cmd('CGI / 3D','/editorial3d','Editorial 3D','Magazine-style dimensional campaign layout',['social3d']),
cmd('CGI / 3D','/launch3d','3D Launch Creative','Launch/reveal social creative with dimensional design',['social3d']),
cmd('CGI / 3D','/offer3d','3D Offer Creative','Premium promotional layout with 3D system',['social3d']),
cmd('CGI / 3D','/infographic3d','3D Infographic','Dimensional visual system with supplied facts only',['social3d']),
cmd('CGI / 3D','/minimal3d','Minimal 3D Poster','Clean negative-space 3D campaign',['social3d']),
cmd('CGI / 3D','/maximal3d','Maximal 3D Poster','Layered, energetic dimensional social campaign',['social3d']),
cmd('CGI / 3D','/framebreak3d','Frame Break Poster 3D','Product breaks graphic frame while preserving exact geometry',['social3d'])
];

const UTIL=[
cmd('Edit','/edit','General Edit','Perform the requested image edit while preserving unspecified details',['edit']),
cmd('Edit','/background','Change Background','Replace/rebuild background; keep product/subject exact',['edit']),
cmd('Fix / Enhance','/restore','Restore','Repair damage/noise while preserving identity and geometry',['fix']),
cmd('Fix / Enhance','/upscale','Upscale / Enhance','Increase clarity/detail without redesigning product/face',['fix']),
cmd('Identity / Face','/facelock','Face Lock','Strict identity preservation from uploaded face references',['identity']),
cmd('Identity / Face','/expressionlock','Expression Lock','Preserve reference expression unless changed explicitly',['identity']),
cmd('Identity / Face','/characterlock','Character Lock','Cross-shot character continuity',['identity']),
cmd('Camera','/camera','Camera Director','Choose realistic camera movement suited to subject',['video']),
cmd('Video / UGC','/video','Video Director','Production-ready video direction with continuity',['video']),
cmd('References','/pinterest','Pinterest Benchmark','Research 6–12 relevant references and synthesize a stronger original direction',['reference'])
];

const LOCAL=[...CREATE,...PACK,...CGI,...UTIL];
const FALL={syncSeconds:30,baseRules:`OUTPUT MODE PRIORITY: selected preset/category defines the deliverable. ${productLock} ${noInvent} ${multiAsset}`,packagingRules:`PACKAGING MODE: output the packaging/label/form-factor itself, not a social post unless explicitly requested. Preserve existing physical product/container geometry unless the user explicitly selects a different physical form factor or explicitly asks for a structural redesign. Use print-aware hierarchy, safe margins, seams/curvature, panel logic and shelf readability.`,cgi3dRules:`CGI / 3D MODE: 3D is a broad design library, not one repeated floating-product template. Match the selected preset and sub-style. Preserve product geometry exactly. Use believable scale, lighting, contact, materials, shadows, perspective and environmental interaction. OOH concepts must feel physically plausible. Technical views must never invent unseen internals.`};

let C=getJSON(K.commands,LOCAL),R={...FALL,...getJSON(K.runtime,{})},B=getJSON(K.brands,{brands:{}}).brands||{},project='',autoBrand='',status='Cached',busy=false,lastSync=0,latest=V;
let host,sh,menu,badge,editor,items=[],selected=0,mode='Library',category='All',query='',sub='All';
let format=getStr(K.format,'Auto'),layout=getStr(K.layout,'Adapt'),platform=getStr(K.platform,'Auto');

const requestJSON=u=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:u+'?t='+Date.now(),timeout:10000,onload:r=>{try{if(r.status<200||r.status>=300)throw new Error();ok(JSON.parse(r.responseText))}catch(e){no(e)}},onerror:no,ontimeout:no}));
const requestText=u=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:u+'?t='+Date.now(),timeout:10000,onload:r=>r.status>=200&&r.status<300?ok(r.responseText):no(),onerror:no,ontimeout:no}));
function mergeRemote(remote){const m=new Map();(Array.isArray(remote?.commands)?remote.commands:[]).forEach(x=>x?.cmd&&m.set(x.cmd,x));LOCAL.forEach(x=>m.set(x.cmd,{...(m.get(x.cmd)||{}),...x}));return[...m.values()]}
async function sync(force=false){if(busy)return;if(!force&&Date.now()-lastSync<10000)return;busy=true;status='Syncing';ui();try{const [c,r,b]=await Promise.all([requestJSON(URL.commands),requestJSON(URL.runtime),requestJSON(URL.brands)]);C=mergeRemote(c);R={...FALL,...r};B=b?.brands||{};setJSON(K.commands,C);setJSON(K.runtime,R);setJSON(K.brands,{brands:B});lastSync=Date.now();status='Live';detectProject();if(menu?.classList.contains('show'))render(query,false,true)}catch{status='Offline';ui()}finally{busy=false}}
async function checkVersion(){try{const t=await requestText(URL.self);const v=(t.match(/@version\s+([0-9.]+)/)||[])[1];if(v)latest=v;ui()}catch{}}

const norm=s=>String(s||'').toLowerCase().replace(/[_\-–—|/]+/g,' ').replace(/[^\p{L}\p{N}. ]/gu,' ').replace(/\s+/g,' ').trim();
function detectProject(){let hits=[];document.querySelectorAll('[aria-current="page"],a[href*="/g/g-p-"],a[href*="/project"],a[href*="/projects"]')?.forEach(e=>{const t=(e.innerText||e.textContent||e.getAttribute('aria-label')||'').trim();if(t&&t.length<180)hits.push(t)});project=hits[0]||'';autoBrand='';for(const [name,p] of Object.entries(B)){const aliases=[name,...(p.aliases||[])].map(norm);if(hits.some(t=>aliases.some(a=>a&&norm(t).includes(a)))){autoBrand=name;break}}ui()}
const manualBrand=()=>getStr(K.brand,''),activeBrand=()=>autoBrand||manualBrand();
function brandContext(){detectProject();const a=activeBrand(),p=B[a];if(a&&p)return `BRAND: ${a}. CATEGORY: ${p.type||''}. TONE: ${(p.tone||[]).join(', ')}. STYLE: ${(p.style||[]).join(', ')}. PREFERRED: ${(p.preferred||[]).join(', ')}. AVOID: ${(p.avoid||[]).join(', ')}.`;if(project)return `CURRENT CHATGPT PROJECT: ${project}. Infer brand/category from current project context and uploaded references, but prioritize the user's explicit brief and uploaded references over an unrelated project title.`;return 'Infer brand/category from the current brief and uploaded references.'}

function formatRule(x){if(x.category==='Packaging')return'';const map={'4:5':'4:5 portrait (1080×1350)','1:1':'1:1 square','9:16':'9:16 vertical story/reel','16:9':'16:9 wide banner/video','A4':'A4 print page'};const plat=platform==='Auto'?'':`TARGET PLATFORM: ${platform}.`;if(format==='Auto')return plat;return `${plat} SELECTED FORMAT: ${map[format]||format}. Preset/style and ratio are independent. ${layout==='Adapt'?'Intelligently recompose the same concept for this ratio; do not stretch or blindly crop.':'Keep the preset native composition feel as much as possible while fitting this ratio.'}`}
function routedRules(x){const base=R.baseRules||FALL.baseRules;if(x.category==='Packaging')return `${R.packagingRules||FALL.packagingRules} ${base}`;if(x.category==='CGI / 3D')return `${R.cgi3dRules||FALL.cgi3dRules} ${base}`;if(x.category==='Edit')return `${R.editRules||''} ${base}`;if(x.category==='Fix / Enhance')return `${R.fixRules||''} ${base}`;if(x.category==='Identity / Face')return `${R.identityRules||''} ${base}`;if(['Camera','Video / UGC','Video','UGC Video'].includes(x.category))return `${R.videoRules||''} ${base}`;return base}
function makePrompt(x){return `${brandContext()} PRESET: ${x.label}. ${x.prompt||x.desc||x.label}. ${formatRule(x)} ${routedRules(x)}`}

const CSS=`:host{all:initial}*{box-sizing:border-box}.shell{--ink:#171717;--muted:#737373;--line:#e7e7e7;--soft:#f7f7f8;--accent:#ef255f;--violet:#6d4aff;position:fixed;z-index:2147483647;right:14px;top:58px;bottom:68px;width:min(980px,calc(100vw - 290px));min-width:720px;display:none;flex-direction:column;overflow:hidden;background:#fff;color:var(--ink);border:1px solid #dcdcdc;border-radius:26px;box-shadow:0 30px 100px #0000002b,0 3px 12px #00000012;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.shell.show{display:flex;animation:open .14s ease-out}@keyframes open{from{opacity:.4;transform:translateY(5px) scale(.995)}to{opacity:1;transform:none}}.hero{padding:16px 17px 12px;background:linear-gradient(135deg,#fff 0%,#fff7fa 46%,#f7f5ff 100%);border-bottom:1px solid var(--line)}.heroTop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.brandMark{display:flex;align-items:center;gap:10px}.logo{width:38px;height:38px;border-radius:13px;background:linear-gradient(135deg,var(--accent),var(--violet));display:grid;place-items:center;color:#fff;font-size:11px;font-weight:900;box-shadow:0 8px 24px #d72b7b33}.title{font-size:17px;font-weight:850;letter-spacing:-.35px}.subtitle{font-size:10.5px;color:#777;margin-top:2px}.version{display:flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:#fff;border:1px solid #e8e8e8;font-size:9px;font-weight:800}.liveDot{width:7px;height:7px;border-radius:50%;background:#2dbf6e}.version.update{background:#fff2f5;color:#b80036;border-color:#ffd1dc;cursor:pointer}.project{margin-top:8px;display:flex;align-items:center;gap:7px;font-size:9.5px;font-weight:700;color:#9d174d}.lockrow{display:flex;gap:6px;flex-wrap:wrap;margin-top:11px}.lock{display:inline-flex;align-items:center;gap:5px;border:1px solid #e7e7e7;background:#fff;padding:6px 8px;border-radius:999px;font-size:9px;font-weight:800}.lock .ok{width:6px;height:6px;border-radius:50%;background:#26b36a}.searchRow{display:flex;gap:8px;padding:11px 14px 9px;border-bottom:1px solid var(--line)}.search{flex:1;height:42px;border:1px solid #e3e3e3;background:#f4f4f5;border-radius:14px;padding:0 13px;outline:0;font-size:12px;font-weight:600}.search:focus{background:#fff;border-color:#bdbdbd;box-shadow:0 0 0 3px #00000008}.nav{display:flex;gap:6px;overflow-x:auto;padding:0 14px 10px;border-bottom:1px solid var(--line)}.nav::-webkit-scrollbar{display:none}.navBtn{white-space:nowrap;border:0;background:#f2f2f3;color:#444;border-radius:11px;padding:8px 11px;font-size:10px;font-weight:800;cursor:pointer}.navBtn:hover{background:#e9e9eb}.navBtn.on{background:#171717;color:#fff}.navBtn.threed.on{background:linear-gradient(135deg,#6d4aff,#ef255f)}.controls{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:9px;padding:9px 14px;border-bottom:1px solid var(--line);background:#fcfcfc}.controlBox{min-width:0}.controlLabel{font-size:8px;font-weight:900;letter-spacing:.7px;color:#999;margin-bottom:5px}.chips{display:flex;gap:5px;flex-wrap:wrap}.chip{border:1px solid #e4e4e4;background:#fff;border-radius:999px;padding:6px 8px;font-size:9px;font-weight:800;color:#555;cursor:pointer}.chip.on{background:#171717;color:#fff;border-color:#171717}.subbar{display:none;gap:6px;overflow-x:auto;padding:9px 14px;border-bottom:1px solid var(--line);background:#faf9ff}.subbar.show{display:flex}.subbar::-webkit-scrollbar{display:none}.sub{white-space:nowrap;border:1px solid #e6e1ff;background:#fff;color:#5e48c9;border-radius:999px;padding:7px 10px;font-size:9px;font-weight:850;cursor:pointer}.sub.on{background:#6d4aff;color:#fff;border-color:#6d4aff}.content{flex:1;min-height:0;display:grid;grid-template-columns:170px 1fr}.side{overflow-y:auto;padding:10px 8px;border-right:1px solid var(--line);background:#fcfcfc}.sideTitle{font-size:8px;font-weight:900;letter-spacing:.8px;color:#aaa;padding:4px 8px 7px}.sideBtn{width:100%;border:0;background:transparent;color:#555;border-radius:11px;padding:9px 10px;text-align:left;font-size:10px;font-weight:750;cursor:pointer}.sideBtn:hover{background:#f0f0f1}.sideBtn.on{background:#171717;color:#fff}.main{overflow-y:auto;padding:12px}.sectionHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.sectionTitle{font-size:12px;font-weight:850}.count{font-size:9px;color:#888}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.card{position:relative;min-height:126px;padding:12px;border:1px solid #e7e7e7;background:linear-gradient(180deg,#fff,#fafafa);border-radius:18px;cursor:pointer;transition:.15s ease;overflow:hidden}.card:before{content:"";position:absolute;left:0;top:0;width:4px;height:100%;background:#ddd}.card[data-cat="CGI / 3D"]:before{background:linear-gradient(#6d4aff,#ef255f)}.card[data-cat="Packaging"]:before{background:#00a184}.card:hover{transform:translateY(-2px);box-shadow:0 12px 28px #00000010;border-color:#c9c9c9}.card.on{border-color:#171717;box-shadow:0 0 0 1px #171717}.cardTop{display:flex;justify-content:space-between;gap:8px}.command{display:inline-flex;max-width:78%;padding:4px 7px;border-radius:999px;background:#f2f2f3;color:#555;font:750 9px ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fav{width:25px;height:25px;border:0;border-radius:50%;background:#f3f3f3;color:#aaa;cursor:pointer;font-size:13px}.fav.on{background:#fff0b8;color:#b97d00}.cardName{font-size:12.5px;font-weight:850;line-height:1.15;margin-top:13px}.cardDesc{font-size:10px;line-height:1.35;color:#777;margin-top:5px}.tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:10px}.tag{font-size:8px;font-weight:800;color:#777;background:#f0f0f1;padding:4px 6px;border-radius:999px}.empty{padding:30px;text-align:center;color:#999;font-size:11px}.footer{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border-top:1px solid var(--line);font-size:9px;color:#8b8b8b;background:#fff}.footRight{display:flex;gap:6px}.footBtn{border:0;border-radius:999px;background:#f0f0f1;padding:7px 10px;font-size:9px;font-weight:800;cursor:pointer}.badge{position:fixed;right:18px;bottom:88px;z-index:2147483647;display:flex;align-items:center;gap:7px;background:#fff;border:1px solid #ddd;border-radius:999px;padding:9px 12px;box-shadow:0 10px 30px #0002;font:800 10px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.badgeDot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#6d4aff,#ef255f)}.shell.show+.badge{display:none}@media(max-width:1120px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.shell{right:8px;width:calc(100vw - 16px);min-width:0}}@media(max-width:760px){.content{grid-template-columns:122px 1fr}.grid{grid-template-columns:1fr}.controls{grid-template-columns:1fr}.shell{top:52px;bottom:68px;border-radius:18px}.hero{padding:12px}.lockrow{display:none}.main{padding:9px}}`;

function make(){if(menu)return;host=document.createElement('div');document.documentElement.appendChild(host);sh=host.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=CSS;sh.appendChild(style);menu=document.createElement('div');menu.className='shell';menu.innerHTML=`<div class="hero"><div class="heroTop"><div class="brandMark"><div class="logo">CL</div><div><div class="title">Creative Library Pro</div><div class="subtitle">3D Studio • Packaging • Creative • Video • Edit</div></div></div><div class="version"><span class="liveDot"></span><span class="vtxt">v${V}</span></div></div><div class="project"></div><div class="lockrow"><span class="lock"><span class="ok"></span>PRODUCT LOCK</span><span class="lock"><span class="ok"></span>NO MORPH</span><span class="lock"><span class="ok"></span>NO COLLAGE</span><span class="lock"><span class="ok"></span>STABLE UPDATE CHANNEL</span></div></div><div class="searchRow"><input class="search" placeholder="Search: anamorphic, chrome 3D, liquid splash, tube packaging…"></div><div class="nav"></div><div class="controls"><div class="controlBox"><div class="controlLabel">PLATFORM</div><div class="chips platform"></div></div><div class="controlBox"><div class="controlLabel">FORMAT</div><div class="chips format"></div></div><div class="controlBox"><div class="controlLabel">LAYOUT</div><div class="chips layout"></div></div></div><div class="subbar"></div><div class="content"><div class="side"></div><div class="main"><div class="sectionHead"><div class="sectionTitle"></div><div class="count"></div></div><div class="grid"></div></div></div><div class="footer"><span class="footStatus">Creative Library Pro • v${V}</span><div class="footRight"><button class="footBtn favorites">★ Favorites</button><button class="footBtn recent">Recent</button><button class="footBtn sync">Sync now</button></div></div>`;sh.appendChild(menu);badge=document.createElement('div');badge.className='badge';badge.innerHTML='<span class="badgeDot"></span><span>Creative Library Pro</span>';badge.onclick=()=>{editor=editor||document.querySelector('textarea')||document.querySelector('[contenteditable="true"]');render('',true)};sh.appendChild(badge);menu.querySelector('.search').addEventListener('input',e=>{query=e.target.value||'';selected=0;render(query,false,true)});menu.querySelector('.sync').onclick=()=>{sync(true);checkVersion()};menu.querySelector('.favorites').onclick=()=>{mode='Favorites';category='All';sub='All';render('',false)};menu.querySelector('.recent').onclick=()=>{mode='Recent';category='All';sub='All';render('',false)};menu.querySelector('.version').onclick=()=>{if(latest!==V)window.open(URL.self+'?install='+latest,'_blank')};ui()}

function ui(){if(!menu)return;const p=menu.querySelector('.project'),v=menu.querySelector('.version'),vt=menu.querySelector('.vtxt'),foot=menu.querySelector('.footStatus');p.textContent=autoBrand?`✓ ${autoBrand} • AUTO PROJECT`:project?`✓ Project: ${project}`:manualBrand()?`✓ ${manualBrand()} • MANUAL BRAND`:'Project/Brand not detected';vt.textContent=latest!==V?`Update ${latest}`:`v${V}`;v.classList.toggle('update',latest!==V);foot.textContent=`${status} • Runtime ${R.runtimeVersion||'cached'} • v${V}`}
function navRender(){const e=menu.querySelector('.nav');e.innerHTML='';[['Library','Library'],['3D Studio','3D Studio'],['Packaging','Packaging'],['Social','Social'],['Edit','Edit / Fix'],['Video','Video'],['Identity','Identity'],['Favorites','★ Favorites'],['Recent','Recent']].forEach(([m,l])=>{const b=document.createElement('button');b.className='navBtn'+(mode===m?' on':'')+(m==='3D Studio'?' threed':'');b.textContent=l;b.onclick=()=>{mode=m;category='All';sub='All';query='';menu.querySelector('.search').value='';render('',false,true)};e.appendChild(b)})}
function chipRender(){const build=(sel,vals,cls,setter)=>{const e=menu.querySelector('.'+cls);e.innerHTML='';vals.forEach(v=>{const b=document.createElement('button');b.className='chip'+(sel===v?' on':'');b.textContent=v;b.onclick=()=>{setter(v);render(query,false,true)};e.appendChild(b)})};build(platform,['Auto','Instagram','LinkedIn','Story','Banner','Print'],'platform',v=>{platform=v;setStr(K.platform,v)});build(format,['Auto','4:5','1:1','9:16','16:9','A4'],'format',v=>{format=v;setStr(K.format,v)});build(layout,['Adapt','Native'],'layout',v=>{layout=v;setStr(K.layout,v)})}
function subRender(){const e=menu.querySelector('.subbar');if(mode!=='3D Studio'){e.classList.remove('show');e.innerHTML='';return}e.classList.add('show');e.innerHTML='';[['All','All'],['Hero','hero'],['OOH / Breakout','ooh'],['Materials','materials'],['Effects','effects'],['Technical','technical'],['Worlds','worlds'],['Social 3D','social3d']].forEach(([l,v])=>{const b=document.createElement('button');b.className='sub'+(sub===v?' on':'');b.textContent=l;b.onclick=()=>{sub=v;category='All';render(query,false,true)};e.appendChild(b)})}
function baseFiltered(){let a=[...C];if(mode==='3D Studio')a=a.filter(x=>x.category==='CGI / 3D');else if(mode==='Packaging')a=a.filter(x=>x.category==='Packaging');else if(mode==='Social')a=a.filter(x=>['Create','Product Ads','Social','LinkedIn','Info','Campaign'].includes(x.category));else if(mode==='Edit')a=a.filter(x=>['Edit','Fix / Enhance'].includes(x.category));else if(mode==='Video')a=a.filter(x=>['Camera','Video / UGC','Video','UGC Video'].includes(x.category));else if(mode==='Identity')a=a.filter(x=>x.category==='Identity / Face');else if(mode==='Favorites'){const fav=getJSON(K.favorites,[]);a=a.filter(x=>fav.includes(x.cmd))}else if(mode==='Recent'){const rec=getJSON(K.recent,[]);a=rec.map(c=>C.find(x=>x.cmd===c)).filter(Boolean)}else if(mode==='Library')a=a.filter(x=>!['Camera','Video / UGC','Video','UGC Video','Identity / Face'].includes(x.category));if(mode==='3D Studio'&&sub!=='All')a=a.filter(x=>(x.tags||[]).includes(sub));if(category!=='All')a=a.filter(x=>x.category===category);if(query){const q=query.toLowerCase();a=a.filter(x=>[x.cmd,x.label,x.desc,...(x.tags||[])].join(' ').toLowerCase().includes(q))}return a}
function sideRender(a){const e=menu.querySelector('.side');e.innerHTML='<div class="sideTitle">CATEGORIES</div>';const cats=[...new Set(a.map(x=>x.category))];['All',...cats].forEach(v=>{const b=document.createElement('button');b.className='sideBtn'+(category===v?' on':'');b.textContent=v;b.onclick=()=>{category=v;render(query,false,true)};e.appendChild(b)})}
function favorites(){return getJSON(K.favorites,[])}
function toggleFav(c){let f=favorites();f=f.includes(c)?f.filter(x=>x!==c):[c,...f];setJSON(K.favorites,f.slice(0,80));render(query,false,true)}
function addRecent(c){let r=getJSON(K.recent,[]);r=[c,...r.filter(x=>x!==c)].slice(0,20);setJSON(K.recent,r)}
function render(q='',doSync=true,keep=false){make();if(doSync){sync();checkVersion()}detectProject();query=q;if(!keep)menu.querySelector('.search').value=q;navRender();chipRender();subRender();const pre=baseFiltered();sideRender(pre);items=baseFiltered().slice(0,220);selected=Math.min(selected,Math.max(0,items.length-1));menu.querySelector('.sectionTitle').textContent=mode==='3D Studio'?(sub==='All'?'3D Studio — All Styles':`3D Studio — ${sub.toUpperCase()}`):mode;menu.querySelector('.count').textContent=`${items.length} presets`;const grid=menu.querySelector('.grid');grid.innerHTML='';const fav=favorites();items.forEach((x,i)=>{const d=document.createElement('div');d.className='card'+(i===selected?' on':'');d.dataset.cat=x.category;d.innerHTML='<div class="cardTop"><div class="command"></div><button class="fav">★</button></div><div class="cardName"></div><div class="cardDesc"></div><div class="tags"></div>';d.querySelector('.command').textContent=x.cmd;d.querySelector('.cardName').textContent=x.label;d.querySelector('.cardDesc').textContent=x.desc||'';const fb=d.querySelector('.fav');fb.classList.toggle('on',fav.includes(x.cmd));fb.onclick=e=>{e.stopPropagation();toggleFav(x.cmd)};const te=d.querySelector('.tags');(x.tags||[]).slice(0,3).forEach(t=>{const s=document.createElement('span');s.className='tag';s.textContent=t;te.appendChild(s)});d.onclick=()=>choose(x);grid.appendChild(d)});if(!items.length)grid.innerHTML='<div class="empty">No presets found. Try All or clear search.</div>';menu.classList.add('show');ui()}

const isEditor=e=>!!e&&(e.tagName==='TEXTAREA'||e.isContentEditable||e.closest?.('[contenteditable="true"]'));
const getEditor=e=>e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]'));
const readText=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function writeText(e,t){if(!e)return;if(e.tagName==='TEXTAREA'){const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();return}e.focus();const r=document.createRange(),g=getSelection();r.selectNodeContents(e);g.removeAllRanges();g.addRange(r);let ok=false;try{ok=document.execCommand('insertText',false,t)}catch{}if(!ok){e.textContent=t;e.dispatchEvent(new InputEvent('input',{bubbles:true,data:t}))}}
function choose(x){addRecent(x.cmd);const t=readText(editor),out=makePrompt(x);writeText(editor,t.replace(/(?:^|\n)\/[\w-]*$/,m=>(m.startsWith('\n')?'\n':'')+out));menu.classList.remove('show')}
const slash=t=>{const m=String(t).match(/(?:^|\n)\/([\w-]*)$/);return m?m[1]:null};

document.addEventListener('input',e=>{if(!isEditor(e.target))return;editor=getEditor(e.target);const z=slash(readText(editor));if(z===null){menu?.classList.remove('show');return}sync();const s=z.toLowerCase();if(!s)mode='Library';else if(/(cgi|3d|billboard|anamorphic|ooh|chrome|glass|splash|ice|fire|hologram|world)/.test(s))mode='3D Studio';else if(/(pack|label|tube|pouch|bottle|jar|can|dieline)/.test(s))mode='Packaging';else if(/(video|camera|motion|transition|gimbal|orbit|pan)/.test(s))mode='Video';else if(/(face|identity|character|expression)/.test(s))mode='Identity';else mode='Library';category='All';sub='All';render(z,false)},true);
document.addEventListener('keydown',e=>{if(!menu?.classList.contains('show')||!isEditor(e.target))return;if(e.key==='ArrowDown'){e.preventDefault();selected=(selected+1)%Math.max(1,items.length);render(query,false,true)}else if(e.key==='ArrowUp'){e.preventDefault();selected=(selected-1+Math.max(1,items.length))%Math.max(1,items.length);render(query,false,true)}else if(e.key==='Enter'&&!e.shiftKey&&items.length){e.preventDefault();e.stopPropagation();choose(items[selected])}else if(e.key==='Escape')menu.classList.remove('show')},true);
addEventListener('focus',()=>{sync(true);checkVersion();detectProject()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);checkVersion();detectProject()}});new MutationObserver(()=>detectProject()).observe(document.documentElement,{subtree:true,childList:true});make();sync(true);checkVersion();setInterval(()=>sync(true),30000);setInterval(checkVersion,300000);
})();
