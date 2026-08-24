// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      7.6.0
// @description  Virag Creative OS: adaptive creative library with 3D Studio, product lock, anti-repetition engine, format/quality controls and live sync.
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

const V='7.6.0';
const BASE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const URL={commands:BASE+'commands.json',runtime:BASE+'runtime.json',brands:BASE+'brands.json'};
const K={
  commands:'virag760.commands',runtime:'virag760.runtime',brands:'virag760.brands',
  brand:'virag.brand',format:'virag.format',layout:'virag.layout',platform:'virag.platform',
  quality:'virag.quality',favorites:'virag.favorites',recent:'virag.recent',diversity:'virag.diversity'
};
const gj=(k,d)=>{try{const v=GM_getValue(k,'');return v?JSON.parse(v):d}catch{return d}};
const sj=(k,v)=>{try{GM_setValue(k,JSON.stringify(v))}catch{}};
const gs=(k,d='')=>{try{return String(GM_getValue(k,d)||d)}catch{return d}};
const ss=(k,v)=>{try{GM_setValue(k,String(v||''))}catch{}};

const PRODUCT_LOCK=`PRODUCT GEOMETRY LOCK — NON-NEGOTIABLE: when a product reference is provided, treat it as an immutable master reference. Preserve the exact visible silhouette, height-to-width ratio, proportions, container geometry, cap/lid/neck/shoulder/base, corners, curvature, openings/handles, label dimensions and position, logo/artwork placement, colors, materials and distinctive visible details. Do not stretch, squash, slim, widen, shorten, elongate, taper, reshape, substitute, simplify, stylize or morph the product. Camera perspective may change apparent screen size, but the underlying geometry must remain unchanged. If exact inch/mm accuracy is required, use supplied dimensions/CAD/3D data and never guess hidden measurements from a photo.`;
const NO_INVENT=`Do not invent claims, prices, certifications, nutrition facts, ingredients, technical specs, legal/regulatory copy or hidden internals. Use supplied facts and uploaded references as source-of-truth.`;
const MULTI=`If N separate assets are requested, deliver exactly N separate standalone assets; never make a collage/contact sheet unless explicitly requested.`;

const command=(category,cmd,label,desc,tags=[],prompt='')=>({category,cmd,label,desc,tags,prompt:prompt||`Create a ${label} direction: ${desc}.`});

const BASE_COMMANDS=[
 command('Create','/creative','Fresh Creative','Agency-level social creative with a fresh composition and art direction',['creative']),
 command('Create','/clean','Clean Minimal','Bright low-content premium creative with disciplined negative space',['creative','minimal']),
 command('Create','/bold','Bold Campaign','High-impact campaign with expressive type and strong graphic blocks',['creative','bold']),
 command('Create','/editorial','Editorial','Magazine-inspired art direction and refined grid',['creative','editorial']),
 command('Create','/poster','Poster','Campaign poster with a strong visual hook and designed hierarchy',['creative','poster']),
 command('Create','/banner','Banner / Hero','Campaign hero/banner composition; ratio is controlled separately',['creative','banner']),
 command('Product Ads','/productad','Premium Product Ad','Designed product advertisement, not a catalogue photo',['product']),
 command('Product Ads','/ingredient','Ingredient World','Ingredient/flavour-led world using supplied ingredients only',['product']),
 command('Product Ads','/technical','Technical Performance','Structured performance/science poster using supplied facts only',['product']),
 command('Packaging','/packaging','Packaging Design','Create or redesign the actual packaging itself',['pack']),
 command('Packaging','/labeldesign','Label Design','Print-aware label system with shelf hierarchy',['pack']),
 command('Packaging','/labelredesign','Label Redesign','Upgrade existing label while preserving required facts',['pack']),
 command('Packaging','/frontlabel','Front Label','Principal display panel only',['pack']),
 command('Packaging','/backlabel','Back Label','Structured back/information panel',['pack']),
 command('Packaging','/fullwrap','Full Wrap','360-degree label with seam-aware continuity',['pack']),
 command('Packaging','/boxpack','Box Packaging','Carton with front, side and back panel logic',['pack']),
 command('Packaging','/pouchpack','Pouch Packaging','Stand-up pouch packaging',['pack']),
 command('Packaging','/bottlepack','Bottle Packaging','Bottle label system respecting bottle geometry',['pack']),
 command('Packaging','/jarpack','Jar Packaging','Jar/tub packaging preserving container geometry',['pack']),
 command('Packaging','/canpack','Can Packaging','360-degree can packaging design',['pack']),
 command('Packaging','/tubepack','Tube Packaging','Actual tube packaging; not a social-media post',['pack']),
 command('Packaging','/mockuppack','Packaging Mockup','Packaging-focused realistic presentation',['pack']),
 command('Packaging','/dieline','Dieline Concept','Flat print-aware panel layout',['pack']),
 command('Packaging','/flavorvariants','Variant System','Master packaging system with differentiated variants',['pack']),
 command('Packaging','/shelfpack','Shelf Presentation','Retail shelf lineup / range presentation',['pack']),
 command('Edit','/edit','General Edit','Perform only the requested edit while preserving unspecified details',['edit']),
 command('Fix / Enhance','/restore','Restore','Repair/noise cleanup while preserving identity and geometry',['fix']),
 command('Fix / Enhance','/upscale','Upscale / Enhance','Increase clarity without redesigning product/face',['fix']),
 command('Identity / Face','/facelock','Face Lock','Strict identity preservation from supplied face references',['identity']),
 command('Identity / Face','/expressionlock','Expression Lock','Preserve reference expression unless explicitly changed',['identity']),
 command('Identity / Face','/characterlock','Character Lock','Cross-shot character continuity',['identity']),
 command('Camera','/camera','Camera Director','Realistic camera direction suited to the subject',['video']),
 command('Video / UGC','/video','Video Director','Production-ready video direction with continuity',['video']),
 command('References','/pinterest','Pinterest Benchmark','Research strong relevant references and synthesize a better original direction',['reference'])
];

