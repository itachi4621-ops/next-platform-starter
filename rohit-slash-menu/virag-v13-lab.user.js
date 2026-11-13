// ==UserScript==
// @name         Virag V13 Lab
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      13.0.0-beta.1
// @description  Clean-room human-designed creative maker with isolated category engines.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-v13-lab.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-v13-lab.user.js
// ==/UserScript==

(()=>{'use strict';
const VERSION='13.0.0-beta.1';
const CATEGORIES={
  Creative:{icon:'✦',role:'Finished social creative',presets:[
    ['Campaign Hero','One memorable product-specific visual idea with an expressive headline relationship.'],
    ['Editorial Story','Magazine-grade hierarchy, art-directed crop and concise supporting information.'],
    ['Benefit System','Turn verified benefits into a clear visual information system, not floating cards.'],
    ['Contextual Story','Show the product in a believable audience-relevant moment with designed typography.'],
    ['Bold Type','Let one disciplined typographic gesture interact with the product.'],
    ['Crafted Tactile','Use physical paper, print, fabric or material detail with human finish.'],
    ['Surreal Metaphor','Use one simple product-relevant surreal metaphor with commercial clarity.'],
    ['Clean Premium','Bright, controlled luxury with rich micro-detail and no empty minimalism.']
  ]},
  Flyer:{icon:'▤',role:'Information-led flyer',presets:[
    ['Event Flyer','Clear event title, who/what/when/where grouping and action footer.'],
    ['Offer Flyer','Immediate offer hierarchy using only supplied price, discount and dates.'],
    ['Launch Flyer','Debut energy, exact launch subject and supplied availability information.'],
    ['Schedule Flyer','Time-led modular structure with effortless scanning.'],
    ['Invitation','Refined invitation hierarchy with restrained detail and readable essentials.'],
    ['Retail Flyer','Product and offer clarity with strong price architecture.'],
    ['Community Flyer','Warm human photography and accessible grouped information.'],
    ['Editorial Flyer','Expressive type scale with a disciplined practical-information zone.']
  ]},
  '3D':{icon:'◈',role:'Native finished CGI',presets:[
    ['CGI Campaign Hero','Premium full-frame CGI key visual with one strong commercial metaphor.'],
    ['Product Universe','A layered brand world with foreground, midground and background depth.'],
    ['Giant Product','Believable oversized product integrated into a real environment.'],
    ['Miniature World','Tiny characters or structures interacting at a coherent scale.'],
    ['Material Study','Category-relevant glass, metal, liquid, powder or fabric simulation.'],
    ['Kinetic Mechanism','A frozen moment of purposeful motion with physically believable dynamics.'],
    ['Architectural World','Product-inspired space with credible construction, scale and lighting.'],
    ['Technical Cutaway','A clean explanatory spatial view using verified structure only.'],
    ['FOOH Installation','A plausible real-location brand installation with correct perspective.'],
    ['Transformation','A readable before-to-after material or form transition without product morphing.']
  ]},
  Packaging:{icon:'▣',role:'Packaging presentation',presets:[
    ['Pack Hero','Exact package as the designed object with premium material and shelf presence.'],
    ['Variant System','Show supplied variants as one coherent family without inventing SKUs.'],
    ['Material Story','Highlight verified pack material, finish and construction.'],
    ['Shelf Impact','Retail-context presentation with clear distance readability.'],
    ['Label Explainer','Restrained annotations for supplied label information only.'],
    ['Unboxing','Believable opening sequence or still-life using exact pack components.'],
    ['Premium Still Life','Art-directed pack composition with tactile surfaces and controlled light.'],
    ['Eco Presentation','Sustainability-led presentation only when claims are supplied.']
  ]},
  UGC:{icon:'●',role:'Authentic creator content',presets:[
    ['Phone Review','Natural handheld creator review with believable room light and behaviour.'],
    ['Unboxing UGC','Realistic first-open reactions and correct product handling.'],
    ['Problem Solution','Relatable everyday problem and truthful supplied solution.'],
    ['Routine Demo','Product used naturally in a coherent daily routine.'],
    ['Testimonial','Human delivery using only supplied testimonial wording.'],
    ['POV Hook','Immediate phone-native POV moment with a natural hook.'],
    ['Creator Comparison','Honest side-by-side explanation using supplied facts only.'],
    ['Lifestyle Clip','Casual real-world product moment without studio-ad polish.']
  ]},
  Video:{icon:'▶',role:'Time-based video',presets:[
    ['Product Film','Cinematic product story with shot progression and stable identity.'],
    ['Launch Reveal','Anticipation, controlled reveal, supplied differentiators and end card.'],
    ['Performance Ad','Hook, demonstration/proof and supplied CTA with changing shot scale.'],
    ['Food Reel','Truthful appetite sequence with stable plating and natural movement.'],
    ['Infographic Reel','One fact per beat with readable motion typography.'],
    ['UGC Hybrid','Creator authenticity supported by restrained designed overlays.'],
    ['Material Film','Macro material behaviour with physically plausible motion and light.'],
    ['Graphic Loop','Seamless purposeful loop with stable product and readable brand moment.']
  ]},
  'AI Tools':{icon:'⌁',role:'Utility prompt',presets:[
    ['Prompt Audit','Audit the current visual prompt for conflicts, bloat and missing source locks.'],
    ['Copy Extract','Extract only exact readable copy and facts from current-turn assets.'],
    ['Creative Critique','Critique hierarchy, typography, fidelity, clarity and human finish.'],
    ['Variation Ideas','Propose structurally distinct concepts without generating claims.'],
    ['Product Check','Compare output against source geometry, label, logo and colour.'],
    ['Typography Check','Check spelling, glyph quality, hierarchy, families and weights.']
  ]}
};
const RATIOS={Feed:'1080×1350 vertical 4:5',Story:'1080×1920 vertical 9:16',Square:'1080×1080 square 1:1',Landscape:'1920×1080 horizontal 16:9',Native:'native ratio requested by the current brief'};
const state={category:'Creative',preset:0,ratio:'Feed',products:1,outputs:1,arrangement:'separate',copy:'balanced',fidelity:'pixel',send:true};
const safe=s=>String(s||'').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
function composer(){return [...document.querySelectorAll('#prompt-textarea,[data-testid="composer-input"],[contenteditable="true"][role="textbox"],textarea')].find(e=>{const r=e.getBoundingClientRect();return r.width>100&&r.height>20&&!e.closest('[aria-hidden="true"]')})}
function read(e){return e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'')}
function write(e,text){if(!e)return false;e.focus();if(e.tagName==='TEXTAREA'){const set=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;set?set.call(e,text):e.value=text;e.dispatchEvent(new Event('input',{bubbles:true}));return true}try{const s=getSelection(),r=document.createRange();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);document.execCommand('insertText',false,text);s.removeAllRanges();e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}));return true}catch{return false}}
function currentBrief(){const t=read(composer());return t.replace(/(?:^|\n)\s*\/[\w-]+\s*$/,'').trim()}
function sourceLock(){return`SOURCE FIDELITY — HIGHEST PRIORITY. Use only current-turn uploads. Preserve the exact product or person identity. Product: keep the complete silhouette, dimensions, cap/lid, container, label bounds, logo, spelling, printed facts, colours and variant unchanged. Person: keep the same face geometry, natural asymmetry, skin tone, hairline and distinguishing features. Do not redraw, beautify, recolour, relight inside, deform, stretch, perspective-warp or invent hidden details. For a supplied front-facing product, keep that view and integrate it with external shadows, reflections and foreground/background interaction. If a requested angle cannot be supported by supplied references, keep the supplied angle rather than inventing geometry.`}
function humanStandard(){return`HUMAN-MADE FINISH. Build one clear communication idea before styling. Use purposeful asymmetry, optical spacing, believable material detail, controlled imperfection and a coherent foreground/midground/background relationship. Reject generic AI gloss, plastic surfaces, excessive bloom, random particles, meaningless shapes, default pedestals, fake bokeh, impossible reflections, repeated textures and template symmetry. Current signals may inspire tactile texture, local relevance, cinematic storytelling or restrained surrealism, but trends are optional and may never weaken clarity, source fidelity or brand coherence.`}
function typeStandard(){return`TYPOGRAPHY. Use exact supplied wording only. Maximum two professional font families and three upright weights. Prefer Inter Tight, Instrument Sans, Archivo, Manrope, DM Sans, Sora, Barlow, Public Sans, IBM Plex Sans or Source Sans 3; use Source Serif 4 or Gelasio only for a restrained editorial contrast. Typeset added copy as crisp readable 2D design, with optical kerning and deliberate line breaks. Never use fake glyphs, pseudo-text, cursive, script, graffiti, novelty, melted, extruded or warped lettering. Check every word character by character before delivery.`}
function outputPlan(cat){const n=state.arrangement==='together'?state.outputs:state.products*state.outputs;return`OUTPUT PLAN. ${state.products} distinct product${state.products>1?'s':''}; ${state.outputs} output${state.outputs>1?'s':''} per ${state.arrangement==='together'?'combined set':'product'}; ${n} standalone deliverable${n>1?'s':''} total. Arrangement: ${state.arrangement.toUpperCase()}. Map current-turn uploads in order and never substitute, merge, omit or duplicate a product. Generate each result as its own full-frame image or video—never a collage, contact sheet, split screen or multi-output board. ${n>1?'Every result must use a different concept family, composition, crop, product scale/position, type silhouette, information topology and depth behaviour; a background swap is not a variation.':''}`}
function copyRule(){return state.copy==='minimal'?'COPY LEVEL. Use only one short supplied headline and no supporting copy unless essential.':state.copy==='rich'?'COPY LEVEL. Use one short supplied hook plus up to three concise verified facts and a supplied CTA. Keep every module readable and connected.':'COPY LEVEL. Use one short supplied hook plus one or two verified supporting facts. Use a CTA only when supplied.'}
function creative(cat,preset){return`CATEGORY — CREATIVE. Deliver a finished ${RATIOS[state.ratio]} social creative, not a raw photo or render. SELECTED ROUTE — ${preset[0]}: ${preset[1]} Establish one dominant product-and-headline relationship, one to three compact supporting modules only when useful, and two to five coordinated graphic devices from one visual language. It must read in two seconds and still reward closer inspection. Clean means edited and controlled, not empty or basic.`}
function flyer(cat,preset){return`CATEGORY — FLYER. Deliver a finished ${RATIOS[state.ratio]} flyer. SELECTED ROUTE — ${preset[0]}: ${preset[1]} Information controls the design: dominant title, grouped essential details, clear reading path and action/footer zone. Use only supplied event, date, time, location, price, offer and CTA. Do not turn it into an Instagram product post or CGI catalog image.`}
function threeD(cat,preset){return`CATEGORY — NATIVE 3D / CGI. Deliver one finished full-frame ${RATIOS[state.ratio]} photoreal CGI key visual. SELECTED ROUTE — ${preset[0]}: ${preset[1]} The CGI mechanism controls camera, environment, scale, materials, light and spatial event. Render a resolved commercial scene with physically plausible geometry, reflections, refraction, global illumination, contact shadows and coherent depth. The uploaded product remains an exact source composite integrated naturally into the scene. No added headline, cards, facts, CTA or social layout unless explicitly requested. Reject wireframes, perspective grids, construction guides, axes, bounding boxes, crop marks, vector placeholders, UI overlays, unfinished masks, greybox geometry and viewport screenshots. Deliver only the final render.`}
function packaging(cat,preset){return`CATEGORY — PACKAGING. Deliver a finished ${RATIOS[state.ratio]} packaging presentation. SELECTED ROUTE — ${preset[0]}: ${preset[1]} The package is the designed object. Preserve exact artwork and structure; use verified material, shelf, variant or annotation information only. Do not convert it into a social-post template, flyer or unrelated CGI spectacle.`}
function ugc(cat,preset){return`CATEGORY — AUTHENTIC UGC. Deliver a believable ${RATIOS[state.ratio]} creator-led frame or sequence. SELECTED ROUTE — ${preset[0]}: ${preset[1]} Use natural phone optics, plausible room light, real posture, correct hands and product handling, subtle exposure variation and restrained native overlays. Avoid studio-ad polish, mannequin posing, perfect skin, fake enthusiasm and over-designed graphics.`}
function video(cat,preset){return`CATEGORY — VIDEO. Deliver a complete ${RATIOS[state.ratio]} time-based concept. SELECTED ROUTE — ${preset[0]}: ${preset[1]} Define a first-second hook, shot progression, camera/lens logic, stable product identity, purposeful transitions and final resolution. Motion must obey physics; reject flicker, morphing, texture crawl, teleporting objects and automatic zoom. Any title card must remain readable long enough to understand.`}
function ai(cat,preset){return`UTILITY — ${preset[0]}. ${preset[1]} Work only from current-turn text and uploads. Return a concise actionable result; do not generate an image unless explicitly asked.`}
const engines={Creative:creative,Flyer:flyer,'3D':threeD,Packaging:packaging,UGC:ugc,Video:video,'AI Tools':ai};
function compile(){const cat=state.category,p=CATEGORIES[cat].presets[state.preset],brief=currentBrief();return[
  'VIRAG V13 — CLEAN GENERATION REQUEST. Create the requested final deliverable now using ChatGPT image/video capability when applicable. Do not return a prompt or explanation instead of the result.',
  brief?`CURRENT BRIEF\n${brief}`:'CURRENT BRIEF\nUse the current-turn uploads and selected route only. Do not import earlier products, campaigns or failed outputs.',
  cat!=='AI Tools'?outputPlan(cat):'',engines[cat](cat,p),cat!=='AI Tools'?sourceLock():'',cat!=='AI Tools'?copyRule():'',!['3D','UGC','AI Tools'].includes(cat)?typeStandard():'',cat!=='AI Tools'?humanStandard():'',
  'FINAL GATE. Before delivery, compare the result with the source and reject any changed identity, malformed text, invented claim, dirty edge, unclear hierarchy, unrelated decoration, visible generation artifact or wrong category structure. The explicit current brief wins over optional styling.'
].filter(Boolean).join('\n\n')}
function sendButton(e){const f=e?.closest('form');return [...(f||document).querySelectorAll('button[data-testid="send-button"],button[aria-label*="Send" i],button[type="submit"]')].find(b=>!b.disabled&&b.getBoundingClientRect().width>10)}
async function execute(){const e=composer();if(!e)return notice('Composer not found',true);const prompt=compile();if(!write(e,prompt))return notice('Could not insert prompt',true);panel.classList.remove('open');if(state.send){await new Promise(r=>setTimeout(r,350));sendButton(e)?.click()}else notice('Prompt inserted')}
function notice(msg,bad=false){toast.textContent=msg;toast.className='toast show'+(bad?' bad':'');setTimeout(()=>toast.classList.remove('show'),2200)}
const host=document.createElement('div');host.id='virag-v13-host';document.documentElement.appendChild(host);const root=host.attachShadow({mode:'open'});
root.innerHTML=`<style>
:host{all:initial}*{box-sizing:border-box}button,select,input{font:inherit}.openbtn{position:fixed;right:18px;bottom:78px;z-index:2147483647;width:54px;height:54px;border:0;border-radius:18px;background:#111;color:#fff;box-shadow:0 12px 35px #0004;font:800 18px Inter,system-ui;cursor:pointer}.panel{position:fixed;z-index:2147483647;inset:66px 18px 72px auto;width:min(880px,calc(100vw - 36px));display:none;grid-template-rows:auto auto 1fr auto;background:#f7f7f5;color:#171717;border:1px solid #d8d8d2;border-radius:22px;overflow:hidden;box-shadow:0 28px 90px #0003;font-family:Inter,system-ui}.panel.open{display:grid}.head,.controls,.foot{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#fff;border-bottom:1px solid #e5e5df}.head{justify-content:space-between}.brand b{font-size:15px}.brand small{display:block;color:#777;font-size:9px;margin-top:3px}.close{border:0;background:#eee;width:34px;height:34px;border-radius:10px;font-size:20px;cursor:pointer}.tabs{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;padding:10px;background:#fff;border-bottom:1px solid #e5e5df}.tab{height:42px;border:1px solid #ddd;border-radius:11px;background:#fff;color:#666;font-size:9px;font-weight:800;cursor:pointer}.tab.on{background:#111;color:#fff;border-color:#111}.body{display:grid;grid-template-columns:240px 1fr;min-height:0}.side{padding:12px;border-right:1px solid #ddd;overflow:auto}.control{margin-bottom:10px}.control label{display:block;font-size:9px;font-weight:800;color:#666;margin:0 0 5px}.control select,.control input{width:100%;height:36px;border:1px solid #d5d5cf;border-radius:9px;background:#fff;padding:0 9px;color:#222}.presets{padding:12px;overflow:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;align-content:start}.card{min-height:92px;text-align:left;padding:12px;border:1px solid #d9d9d3;border-radius:14px;background:#fff;cursor:pointer}.card.on{border-color:#111;box-shadow:inset 0 0 0 1px #111}.card b{display:block;font-size:12px;margin-bottom:7px}.card span{font-size:10px;line-height:1.45;color:#666}.foot{border-top:1px solid #ddd;border-bottom:0;justify-content:space-between}.checks{font-size:9px;color:#666}.actions{display:flex;gap:8px}.actions button{height:38px;border-radius:10px;padding:0 15px;border:1px solid #ccc;background:#fff;font-weight:800;cursor:pointer}.actions .go{background:#111;color:#fff;border-color:#111}.toast{position:fixed;right:22px;bottom:145px;z-index:2147483647;background:#111;color:#fff;padding:10px 14px;border-radius:10px;font:700 11px Inter,system-ui;opacity:0;transform:translateY(8px);pointer-events:none;transition:.2s}.toast.show{opacity:1;transform:none}.toast.bad{background:#b91c1c}.preview{position:fixed;z-index:2147483647;inset:8%;display:none;background:#fff;border:1px solid #ccc;border-radius:18px;box-shadow:0 30px 100px #0005;padding:16px}.preview.open{display:grid;grid-template-rows:auto 1fr;gap:10px}.preview textarea{width:100%;height:100%;resize:none;border:1px solid #ddd;border-radius:12px;padding:14px;font:12px/1.5 ui-monospace,monospace}.preview h3{margin:0;font:800 14px Inter,system-ui}.preview button{float:right;border:0;border-radius:8px;padding:7px 11px;cursor:pointer}@media(max-width:720px){.panel{inset:40px 8px 65px;width:auto}.tabs{grid-template-columns:repeat(4,1fr)}.body{grid-template-columns:1fr}.side{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;border-right:0;border-bottom:1px solid #ddd}.control{margin:0}.presets{grid-template-columns:1fr}.checks{display:none}}
</style><button class="openbtn" title="Open Virag">V</button><section class="panel"><header class="head"><div class="brand"><b>Virag V13 Lab</b><small>Clean-room engine · ${VERSION}</small></div><button class="close">×</button></header><nav class="tabs"></nav><div class="body"><aside class="side"><div class="control"><label>FORMAT</label><select data-k="ratio">${Object.keys(RATIOS).map(x=>`<option>${x}</option>`).join('')}</select></div><div class="control"><label>PRODUCTS</label><input data-k="products" type="number" min="1" max="20" value="1"></div><div class="control"><label>OUTPUTS / PRODUCT</label><input data-k="outputs" type="number" min="1" max="10" value="1"></div><div class="control"><label>ARRANGEMENT</label><select data-k="arrangement"><option>separate</option><option>together</option></select></div><div class="control"><label>COPY LEVEL</label><select data-k="copy"><option value="minimal">Minimal</option><option value="balanced" selected>Balanced</option><option value="rich">Rich</option></select></div><div class="control"><label>ACTION</label><select data-k="send"><option value="true">Insert + Send</option><option value="false">Insert only</option></select></div></aside><main class="presets"></main></div><footer class="foot"><div class="checks">Isolated engines · exact sources · separate outputs · no invented claims</div><div class="actions"><button class="showpreview">Preview</button><button class="go">Generate</button></div></footer></section><div class="preview"><div><h3>Compiled prompt <button class="previewclose">Close</button></h3></div><textarea readonly></textarea></div><div class="toast"></div>`;
const panel=root.querySelector('.panel'),tabs=root.querySelector('.tabs'),presets=root.querySelector('.presets'),toast=root.querySelector('.toast'),preview=root.querySelector('.preview');
function render(){tabs.innerHTML=Object.entries(CATEGORIES).map(([k,v])=>`<button class="tab ${k===state.category?'on':''}" data-cat="${safe(k)}">${v.icon} ${safe(k)}</button>`).join('');const list=CATEGORIES[state.category].presets;state.preset=Math.min(state.preset,list.length-1);presets.innerHTML=list.map((p,i)=>`<button class="card ${i===state.preset?'on':''}" data-i="${i}"><b>${safe(p[0])}</b><span>${safe(p[1])}</span></button>`).join('')}
root.querySelector('.openbtn').onclick=()=>panel.classList.toggle('open');root.querySelector('.close').onclick=()=>panel.classList.remove('open');tabs.onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;state.category=b.dataset.cat;state.preset=0;render()};presets.onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;state.preset=+b.dataset.i;render()};root.querySelectorAll('[data-k]').forEach(el=>el.onchange=()=>{const k=el.dataset.k,v=el.value;state[k]=['products','outputs'].includes(k)?Math.max(1,+v||1):k==='send'?v==='true':v});root.querySelector('.go').onclick=execute;root.querySelector('.showpreview').onclick=()=>{preview.querySelector('textarea').value=compile();preview.classList.add('open')};root.querySelector('.previewclose').onclick=()=>preview.classList.remove('open');document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='/'){e.preventDefault();panel.classList.toggle('open')}});render();
})();