const CGI=[
 ['hero','/cgihero','Cinematic CGI Hero','Feature-advertising 3D hero scene'],
 ['hero','/floating3d','Floating Product 3D','Controlled levitation with believable contact and depth'],
 ['hero','/studio3d','Sculptural Studio 3D','Premium art-directed studio with dimensional set pieces'],
 ['hero','/monolith3d','Monolith Hero 3D','Monumental architectural plinth / monolith composition'],
 ['hero','/infiniteroom3d','Infinite Room 3D','Seamless architectural infinity-room composition'],
 ['hero','/suspended3d','Suspended Frame 3D','Product framed by suspended dimensional structures'],
 ['hero','/macrohero3d','Macro Hero 3D','Extreme macro plus full hero composition using visible details'],
 ['hero','/tunnelhero3d','Tunnel Hero 3D','Dimensional light/architecture tunnel composition'],
 ['ooh','/billboardcgi','Billboard Breakout','Product physically extends beyond a billboard frame'],
 ['ooh','/buildingcgi','Building Breakout','Product emerges from or interacts with architecture'],
 ['ooh','/anamorphiccgi','Anamorphic LED','Forced-perspective 3D screen illusion'],
 ['ooh','/oohcgi','Street OOH Takeover','City-scale real-world campaign activation'],
 ['ooh','/giantproduct','Giant Product','Massive grounded product installation with scale cues'],
 ['ooh','/busstopcgi','Bus Shelter CGI','Transit shelter activation with physical interaction'],
 ['ooh','/metrocgi','Metro / Station CGI','Metro environment takeover'],
 ['ooh','/mallcgi','Mall Atrium CGI','Large retail atrium installation'],
 ['ooh','/rooftopcgi','Rooftop Installation','Large-scale rooftop activation'],
 ['ooh','/storefrontcgi','Storefront Breakout','Product transforms storefront space'],
 ['ooh','/portalcgi','Portal CGI','Product crossing a believable spatial portal'],
 ['ooh','/stadiumcgi','Stadium CGI','Arena-scale product installation / takeover'],
 ['materials','/glass3d','Glass World 3D','Transparent refractive glass environment'],
 ['materials','/chrome3d','Chrome World 3D','Reflective metallic set language'],
 ['materials','/hologram3d','Holographic 3D','Iridescent spectral environment / surfaces'],
 ['materials','/matte3d','Matte Sculptural 3D','Soft tactile matte set pieces'],
 ['materials','/acrylic3d','Acrylic 3D','Layered transparent acrylic forms and refractions'],
 ['materials','/liquidmetal3d','Liquid Metal World','Molten metallic environment without changing product'],
 ['materials','/frostedglass3d','Frosted Glass 3D','Soft translucent architectural surfaces'],
 ['materials','/neon3d','Neon Spatial 3D','Luminous spatial light structures'],
 ['effects','/productexplosion','Product Energy Explosion','Dynamic elements burst around intact product'],
 ['effects','/ingredientburst','Ingredient Burst 3D','Supplied ingredients orbit/burst in dimensional composition'],
 ['effects','/liquidsplash3d','Liquid Splash 3D','Physically believable premium fluid simulation'],
 ['effects','/energywave3d','Energy Wave 3D','Abstract dimensional energy wave'],
 ['effects','/icecgi','Ice / Frost CGI','Ice, frost, condensation and frozen atmosphere'],
 ['effects','/firecgi','Fire / Heat CGI','Controlled flame / heat interaction'],
 ['effects','/smokecgi','Smoke / Vapor CGI','Volumetric smoke/vapor scene'],
 ['effects','/particlecgi','Particle Field 3D','Branded particle field with depth'],
 ['effects','/ribbon3d','Ribbon Flow 3D','Sculptural ribbons flowing around product'],
 ['effects','/gravitycgi','Zero Gravity CGI','Believable weightless environment'],
 ['effects','/shockwave3d','Shockwave 3D','Radial energy / pressure-wave visual'],
 ['effects','/lighttrails3d','Light Trails 3D','Controlled cinematic light trails'],
 ['technical','/exploded3d','Exploded View 3D','Separate only known/visible components; no invented internals'],
 ['technical','/blueprint3d','Blueprint 3D','Technical grid/linework without fake specs'],
 ['technical','/wireframe3d','Wireframe Surround','Wireframe supporting geometry around exact product'],
 ['technical','/hud3d','Holographic HUD 3D','Spatial technical HUD using supplied facts only'],
 ['technical','/macro3d','Macro Material 3D','Extreme visible surface/material study'],
 ['technical','/xray3d','X-Ray 3D','Transparent/internal view only when internal structure is supplied'],
 ['technical','/cutaway3d','Cutaway 3D','Sectional view only when source data supports it'],
 ['worlds','/productworld3d','Product Universe 3D','Immersive brand-specific world built around product'],
 ['worlds','/factorycgi','Factory CGI','Industrial engineered environment'],
 ['worlds','/cosmiccgi','Cosmic CGI','Cinematic space-scale world'],
 ['worlds','/waterworldcgi','Water World CGI','Aquatic world with realistic optics/caustics'],
 ['worlds','/iceworldcgi','Ice World CGI','Sculptural frozen landscape'],
 ['worlds','/desertcgi','Desert / Stone CGI','Monumental terrain / stone environment'],
 ['worlds','/botanicalcgi','Botanical CGI','Premium plant/nature world when category-appropriate'],
 ['worlds','/futuristiccgi','Futuristic Architecture','Advanced architectural product world'],
 ['worlds','/cybertunnelcgi','Cyber Tunnel','High-tech tunnel environment without generic clutter'],
 ['worlds','/luxurygallery3d','Luxury Gallery 3D','Museum/gallery-style premium spatial environment'],
 ['worlds','/sportsarena3d','Sports Arena 3D','Performance-focused arena / training environment'],
 ['social3d','/typography3d','3D Typography','Dimensional typography integrated around product'],
 ['social3d','/editorial3d','Editorial 3D','Magazine-style dimensional campaign layout'],
 ['social3d','/launch3d','3D Launch Creative','Launch/reveal social creative with dimensional design'],
 ['social3d','/offer3d','3D Offer Creative','Premium promotional layout with 3D system'],
 ['social3d','/infographic3d','3D Infographic','Dimensional visual system with supplied facts only'],
 ['social3d','/minimal3d','Minimal 3D Poster','Clean negative-space 3D campaign'],
 ['social3d','/maximal3d','Maximal 3D Poster','Layered energetic dimensional campaign'],
 ['social3d','/framebreak3d','Frame Break Poster 3D','Product breaks graphic frame while preserving geometry']
].map(([tag,c,l,d])=>command('CGI / 3D',c,l,d,[tag,'3d']));

const LOCAL=[...BASE_COMMANDS,...CGI];
const FALL={
 syncSeconds:30,
 baseRules:`OUTPUT MODE PRIORITY: selected preset/category defines the deliverable. ${PRODUCT_LOCK} ${NO_INVENT} ${MULTI}`,
 packagingRules:'PACKAGING MODE: output the packaging/label/form-factor itself, not a social post unless explicitly requested. Preserve existing physical product/container geometry unless a different physical form factor is explicitly requested. Use print-aware hierarchy, safe margins, seams/curvature, panel logic and shelf readability.',
 cgi3dRules:'CGI / 3D MODE: match the selected 3D technique while preserving exact product geometry. Use believable scale, lighting, contact, materials, shadows, perspective and environmental interaction. OOH concepts must feel physically plausible. Technical views must never invent unseen internals.',
 diversityRules:'ANTI-REPETITION ENGINE: every new generation must materially differ from recent outputs. Same preset means same technique/category, not same layout. Change at least 7 major design decisions whenever practical. Never return the same design with only color/background changes.'
};

let C=gj(K.commands,LOCAL),R={...FALL,...gj(K.runtime,{})},B=gj(K.brands,{brands:{}}).brands||{};
let project='',autoBrand='',status='Cached',busy=false,last=0;
let host,sh,menu,badge,editor,items=[],sel=0,mode='Library',category='All',query='',sub='All';
let format=gs(K.format,'Auto'),layout=gs(K.layout,'Adapt'),platform=gs(K.platform,'Auto'),quality=gs(K.quality,'Auto');

const req=u=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:u+'?t='+Date.now(),timeout:10000,onload:r=>{try{if(r.status<200||r.status>=300)throw 0;ok(JSON.parse(r.responseText))}catch(e){no(e)}},onerror:no,ontimeout:no}));
const merge=remote=>{const m=new Map();(remote?.commands||[]).forEach(x=>x?.cmd&&m.set(x.cmd,x));LOCAL.forEach(x=>m.set(x.cmd,{...(m.get(x.cmd)||{}),...x}));return[...m.values()]};
async function sync(force=false){if(busy)return;if(!force&&Date.now()-last<10000)return;busy=true;status='Syncing';ui();try{const[c,r,b]=await Promise.all([req(URL.commands),req(URL.runtime),req(URL.brands)]);C=merge(c);R={...FALL,...r};B=b?.brands||{};sj(K.commands,C);sj(K.runtime,R);sj(K.brands,{brands:B});last=Date.now();status=`Live • runtime ${R.runtimeVersion||'local'}`;detect();if(menu?.classList.contains('show'))render(query,false,true)}catch{status='Offline';ui()}finally{busy=false}}

const norm=s=>String(s||'').toLowerCase().replace(/[_\-–—|/]+/g,' ').replace(/[^\p{L}\p{N}. ]/gu,' ').replace(/\s+/g,' ').trim();
function detect(){let hits=[];document.querySelectorAll('[aria-current="page"],a[href*="/g/g-p-"],a[href*="/project"],a[href*="/projects"]').forEach(e=>{const t=(e.innerText||e.textContent||e.getAttribute('aria-label')||'').trim();if(t&&t.length<180)hits.push(t)});project=hits[0]||'';autoBrand='';for(const[name,p]of Object.entries(B)){const aliases=[name,...(p.aliases||[])].map(norm);if(hits.some(t=>aliases.some(a=>a&&norm(t).includes(a)))){autoBrand=name;break}}ui()}
const activeBrand=()=>autoBrand||gs(K.brand,'');
function brandContext(){detect();const a=activeBrand(),p=B[a];if(a&&p)return `BRAND: ${a}. CATEGORY: ${p.type||''}. TONE: ${(p.tone||[]).join(', ')}. STYLE: ${(p.style||[]).join(', ')}. PREFERRED: ${(p.preferred||[]).join(', ')}. AVOID: ${(p.avoid||[]).join(', ')}.`;if(project)return `CURRENT CHATGPT PROJECT: ${project}. Infer brand/category from current project context and uploaded references, but prioritize the user's explicit brief and uploaded references over an unrelated project title.`;return'Infer brand/category from current brief and uploaded references.'}

const COMPOSITIONS=['asymmetric diagonal hierarchy','editorial modular grid','oversized centered crop with off-axis support','split-depth foreground/midground/background','edge-anchored product with strong negative space','radial spatial composition','cropped macro + hero dual-scale layout','architectural frame composition','low-angle monumental composition','high-angle graphic composition'];
const CAMERAS=['eye-level 50mm commercial view','low-angle 28mm dramatic view','high-angle 35mm graphic view','telephoto compressed 85mm view','macro-detail 100mm perspective','wide environmental 24mm view','three-quarter 45-degree hero angle','front-on orthographic-inspired view'];
const LIGHTS=['soft daylight with crisp shape definition','hard directional studio light with sculptural shadows','large softbox commercial lighting','rim-lit cinematic separation','high-key bright premium lighting','low-contrast editorial daylight','dramatic side light with controlled falloff','reflected architectural light'];
const WORLDS=['clean architectural set','brand-color graphic environment','material-driven sculptural world','editorial studio with graphic planes','real-world contextual location','minimal seamless set','layered translucent environment','monumental spatial installation','ingredient/flavour world when factual','technical grid environment'];
const TYPE=['oversized condensed headline system','editorial serif + sans hierarchy','Swiss modular sans system','minimal micro-label typography','kinetic diagonal type system','edge typography + small labels','single oversized wordmark gesture','technical numeric/label system'];
const GRAPHICS=['frames and crop masks','bold color blocks','fine linework and labels','custom geometric shapes','ribbons and directional arrows','pattern/texture system','oversized letterforms behind product','modular chips using supplied facts only'];
const DEPTH=['deep foreground occlusion','flat graphic depth with cutout overlap','shallow cinematic depth of field','multi-plane layered depth','monumental scale contrast','negative-space driven depth'];
const STORIES=['hero dominance','performance energy','precision/technology','refreshment/flavour','premium editorial','scale spectacle','material transformation','motion/future energy','clean confidence','real-world activation'];

function diversitySignature(x){
 const h=gj(K.diversity,{n:0,last:[]}),n=(h.n||0)+1;
 const pick=(arr,offset)=>arr[(n*3+offset*5+(x.cmd||'').length)%arr.length];
 const sig={
  composition:pick(COMPOSITIONS,1),camera:pick(CAMERAS,2),lighting:pick(LIGHTS,3),world:pick(WORLDS,4),
  typography:pick(TYPE,5),graphics:pick(GRAPHICS,6),depth:pick(DEPTH,7),story:pick(STORIES,8)
 };
 const key=Object.values(sig).join('|');
 h.n=n;h.last=[key,...(h.last||[]).filter(v=>v!==key)].slice(0,8);sj(K.diversity,h);
 return `FRESH-DESIGN SIGNATURE FOR THIS RUN — use this as a diversity constraint, not literal mandatory styling if brand-inappropriate: composition=${sig.composition}; camera/crop=${sig.camera}; lighting=${sig.lighting}; environment=${sig.world}; typography=${sig.typography}; graphic system=${sig.graphics}; depth=${sig.depth}; visual story=${sig.story}. ANTI-REPETITION: inspect recent outputs in this conversation. Do not reuse their visual formula. Change at least 7 major design decisions from the most recent comparable output. Same preset must produce a visibly new design at thumbnail level, not a recolor or minor rearrangement.`;
}
function formatRule(x){
 if(x.category==='Packaging')return'';
 const fm={'4:5':'4:5 portrait 1080×1350','1:1':'1:1 square','9:16':'9:16 vertical story/reel','16:9':'16:9 wide banner/video','A4':'A4 print-page'};
 const q=quality==='Auto'?'':quality==='2K'?'OUTPUT QUALITY: prepare a clean high-detail 2K-safe result without changing design/product identity.':'OUTPUT QUALITY: prepare a clean high-detail 4K-safe result without changing design/product identity; do not hallucinate new label details during enhancement.';
 const p=platform==='Auto'?'':`TARGET PLATFORM: ${platform}.`;
 const f=format==='Auto'?'':`SELECTED FORMAT: ${fm[format]||format}. Preset/style and ratio are independent. ${layout==='Adapt'?'Intelligently recompose the same concept for this ratio; never stretch or blindly crop.':'Keep the preset native composition feel as much as possible while fitting this ratio.'}`;
 return `${p} ${f} ${q}`;
}
function routed(x){
 const base=R.baseRules||FALL.baseRules,div=R.diversityRules||FALL.diversityRules;
 if(x.category==='Packaging')return `${R.packagingRules||FALL.packagingRules} ${base}`;
 if(x.category==='CGI / 3D')return `${R.cgi3dRules||FALL.cgi3dRules} ${div} ${base}`;
 if(x.category==='Edit')return `${R.editRules||''} ${base}`;
 if(x.category==='Fix / Enhance')return `${R.fixRules||''} ${base}`;
 if(x.category==='Identity / Face')return `${R.identityRules||''} ${base}`;
 if(['Camera','Video / UGC','Video','UGC Video'].includes(x.category))return `${R.videoRules||''} ${base}`;
 return `${div} ${base}`;
}
function makePrompt(x){const fresh=['Create','Product Ads','CGI / 3D','Food','Social','Campaign','Style'].includes(x.category)?diversitySignature(x):'';return `${brandContext()} PRESET: ${x.label}. ${x.prompt||x.desc||x.label}. ${formatRule(x)} ${fresh} ${routed(x)}`}

const CSS=`:host{all:initial}*{box-sizing:border-box}.shell{--ink:#171717;--muted:#777;--line:#e7e7e7;--soft:#f7f7f8;--a:#635bff;--b:#ec4d9a;position:fixed;z-index:2147483647;right:14px;top:58px;bottom:68px;width:min(980px,calc(100vw - 280px));min-width:720px;display:none;flex-direction:column;overflow:hidden;background:#fff;color:var(--ink);border:1px solid #ddd;border-radius:26px;box-shadow:0 30px 100px #0000002b,0 3px 12px #00000012;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.shell.show{display:flex}.hero{padding:15px 17px 12px;background:linear-gradient(135deg,#fff,#f7f5ff 58%,#fff5fa);border-bottom:1px solid var(--line)}.heroTop{display:flex;justify-content:space-between;gap:12px}.brandMark{display:flex;align-items:center;gap:10px}.logo{width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,var(--a),var(--b));display:grid;place-items:center;color:#fff;font-size:15px;font-weight:900;box-shadow:0 8px 24px #635bff33}.title{font-size:18px;font-weight:900;letter-spacing:-.4px}.subtitle{font-size:10.5px;color:#777;margin-top:2px}.status{font-size:9px;font-weight:800;background:#fff;border:1px solid #e6e6e6;border-radius:999px;padding:6px 9px;height:max-content}.project{margin-top:7px;font-size:9.5px;color:#6a4fd3;font-weight:750}.locks{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.lock{display:inline-flex;gap:5px;align-items:center;border:1px solid #e7e7e7;background:#fff;padding:6px 8px;border-radius:999px;font-size:9px;font-weight:850}.ok{width:6px;height:6px;border-radius:50%;background:#25b66b}.searchRow{padding:11px 14px 9px;border-bottom:1px solid var(--line)}.search{width:100%;height:42px;border:1px solid #e3e3e3;background:#f4f4f5;border-radius:14px;padding:0 13px;outline:0;font-size:12px;font-weight:600}.search:focus{background:#fff;border-color:#bbb}.nav{display:flex;gap:6px;overflow-x:auto;padding:0 14px 10px;border-bottom:1px solid var(--line)}.nav::-webkit-scrollbar,.subbar::-webkit-scrollbar{display:none}.navBtn{white-space:nowrap;border:0;background:#f2f2f3;color:#444;border-radius:11px;padding:8px 11px;font-size:10px;font-weight:850;cursor:pointer}.navBtn.on{background:#171717;color:#fff}.navBtn.threed.on{background:linear-gradient(135deg,var(--a),var(--b))}.controls{display:grid;grid-template-columns:1.15fr 1fr 1fr 1fr;gap:9px;padding:9px 14px;border-bottom:1px solid var(--line);background:#fcfcfc}.controlLabel{font-size:8px;font-weight:900;letter-spacing:.7px;color:#999;margin-bottom:5px}.chips{display:flex;gap:5px;flex-wrap:wrap}.chip{border:1px solid #e4e4e4;background:#fff;border-radius:999px;padding:6px 8px;font-size:9px;font-weight:850;color:#555;cursor:pointer}.chip.on{background:#171717;color:#fff;border-color:#171717}.subbar{display:none;gap:6px;overflow-x:auto;padding:9px 14px;border-bottom:1px solid var(--line);background:#faf9ff}.subbar.show{display:flex}.sub{white-space:nowrap;border:1px solid #e6e1ff;background:#fff;color:#5e48c9;border-radius:999px;padding:7px 10px;font-size:9px;font-weight:850;cursor:pointer}.sub.on{background:#635bff;color:#fff;border-color:#635bff}.content{flex:1;min-height:0;display:grid;grid-template-columns:170px 1fr}.side{overflow-y:auto;padding:10px 8px;border-right:1px solid var(--line);background:#fcfcfc}.sideTitle{font-size:8px;font-weight:900;letter-spacing:.8px;color:#aaa;padding:4px 8px 7px}.sideBtn{width:100%;border:0;background:transparent;color:#555;border-radius:11px;padding:9px 10px;text-align:left;font-size:10px;font-weight:750;cursor:pointer}.sideBtn.on{background:#171717;color:#fff}.main{overflow-y:auto;padding:12px}.sectionHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.sectionTitle{font-size:12px;font-weight:900}.count{font-size:9px;color:#888}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.card{position:relative;min-height:126px;padding:12px;border:1px solid #e7e7e7;background:linear-gradient(180deg,#fff,#fafafa);border-radius:18px;cursor:pointer;transition:.15s ease;overflow:hidden}.card:before{content:"";position:absolute;left:0;top:0;width:4px;height:100%;background:#ddd}.card[data-cat="CGI / 3D"]:before{background:linear-gradient(#635bff,#ec4d9a)}.card[data-cat="Packaging"]:before{background:#00a184}.card:hover{transform:translateY(-2px);box-shadow:0 12px 28px #00000010;border-color:#c9c9c9}.card.on{border-color:#171717}.cardTop{display:flex;justify-content:space-between;gap:8px}.command{display:inline-flex;max-width:78%;padding:4px 7px;border-radius:999px;background:#f2f2f3;color:#555;font:750 9px ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fav{width:25px;height:25px;border:0;border-radius:50%;background:#f3f3f3;color:#aaa;cursor:pointer}.fav.on{background:#fff0b8;color:#a86f00}.cardName{font-size:12.5px;font-weight:900;line-height:1.15;margin-top:13px}.cardDesc{font-size:10px;line-height:1.35;color:#777;margin-top:5px}.tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:10px}.tag{font-size:8px;font-weight:800;color:#777;background:#f0f0f1;padding:4px 6px;border-radius:999px}.footer{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-top:1px solid var(--line);font-size:9px;color:#888}.footBtn{border:0;border-radius:999px;background:#f0f0f1;padding:7px 10px;font-size:9px;font-weight:850;cursor:pointer}.badge{position:fixed;right:18px;bottom:88px;z-index:2147483647;display:flex;align-items:center;gap:7px;background:#fff;border:1px solid #ddd;border-radius:999px;padding:9px 12px;box-shadow:0 10px 30px #0002;font:850 10px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.badgeDot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#635bff,#ec4d9a)}.shell.show+.badge{display:none}@media(max-width:1120px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.shell{right:8px;width:calc(100vw - 16px);min-width:0}}@media(max-width:760px){.content{grid-template-columns:122px 1fr}.grid{grid-template-columns:1fr}.controls{grid-template-columns:1fr}.locks{display:none}.shell{top:52px;bottom:68px;border-radius:18px}}`;

function make(){if(menu)return;host=document.createElement('div');document.documentElement.appendChild(host);sh=host.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=CSS;sh.appendChild(style);menu=document.createElement('div');menu.className='shell';menu.innerHTML=`<div class="hero"><div class="heroTop"><div class="brandMark"><div class="logo">V</div><div><div class="title">Virag Creative OS</div><div class="subtitle">Adaptive Creative Engine • 3D Studio • Packaging • Edit • Video</div></div></div><div class="status">v${V}</div></div><div class="project"></div><div class="locks"><span class="lock"><span class="ok"></span>PRODUCT LOCK</span><span class="lock"><span class="ok"></span>ANTI-REPEAT ON</span><span class="lock"><span class="ok"></span>NO MORPH</span><span class="lock"><span class="ok"></span>NO COLLAGE</span></div></div><div class="searchRow"><input class="search" placeholder="Search: billboard, chrome 3D, liquid splash, packaging, face lock…"></div><div class="nav"></div><div class="controls"><div><div class="controlLabel">PLATFORM</div><div class="platform chips"></div></div><div><div class="controlLabel">FORMAT</div><div class="formats chips"></div></div><div><div class="controlLabel">LAYOUT</div><div class="layouts chips"></div></div><div><div class="controlLabel">QUALITY</div><div class="qualities chips"></div></div></div><div class="subbar"></div><div class="content"><div class="side"><div class="sideTitle">CATEGORIES</div><div class="cats"></div></div><div class="main"><div class="sectionHead"><div class="sectionTitle"></div><div class="count"></div></div><div class="grid"></div></div></div><div class="footer"><span>Virag • v${V} • runtime auto-sync</span><div><button class="footBtn recentBtn">Recent</button> <button class="footBtn favBtn">Favorites</button> <button class="footBtn syncBtn">Sync now</button></div></div>`;sh.appendChild(menu);badge=document.createElement('div');badge.className='badge';badge.innerHTML='<span class="badgeDot"></span>Virag';sh.appendChild(badge);badge.onclick=()=>{editor=editor||document.querySelector('textarea')||document.querySelector('[contenteditable="true"]');render('',true)};menu.querySelector('.syncBtn').onclick=()=>sync(true);menu.querySelector('.favBtn').onclick=()=>{mode='Favorites';category='All';sub='All';render('',false)};menu.querySelector('.recentBtn').onclick=()=>{mode='Recent';category='All';sub='All';render('',false)};menu.querySelector('.search').oninput=e=>{query=e.target.value;sel=0;render(query,false,true)};ui()}
function ui(){if(!menu)return;menu.querySelector('.status').textContent=`v${V} • ${status}`;menu.querySelector('.project').textContent=autoBrand?`✓ Brand: ${autoBrand} • AUTO PROJECT`:project?`✓ Project: ${project}`:activeBrand()?`✓ Brand: ${activeBrand()} • MANUAL`:'Project/Brand not detected'}
function chipRow(el,vals,current,setter){el.innerHTML='';vals.forEach(v=>{const b=document.createElement('button');b.className='chip'+(current===v?' on':'');b.textContent=v;b.onclick=()=>{setter(v);render(query,false,true)};el.appendChild(b)})}
function renderControls(){chipRow(menu.querySelector('.platform'),['Auto','Instagram','LinkedIn','Story','Web'],platform,v=>{platform=v;ss(K.platform,v)});chipRow(menu.querySelector('.formats'),['Auto','4:5','1:1','9:16','16:9','A4'],format,v=>{format=v;ss(K.format,v)});chipRow(menu.querySelector('.layouts'),['Adapt','Native'],layout,v=>{layout=v;ss(K.layout,v)});chipRow(menu.querySelector('.qualities'),['Auto','2K','4K'],quality,v=>{quality=v;ss(K.quality,v)})}
function renderNav(){const e=menu.querySelector('.nav');e.innerHTML='';[['Library','Library'],['3D','3D Studio'],['Packaging','Packaging'],['Video','Video'],['Identity','Face / Identity'],['Favorites','★ Favorites'],['Recent','Recent']].forEach(([v,l])=>{const b=document.createElement('button');b.className='navBtn'+(mode===v?' on':'')+(v==='3D'?' threed':'');b.textContent=l;b.onclick=()=>{mode=v;category='All';sub='All';query='';menu.querySelector('.search').value='';render('',false,true)};e.appendChild(b)})}
function source(){
 let a=[...C];
 if(mode==='3D')a=a.filter(x=>x.category==='CGI / 3D');
 else if(mode==='Packaging')a=a.filter(x=>x.category==='Packaging');
 else if(mode==='Video')a=a.filter(x=>['Video / UGC','Video','UGC Video','Camera'].includes(x.category));
 else if(mode==='Identity')a=a.filter(x=>x.category==='Identity / Face');
 else if(mode==='Favorites'){const f=gj(K.favorites,[]);a=a.filter(x=>f.includes(x.cmd))}
 else if(mode==='Recent'){const r=gj(K.recent,[]);a=r.map(c=>C.find(x=>x.cmd===c)).filter(Boolean)}
 if(mode==='3D'&&sub!=='All')a=a.filter(x=>(x.tags||[]).includes(sub));
 if(category!=='All'&&mode==='Library')a=a.filter(x=>x.category===category);
 if(query)a=a.filter(x=>[x.cmd,x.label,x.desc,...(x.tags||[])].join(' ').toLowerCase().includes(query.toLowerCase()));
 return a
}
function renderSub(){const e=menu.querySelector('.subbar');e.innerHTML='';e.classList.toggle('show',mode==='3D');if(mode!=='3D')return;[['All','All'],['hero','Hero'],['ooh','OOH / Breakout'],['materials','Materials'],['effects','Effects'],['technical','Technical'],['worlds','Worlds'],['social3d','Social 3D']].forEach(([v,l])=>{const b=document.createElement('button');b.className='sub'+(sub===v?' on':'');b.textContent=l;b.onclick=()=>{sub=v;render(query,false,true)};e.appendChild(b)})}
function renderCats(){const e=menu.querySelector('.cats');e.innerHTML='';if(mode!=='Library'){e.innerHTML=`<button class="sideBtn on">${mode==='3D'?'3D Studio':mode}</button>`;return}const cats=[...new Set(C.map(x=>x.category))];['All',...cats].forEach(v=>{const b=document.createElement('button');b.className='sideBtn'+(category===v?' on':'');b.textContent=v;b.onclick=()=>{category=v;render(query,false,true)};e.appendChild(b)})}
function toggleFav(c){let f=gj(K.favorites,[]);f=f.includes(c)?f.filter(x=>x!==c):[c,...f];sj(K.favorites,f);render(query,false,true)}
function remember(c){let r=gj(K.recent,[]);r=[c,...r.filter(x=>x!==c)].slice(0,20);sj(K.recent,r)}
function render(q='',doSync=true,keep=false){make();if(doSync)sync();detect();query=q;if(!keep)menu.querySelector('.search').value=q;renderNav();renderControls();renderSub();renderCats();items=source().slice(0,180);sel=Math.min(sel,Math.max(0,items.length-1));menu.querySelector('.sectionTitle').textContent=mode==='3D'?`3D Studio • ${sub==='All'?'All Styles':sub}`:mode;menu.querySelector('.count').textContent=`${items.length} presets`;const g=menu.querySelector('.grid');g.innerHTML='';const favs=gj(K.favorites,[]);items.forEach((x,i)=>{const d=document.createElement('div');d.className='card'+(i===sel?' on':'');d.dataset.cat=x.category;d.innerHTML='<div class="cardTop"><div class="command"></div><button class="fav">★</button></div><div class="cardName"></div><div class="cardDesc"></div><div class="tags"></div>';d.querySelector('.command').textContent=x.cmd;d.querySelector('.cardName').textContent=x.label;d.querySelector('.cardDesc').textContent=x.desc||'';d.querySelector('.fav').classList.toggle('on',favs.includes(x.cmd));d.querySelector('.fav').onclick=e=>{e.stopPropagation();toggleFav(x.cmd)};(x.tags||[]).slice(0,3).forEach(t=>{const s=document.createElement('span');s.className='tag';s.textContent=t;d.querySelector('.tags').appendChild(s)});d.onclick=()=>choose(x);g.appendChild(d)});if(!items.length)g.innerHTML='<div class="cardDesc">No matching presets.</div>';menu.classList.add('show');ui()}
const isEd=e=>!!e&&(e.tagName==='TEXTAREA'||e.isContentEditable||e.closest?.('[contenteditable="true"]'));
const getEd=e=>e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]'));
const txt=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function put(e,t){if(!e)return;if(e.tagName==='TEXTAREA'){const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();return}e.focus();const r=document.createRange(),g=getSelection();r.selectNodeContents(e);g.removeAllRanges();g.addRange(r);try{document.execCommand('insertText',false,t)}catch{e.textContent=t;e.dispatchEvent(new InputEvent('input',{bubbles:true,data:t}))}}
function choose(x){remember(x.cmd);const t=txt(editor),out=makePrompt(x);put(editor,t.replace(/(?:^|\n)\/[\w-]*$/,m=>(m.startsWith('\n')?'\n':'')+out));menu.classList.remove('show')}
const slash=t=>{const m=String(t).match(/(?:^|\n)\/([\w-]*)$/);return m?m[1]:null};
document.addEventListener('input',e=>{if(!isEd(e.target))return;editor=getEd(e.target);const z=slash(txt(editor));if(z===null){menu?.classList.remove('show');return}sync();const s=z.toLowerCase();mode=s.includes('3d')||s.includes('cgi')?'3D':s.startsWith('pack')||s.includes('label')||s.includes('tube')||s.includes('pouch')?'Packaging':s.includes('video')||s.includes('camera')?'Video':s.includes('face')||s.includes('identity')||s.includes('character')?'Identity':'Library';category='All';sub='All';render(z,false)},true);
document.addEventListener('keydown',e=>{if(!menu?.classList.contains('show')||!isEd(e.target))return;if(e.key==='ArrowDown'){e.preventDefault();sel=(sel+1)%Math.max(1,items.length);render(query,false,true)}else if(e.key==='ArrowUp'){e.preventDefault();sel=(sel-1+Math.max(1,items.length))%Math.max(1,items.length);render(query,false,true)}else if(e.key==='Enter'&&!e.shiftKey&&items.length){e.preventDefault();e.stopPropagation();choose(items[sel])}else if(e.key==='Escape')menu.classList.remove('show')},true);
addEventListener('focus',()=>{sync(true);detect()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){sync(true);detect()}});new MutationObserver(detect).observe(document.documentElement,{subtree:true,childList:true});make();sync(true);setInterval(()=>sync(true),30000);

})();