// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      11.17.0
// @description  Virag V11.17.0 Lite — neo-tactile UI with resilient image-completion detection for uninterrupted multi-product runs.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM.xmlHttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.listValues
// @grant        GM.deleteValue
// @inject-into  content
// @noframes
// @compatible   Chrome
// @compatible   Firefox
// @compatible   Edge
// @compatible   Opera
// @compatible   Safari
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/creative-slash-menu.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/creative-slash-menu.user.js
// ==/UserScript==
(()=>{'use strict';
const V='11.17.0',R='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/',T=['Creative','Flyer','3D','Packaging','Video','AI Tools'],U={Creative:R+'creative-presets.json',Flyer:R+'flyer-presets.json',Packaging:R+'packaging-presets.json',Video:R+'video-presets.json','AI Tools':R+'ai-tools.json'},D=[['Signature CGI Concepts',R+'3d-signature.json'],['FOOH & Experiential',R+'3d-fooh.json'],['Transformations & Kinetics',R+'3d-transform.json'],['Materials & Simulation',R+'3d-materials.json'],['Environment Themes',R+'3d-environments.json']],K='virag.cache.';
const MAN=R+'virag-manifest.json',BRAIN=R+'creative-library.json',CORE_MODS=new Set(['design','trends','product','human','clean']),IST_OFFSET=19800000,DAILY_HOUR=1,DAILY_MINUTE=15,DAILY_KEY='virag.dailySyncDate';
const M={"Creative":"CREATIVE TOOL ROLE. Build the selected Instagram content format. The preset controls the visual idea; the social-content blueprint controls the final composition.","Flyer":"FLYER TOOL ROLE. Use the selected flyer mechanic as the information and promotion structure. Under an Instagram format, deliver it as a polished 4:5 social flyer with readable content modules; under Native mode, return the standalone flyer.","3D":"3D TOOL ROLE. Use CGI only as the campaign mechanism inside the selected final format. Under an Instagram format, the result must be a designed 4:5 social post with information graphics—not a cinematic render or product beauty shot.","Packaging":"PACKAGING TOOL ROLE. Use the selected packaging mechanic without changing protected source facts. Under an Instagram format, present the packaging idea inside a complete 4:5 launch or information creative; under Native mode, return the packaging solution itself.","Video":"VIDEO TOOL ROLE. Produce the selected video deliverable. Under Instagram formats, return a coherent vertical Reel or information-led motion-graphics plan; never return one static product poster."};
const Z='CURRENT CHATGPT IMAGE WORKFLOW. Generate the actual image now with ChatGPT current built-in image-generation capability; do not return a prompt, plan, concept note or written description instead of the image. Treat new generation and editing as different workflows. For a new creative, use only the current-turn user-uploaded product and reference assets. Attach an earlier generated image only when the user explicitly asks to edit that exact image. Generate every requested result as its own separate image, never a collage or multi-output board. Use concise, structured instructions and keep all invariant product details fixed on every generation.';
const A='CURRENT BRIEF LOCK. Use only current composer text, current-turn user uploads or attachments and the selected tool. Never import an older campaign, product, festival, offer, headline, CTA, script, visual style or topic unless the user explicitly references it. Earlier assistant-generated images are not current-turn source assets and are forbidden generation references unless the current request explicitly asks to edit or redesign one.',B='BLANK-CANVAS INPUT LOCK — EXECUTE BEFORE IMAGE GENERATION. Unless the current request explicitly says to edit or redesign a specific earlier output, this is a brand-new generation from a blank canvas. Never pass, attach, include, condition on, remix, extend, imitate or use any previous assistant-generated image, previous creative, previous background or last conversation image as an image-generation reference. If the image tool supports recent-image inclusion such as num_last_images_to_include, use zero or omit it. Include only the current-turn user-uploaded product and reference assets that are required by this brief. Earlier failed outputs may be analyzed only as negative examples of what to avoid; they must never enter the generation input. Do not preserve their camera, setting, composition, props, lighting or typography by accident. The only exception is an explicit current request to revise that exact earlier image.',E='DISTINCT INSTAGRAM CONCEPT-FAMILY ROUTER — FOR AUTOMATIC FRESH AND VARIATION TOOLS. Assign outputs in order to visibly different social-native creative families: Output 1 editorial feed composition with asymmetric grid and useful negative space; Output 2 conceptual or surreal product metaphor; Output 3 product-as-architecture or branded world; Output 4 tactile mixed-media, cut-paper or crafted collage; Output 5 benefit-led graphic-symbol story using supplied facts only; Output 6 restrained material and texture study; Output 7 believable human-use micro-story only when category-appropriate; Output 8 optical, kinetic or experimental feed composition. Each family must still read as a modern Instagram post, not a print poster. Change the core idea, spatial logic, content rhythm, product placement and art direction—not merely the background. Never choose the same family twice in a requested batch. For supplement products, gym walls, dumbbells, shaker bottles, sports balls, towels, benches, fruit piles and motivational wall slogans are prohibited unless explicitly requested.',L="PIXEL-LOCKED PRODUCT SOURCE — FINAL AUTHORITY. The uploaded product is an immutable source layer, not a prompt reference to redraw. In the default Pixel-Locked Composite mode, retain its original pixels and complete silhouette exactly. Do not regenerate, reconstruct, inpaint, retouch, relight, recolor, stretch, squash, bend, morph, mesh-warp, perspective-warp or change any part of the product, container, lid, cap, label, logo or printed text. Create the background and design around a reserved product-shaped area, then composite the unchanged source product into it. Only aspect-ratio-locked uniform scale and translation are allowed by default. Add contact shadows, cast shadows, reflections, rim separation and foreground overlap on separate layers outside the product source. Show the full product silhouette unless the current request explicitly asks for a crop. If the supplied view cannot fit the requested perspective, keep the supplied view or ask for the correct angle; never invent hidden geometry.",C="CONFLICT RULE. The user's explicit current request outranks the selected preset.",I="INSTAGRAM SOCIAL-CONTENT BLUEPRINT — POSITIVE CONSTRUCTION RULE. Build a complete 1080×1350 vertical 4:5 feed design, not a photograph with text added afterward. Use four coordinated zones: (1) a high-impact typographic hook with deliberate line breaks and scale contrast; (2) an asymmetric product-hero zone occupying roughly 35–55% of the canvas; (3) a clearly visible information system occupying roughly 20–35% of the canvas with one to three compact fact cards, metric tiles, icon modules, comparison bars or labelled callouts using exact facts only; and (4) micro-labels, framing or a restrained supplied CTA that completes the composition. Use two to five coordinated 2D devices—such as directional bands, blocks, frames, masks, rules, patterns, texture fields or data containers—that share one visual language. A photograph or CGI scene may support the design, but it can never be the entire undivided canvas.",G="INSTAGRAM CONTENT PRE-FLIGHT — REBUILD UNTIL ALL PASS. The output must read as a premium designed Instagram post at phone size; contain strong accurate readable typography; preserve the exact product; use a purposeful asymmetric grid; include a coordinated graphic system, one to three useful information modules and visible foreground/background depth; and differ structurally from every other requested variation. Reject and rebuild any simplistic product-plus-headline layout, empty minimal canvas, centered packshot, product-on-pedestal image, cinematic beauty shot, static title poster, giant duplicate package, decorative 3D room, generic glossy scene, text-free image, tiny unreadable copy, arbitrary shapes, background swap or layout with no designed content architecture.";
const O="UNIVERSAL DELIVERY LOCK. Follow the selected product count, Separate/Together arrangement and outputs-per-product exactly. Every output is independent and standalone; never create a collage unless explicitly requested. Use current-turn assets only. Preserve source identity and facts. In a multi-output batch, every variation must belong to a different content family and use a genuinely different campaign idea, communication angle, headline, supporting-point architecture, grid, type composition, information-module system and art direction. Never generate one master creative and reskin it.";
const H="HUMAN STUDIO AUTHENTICITY — FINAL VISUAL STANDARD. Make the result feel deliberately art-directed, photographed, typeset and finished by an experienced human creative team. Clean must mean controlled and legible, never empty, generic or under-designed. Begin with one strong communication idea, then build a purposeful asymmetric composition with a controlled professional type hierarchy, coordinated graphic system, compact information modules, tactile detail and believable depth. Prefer coherent perspective, controlled color, optical spacing and material realism. Default to bright commercial art direction unless dark or cinematic styling is explicitly requested. Typography must remain professional and brand-appropriate: no playful, bubbly, rounded novelty, graffiti, comic, handwritten, signature, psychedelic, warped, quirky or decorative display fonts unless the current brief explicitly requests that exact style. Reject generic glossy CGI, default neon glow, random floating elements, particles, smoke, splashes, centered-pedestal symmetry, perfect plastic surfaces, fake bokeh, excessive sharpening, impossible reflections, uncanny people, pseudo-fonts and decorative spectacle.";
const Y={"auto":["Professional Auto · category smart","Choose only a professional, brand-appropriate typography system: modern grotesk or geometric sans for most commercial work, a disciplined condensed sans for bold campaigns, or a refined editorial serif paired with a neutral sans when the category genuinely suits it. Never choose novelty, playful, bubbly, handwritten, signature, graffiti, comic, psychedelic, quirky or decorative fonts."],"poster":["Bold Professional Sans","Use Inter Tight, Archivo Narrow, Roboto Condensed, Neue Haas Grotesk or a comparable professional condensed sans. Create impact through scale, weight, line breaks and spacing—not through distorted or novelty lettering."],"editorial":["Editorial Serif + Sans","Use Playfair Display or Georgia for a restrained editorial headline paired with Inter, Inter Tight, Helvetica Neue or DM Sans for supporting information. Keep the serif refined, readable and non-ornamental."],"modern":["Modern Grotesk","Use Inter, Inter Tight, Neue Haas Grotesk, Helvetica Neue, Archivo, DM Sans, Manrope or Sora with precise spacing, contemporary proportions and disciplined commercial hierarchy."]};
const FM={"instagram":["Instagram Creative · 4:5","Create a finished 1080×1350 Instagram feed content design. The selected tool is only a visual technique inside the social layout; it must not determine the entire output."],"infographic":["Instagram Infographic · 4:5","Create a finished 1080×1350 information-led Instagram creative. Make facts, information cards, icons, dividers and visual explanation central to the composition while keeping the exact product integrated."],"native":["Native Tool Output","Return the selected tool's native deliverable without an Instagram wrapper. Still obey product count, source identity, real typography, human finish and separate-output rules."]},CL={"clean":["Minimal Copy · hook + 1 fact","Use one short two-to-five-word hook plus one exact supplied or clearly readable fact. This controls copy quantity only; the composition must still feel fully art-directed."],"light":["Lean Copy · name + 1 fact","Use the exact supplied brand/product name plus one exact supplied or clearly readable fact. Add micro-labels only when they improve the hierarchy."],"balanced":["Designed Copy · hook + 2–3 facts","Use one short hook plus two or three exact supplied or clearly readable facts, arranged as designed metric cards, callouts or information modules. Use a CTA only when supplied."],"rich":["Infographic Copy · 4–6 facts","Use one short hook plus four to six exact supplied or clearly readable facts in a disciplined infographic hierarchy. Never invent facts to fill space."]};
const DS={"auto":["Auto Fresh · No Repeat","Choose a category-relevant unused design system for every output and never repeat the same grid or type architecture in a batch."],"editorial-cutout":["Editorial Cutout","Magazine-style asymmetric composition with dramatic cropped photography, subject windows and small precision details."],"benefit-infographic":["Benefit Infographic","Clean product-led information design with visible benefit cards, icons, callouts and mobile hierarchy."],"bold-type-integration":["Bold Type Integration","Oversized typography becomes an architectural design element that interacts with the product."],"minimal-spatial":["Minimal Spatial","Premium negative-space design with precise alignment, subtle material depth and a few confident details."],"brand-pattern-system":["Brand Pattern System","Product-specific labels, strips, repeating words and modular brand marks create an energetic feed identity."],"miniature-brand-world":["Miniature Brand World","A believable small brand world turns product form or category meaning into a narrative environment."],"contextual-story":["Contextual Story","A bright real-world or seasonal micro-story connects the product to a human situation or occasion."],"premium-natural":["Premium Natural","Ingredient and material storytelling with tactile surfaces, organic forms and elegant benefit structure."],"energetic-commercial":["Energetic Commercial","Bold brand-color campaign with dynamic scale, directional movement and high-impact retail readability."],"data-callout":["Data & Callout Story","Structured feature explanation uses numbers, comparison bars and diagram-like callouts as the main visual hook."],"crafted-layer":["Crafted Layered","Tactile paper, torn-edge, cut-shape and print textures create a recognizably hand-designed social composition."],"surreal-metaphor":["Surreal Metaphor","One clear product-relevant visual metaphor creates memorability while the layout remains commercially readable."]};
const PL={"exact-composite":["Pixel-Locked Composite","Use the uploaded product as an immutable pixel source. Isolate it as a clean cutout and composite those original pixels into the final design. Do not redraw, regenerate, reconstruct, inpaint, relight, recolor, retouch or reinterpret any pixel inside the product silhouette."],"geometry-locked":["Geometry-Locked New View","Reconstruct only the requested view while locking the exact silhouette ratios, cross-section, height-to-width ratio, lid/cap dimensions, shoulder profile, base, material, label placement and all visible identity details. Use multiple supplied angles when available. If confidence is insufficient, do not generate the new view; request an appropriate reference."],"authorized-redesign":["Authorized Packaging Redesign","Change only the specifically authorized packaging components. Preserve protected brand names, factual copy, dimensions and structural constraints unless the user explicitly authorizes those changes."]};
const AR={"premium":["Premium Designed · default","Create a sophisticated agency-level Instagram composition with a strong professional type hierarchy, deliberate asymmetry, two to five coordinated graphic devices, one to three compact information modules, tactile texture and believable spatial depth. Clean means controlled—not sparse."],"minimal":["Minimal Editorial","Use restraint and generous space, but retain editorial tension, precise type architecture, one confident graphic device and at least one useful information module. Never reduce the post to a plain packshot plus headline."],"expressive":["Bold Campaign","Use oversized professional condensed or grotesk typography, dynamic scale, directional brand-color geometry, controlled texture, layered product interaction and two or three information modules. Keep one visual language and strong phone-size readability; energy must not become clutter."]};
const Q="PROFESSIONAL TYPOGRAPHY LOCK — FINAL FONT AUTHORITY. Use the exact supplied wording and selected content level. Render all added copy as a separate clean 2D typesetting layer using no more than two named professional font families and three weights. Default to Inter, Inter Tight, Neue Haas Grotesk, Helvetica Neue, Archivo, Archivo Narrow, Roboto Condensed, DM Sans, Manrope or Sora. Use Playfair Display or Georgia only for a restrained editorial contrast when the category suits it. Create personality through scale, weight, line breaks, tracking, alignment and product interaction—not through funky fonts. Prohibit playful, bubbly, balloon, overly rounded novelty, graffiti, comic, hand-drawn, handwritten, signature, script, psychedelic, warped, distorted, quirky, retro-novelty and ornamental display fonts unless the user's current brief explicitly requests that exact typography style. Never replace required copy with a text-free cinematic image. Check every word character by character and regenerate or correct any misspelling, pseudo-font, distorted glyph, fake logo or random microcopy before delivery. Original product-label typography remains unchanged.";
const N='FRESH CONCEPT ENGINE — HIGHEST PRIORITY FOR CREATIVE WORK. FRESH DESIGN means a genuinely new campaign idea and visual system, never the same product shot with a replaced background, recolored props or extra decoration. Before generating, silently define a one-sentence named concept proposition for every output that connects an authentic product cue to an original visual metaphor, mechanism, story or art-direction idea. A concept must be explainable as an idea, not merely as a list of objects. The uploaded product reference exists only for exact product fidelity and must never be treated as a background plate. Use design references as principle sources only: actively extract their typography character, hierarchy, grid logic, scale contrast, negative-space strategy, color rhythm, texture and finish; never copy their background, subject arrangement, props or composition. REFERENCE UTILIZATION AUDIT. Product references must control fidelity; copy references must control exact wording; font references must control actual type selection and typographic structure; design references must control visual principles. Do not ignore an attached reference, and do not merely paste the product onto a reference-like scene. Reject category clichés unless explicitly requested: supplements in a routine gym with dumbbells, towel and shaker; cosmetics surrounded by generic flowers, silk or water; food products with a simple scattered-ingredient pile; any product centered on a pedestal or table with random props; generic neon gradients, smoke, splashes, floating particles or empty studio backdrops used as the whole idea. Every concept must make deliberate new decisions across at least ten axes: campaign idea or metaphor, setting or world, composition and grid, product scale and placement, camera and crop, lighting and time, material or graphic language, typography system, supporting elements and color balance. Across a batch, no two outputs may reuse the same core idea, background, hero placement, prop family or typography composition. Before delivery, apply a freshness test: if the result can be summarized as product in a category background, if removing the background removes the only difference, or if it resembles a previous output with cosmetic changes, reject it and rebuild from a new concept. Return only the finished creative, never the internal concept notes.';
const F=[['Signature CGI Concepts','/cgihero','Campaign CGI Hero','Premium fail-safe CGI hero.'],['FOOH & Experiential','/fakeooh3d','Fake OOH / FOOH','Photoreal impossible public installation.'],['Transformations & Kinetics','/morphworld3d','World Morph','Environment transforms while product stays exact.'],['Materials & Simulation','/glassworld3d','Glass World','Premium glass spatial world.'],['Environment Themes','/forest3d','Forest','Premium forest CGI environment.'],['Environment Themes','/city3d','Modern City','Modern urban CGI environment.'],['Environment Themes','/country3d','Country / Culture','Country-specific environment when supplied.']];
const FB='virag.browser.fallback.',legacyGet=typeof GM_getValue==='function'?GM_getValue:null,legacySet=typeof GM_setValue==='function'?GM_setValue:null,legacyList=typeof GM_listValues==='function'?GM_listValues:null,legacyDelete=typeof GM_deleteValue==='function'?GM_deleteValue:null,legacyXHR=typeof GM_xmlhttpRequest==='function'?GM_xmlhttpRequest:null,modernList=typeof globalThis.GM?.listValues==='function'?globalThis.GM.listValues.bind(globalThis.GM):null,modernDelete=typeof globalThis.GM?.deleteValue==='function'?globalThis.GM.deleteValue.bind(globalThis.GM):null,modernXHR=typeof globalThis.GM?.xmlHttpRequest==='function'?globalThis.GM.xmlHttpRequest.bind(globalThis.GM):null
const gv=(k,d=null)=>{try{if(legacyGet)return legacyGet(k,d);const v=localStorage.getItem(FB+k);return v===null?d:JSON.parse(v)}catch{return d}},sv=(k,v)=>{try{if(legacySet)return void legacySet(k,v);localStorage.setItem(FB+k,JSON.stringify(v))}catch{}},req=u=>new Promise((o,n)=>{const url=u+(u.includes('?')?'&':'?')+'v='+Date.now(),done=r=>{try{const status=Number(r?.status||200);if(status<200||status>299)throw new Error('HTTP '+status);const body=typeof r?.responseText==='string'?r.responseText:typeof r?.response==='string'?r.response:JSON.stringify(r?.response);o(JSON.parse(body))}catch(e){n(e)}},xhr=legacyXHR||modernXHR;if(xhr){try{const p=xhr({method:'GET',url,timeout:15000,headers:{Accept:'application/json'},onload:done,onerror:n,ontimeout:n});if(p?.catch)p.catch(n)}catch(e){n(e)}return}if(typeof fetch==='function'){fetch(url,{method:'GET',cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}}).then(async r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(o,n);return}n(new Error('No supported request API'))}),iev=t=>{try{return new InputEvent('input',{bubbles:true,inputType:'insertText',data:t})}catch{return new Event('input',{bubbles:true})}},repl=(e,n)=>{if(typeof e.replaceChildren==='function')e.replaceChildren(n);else{while(e.firstChild)e.removeChild(e.firstChild);e.appendChild(n)}},nm=c=>{c=String(c||'').trim();return c?(c[0]=='/'?c:'/'+c):''};
async function cleanupLegacyCaches(){const stale=k=>/^virag\.v\d+\./.test(String(k))&&!String(k).startsWith(K);try{const keys=legacyList?legacyList():modernList?await modernList():[];for(const k of keys||[])if(stale(k)){if(legacyDelete)legacyDelete(k);else if(modernDelete)await modernDelete(k)}}catch{}try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i),raw=k?.startsWith(FB)?k.slice(FB.length):'';if(stale(raw))localStorage.removeItem(k)}}catch{}}
let S={l:{},v:{},m:'Creative',g:'All',q:'',d:new Set(),sync:0,br:null,bv:'?',mods:{},h:null,s:null,p:null,to:null,batch:null,refs:[],pc:Math.min(20,Math.max(1,+gv('virag.plan.products',1)||1)),cc:Math.min(10,Math.max(1,+gv('virag.plan.outputs.v115',1)||1)),am:gv('virag.plan.arrangement','separate')==='together'?'together':'separate',ty:Y[gv('virag.plan.type','auto')]?gv('virag.plan.type','auto'):'auto',fm:FM[gv('virag.plan.format','instagram')]?gv('virag.plan.format','instagram'):'instagram',cl:CL[gv('virag.plan.content.v114','balanced')]?gv('virag.plan.content.v114','balanced'):'balanced',ar:AR[gv('virag.plan.richness.v114','premium')]?gv('virag.plan.richness.v114','premium'):'premium',ds:DS[gv('virag.plan.design','auto')]?gv('virag.plan.design','auto'):'auto',pl:PL[gv('virag.plan.productlock','exact-composite')]?gv('virag.plan.productlock','exact-composite'):'exact-composite'};T.forEach(t=>{S.l[t]=new Map;S.v[t]='?'});
try{S.br=JSON.parse(gv(K+'brain','null'));S.bv=String(S.br?.libraryVersion||'?')}catch{}
const row=(r,t,g='')=>r?.cmd?{id:+r.id||0,tab:t,group:g,cmd:nm(r.cmd),label:String(r.label||r.cmd),desc:String(r.desc||''),ins:String(r.instruction||r.prompt||r.desc||r.label||r.cmd)}:null;
function lr(t,j){const m=new Map;for(const r of j?.commands||[]){const x=row(r,t);if(x)m.set(x.cmd.toLowerCase(),x)}if(!m.size)return 0;S.l[t]=m;S.v[t]=String(j.libraryVersion||'?');return 1}
function ld(g,j){let n=0;for(const r of j?.commands||[]){const x=row(r,'3D',g);if(x){S.l['3D'].set(x.cmd.toLowerCase(),x);n++}}if(n){S.d.add(g);S.v['3D']=String(j.libraryVersion||S.v['3D']);return 1}return 0}
function fb(){if(S.l['3D'].size)return;F.forEach((r,i)=>{const x={id:i+1,tab:'3D',group:r[0],cmd:r[1],label:r[2],desc:r[3],ins:'Create one finished static CGI campaign using this mechanism while preserving the exact current product and current brief.'};S.l['3D'].set(x.cmd,x)});S.v['3D']='FALLBACK'}
try{const j=JSON.parse(gv(K+'Creative','null'));if(j)lr('Creative',j)}catch{}for(const id of CORE_MODS){try{const j=JSON.parse(gv(K+'module_'+id,'null'));if(j)S.mods[id]=j}catch{}}fb();
async function sy(man=0,base=1){
if(S.sync)return 0;S.sync=1;st(base?'SYNCING DAILY MODULES':'LOADING '+S.m.toUpperCase());let a=0,b=0,extraOk=0,manifest=null,mods=[];
try{
const rt=U[S.m]?[S.m]:[],dd=S.m==='3D'?D:[],z=await Promise.allSettled([...rt.map(t=>req(U[t])),...dd.map(x=>req(x[1])),...(base?[req(BRAIN),req(MAN)]:[])]);
rt.forEach((t,i)=>{const r=z[i];if(r.status==='fulfilled'&&lr(t,r.value)){sv(K+t.replace(/\s/g,'_'),JSON.stringify(r.value));a++}});
if(dd.length){const old=[new Map(S.l['3D']),S.v['3D'],new Set(S.d)];S.l['3D']=new Map;S.v['3D']='?';S.d.clear();dd.forEach(([g],i)=>{const r=z[rt.length+i];if(r.status==='fulfilled'&&ld(g,r.value)){sv(K+'3D_'+g.replace(/\W+/g,'_'),JSON.stringify(r.value));b++}});if(!S.l['3D'].size){[S.l['3D'],S.v['3D'],S.d]=old;fb()}}
if(base){const br=z[rt.length+dd.length];if(br?.status==='fulfilled'){S.br=br.value;S.bv=String(br.value?.libraryVersion||'?');sv(K+'brain',JSON.stringify(br.value))}
const mr=z[rt.length+dd.length+1];if(mr?.status==='fulfilled'){manifest=mr.value;sv(K+'manifest',JSON.stringify(manifest))}else{try{manifest=JSON.parse(gv(K+'manifest','null'))}catch{}}
mods=Array.isArray(manifest?.modules)?manifest.modules.filter(m=>m?.file&&m.type!=='userscript'&&CORE_MODS.has(m.id)):[];
const ez=await Promise.allSettled(mods.map(m=>req(R+m.file)));mods.forEach((m,i)=>{const r=ez[i];if(r.status==='fulfilled'){S.mods[m.id]=r.value;sv(K+'module_'+m.id,JSON.stringify(r.value));extraOk++;try{localStorage.setItem('virag.module.'+m.id+'.version',String(r.value?.libraryVersion||r.value?.version||m.version||'?'))}catch{}}});
try{localStorage.setItem('virag.core.version',V);localStorage.setItem('virag.brain.version',S.bv);localStorage.setItem('virag.lastSync',new Date().toISOString())}catch{}}
}catch(e){}
finally{S.sync=0}
const tabOk=S.m==='3D'?b===D.length:a===(U[S.m]?1:0),healthy=tabOk&&(!base||!!S.br&&extraOk===mods.length);
st(healthy?(base?'DAILY SYNCED':'READY · '+S.m.toUpperCase()):'READY · PARTIAL SYNC');rd();
if(man)toast(`MODULES CHECKED · ACTIVE ${S.m} · BRAIN ${S.bv} · ${extraOk} CORE RULES LIVE`,!healthy);return healthy
}
function vis(e){if(!e||!e.isConnected)return 0;const r=e.getBoundingClientRect?.();return !!(r&&r.width>20&&r.height>12)}function ed(){for(const s of ['#prompt-textarea','[data-testid="composer-input"]','textarea[data-testid="prompt-textarea"]','[data-lexical-editor="true"][contenteditable="true"]','div.ProseMirror[contenteditable="true"]','[contenteditable="true"][role="textbox"]','form textarea','main textarea'])for(const e of document.querySelectorAll(s))if(vis(e)&&!e.closest('[aria-hidden="true"]'))return e;return null}const read=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||e?.textContent||'');
function wr(e,t){if(!e)return 0;try{e.focus({preventScroll:true})}catch{}if(e.tagName==='TEXTAREA'){const p=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;p?p.call(e,t):e.value=t;e.dispatchEvent(iev(t));return 1}try{const s=getSelection(),r=document.createRange();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);const ok=document.execCommand(t?'insertText':'delete',false,t||'');s.removeAllRanges();if(ok)return 1;repl(e,document.createTextNode(t));e.dispatchEvent(iev(t));return 0}catch{return 0}}
const norm=v=>String(v||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim(),wait=ms=>new Promise(r=>setTimeout(r,ms));
function base(){const e=ed();if(!e)return'';const known=new Set;T.forEach(t=>S.l[t].forEach((_,k)=>known.add(k)));return read(e).replace(/(?:^|\n)\s*\/[A-Za-z0-9_-]*\s*$/,'').replace(/\/[A-Za-z0-9_-]+/g,m=>known.has(m.toLowerCase())?'':m).replace(/[ \t]{2,}/g,' ').trim()}
const total=()=>S.am==='together'?S.cc:S.pc*S.cc;
function cleanref(v){
  let x=String(v||'').replace(/\s+/g,' ').trim();
  x=x.replace(/^(?:remove|delete)\s+(?:file|attachment|image)\s*[:\-]?\s*/i,'').replace(/\s+(?:remove|delete)$/i,'').trim();
  if(!x||x.length<2||x.length>200||/^(?:remove|delete|file|attachment|image|upload|preview|close|edit|show more)$/i.test(x))return'';
  return x
}
function capturetagrefs(e){
  const scope=e?.closest?.('form')||e?.parentElement||document,refs=[],seen=new Set();
  const add=v=>{const x=cleanref(v),k=x.toLowerCase();if(x&&!seen.has(k)){seen.add(k);refs.push(x)}};
  const nodes=scope.querySelectorAll('[data-testid*="attachment"],[data-testid*="file"],[data-testid*="mention"],[data-lexical-decorator="true"],[contenteditable="false"],button[aria-label*="Remove file" i],button[aria-label*="Remove attachment" i]');
  for(const n of nodes){
    const values=[n.getAttribute?.('data-filename'),n.getAttribute?.('aria-label'),n.getAttribute?.('title'),n.querySelector?.('img')?.alt,n.innerText,n.textContent];
    const preferred=values.find(v=>/\.(?:png|jpe?g|webp|gif|avif|heic|heif|bmp|tiff?)\b/i.test(String(v||'')))||values.find(v=>cleanref(v));
    if(preferred)add(preferred)
  }
  for(const input of document.querySelectorAll('input[type="file"]'))for(const f of [...(input.files||[])])add(f.name);
  const text=String(read(e)||''),files=text.match(/[^\n,;]{2,160}\.(?:png|jpe?g|webp|gif|avif|heic|heif|bmp|tiff?)/gi)||[];
  files.forEach(add);
  return refs.slice(0,S.pc)
}
function plan(x){const p=S.pc,c=S.cc,n=total(),k={Creative:'Instagram feed post',Flyer:'flyer','3D':'CGI/3D Instagram feed post',Packaging:'packaging design',Video:'video deliverable'}[x.tab]||'output',img=x.tab!=='Video',refs=`Group alternate angles or reference photos of the same item as one product, then assign the ${p} distinct products in upload order as Product 1 through Product ${p}.`;if(S.am==='together')return`USER-SELECTED OUTPUT PLAN — HIGHEST PRIORITY. PRODUCT LAYOUT: TOGETHER. The user selected exactly ${p} distinct product${p===1?'':'s'} together in each creative and exactly ${c} combined ${k} variation${c===1?'':'s'}, requiring exactly ${n} separate output${n===1?'':'s'} in total. ${refs} Every output must include all ${p} selected product${p===1?'':'s'} together in one unified, integrated composition with one shared scene, layout and art direction. Preserve every product accurately; never omit, replace, merge or duplicate one. ${img?'Generate every variation as its own separate full-frame image. Multiple products sharing one integrated composition is intentional and is not a collage. Never split the products into panels, tiles, frames, grids, contact sheets or separate canvases inside one image.':''} When more than one variation is requested, each additional variation must use a different named campaign idea and change at least ten major creative-direction decisions while preserving the same products, brand identity, supplied facts and requested aspect ratio. Number the outputs internally and route every output to a different concept family; do not generate one master scene and derive variants from it. If the supplied distinct products are fewer than ${p}, do not invent or duplicate products; ask for the missing product references before generating.`;return`USER-SELECTED OUTPUT PLAN — HIGHEST PRIORITY. PRODUCT LAYOUT: SEPARATE. The user selected exactly ${p} distinct product${p===1?'':'s'} and exactly ${c} ${k}${c===1?'':'s'} per product, requiring exactly ${n} separate output${n===1?'':'s'} in total. ${refs} Generate exactly ${c} standalone ${k}${c===1?'':'s'} for Product 1, then exactly ${c} for each following product in order until all ${n} outputs are complete. Each output must contain only its assigned product. ${img?'Every output must be generated as its own separate full-frame image. Never combine products or outputs into a collage, grid, contact sheet, split-screen, multi-panel canvas or preview board.':''} When more than one output is requested for a product, every additional output must use a different named campaign idea and change at least ten major creative-direction decisions while preserving that exact product, brand identity, supplied facts and requested aspect ratio. Number the outputs internally and route every output for that product to a different concept family; do not generate one master scene and derive variants from it. If the supplied distinct products are fewer than ${p}, do not invent or duplicate products; ask for the missing product references before generating.`}
function queue(x){
  const p=S.pc,c=S.cc,n=total();
  if(n<=1)return'';
  const image=['Creative','Flyer','3D','Packaging'].includes(x.tab);
  const families=S.fm==='native'
    ?['Native concept A','Native concept B','Native concept C','Native concept D','Native concept E','Native concept F','Native concept G','Native concept H']
    :['Visual Campaign Creative','Benefit Infographic','Editorial Creative','Contextual Story Creative','Data & Callout Creative','Crafted/Tactile Creative','Art-Directed CGI Creative','Bold-Type Campaign Creative'];
  const rows=[];
  let id=1;
  if(S.am==='together'){
    for(let j=1;j<=c;j++)rows.push(`${id++}. OUTPUT ${id-1}/${n} — Products 1–${p} TOGETHER — Variation ${j}/${c} — ${families[(j-1)%families.length]}.`);
  }else{
    for(let i=1;i<=p;i++)for(let j=1;j<=c;j++)rows.push(`${id++}. OUTPUT ${id-1}/${n} — Product ${i} ONLY — Variation ${j}/${c} — ${families[(j-1)%families.length]}.`);
  }
  return`MULTI-PRODUCT GENERATION QUEUE — NON-NEGOTIABLE HIGHEST PRIORITY. This request contains ${p} distinct product${p===1?'':'s'} and requires ${n} separate deliverable${n===1?'':'s'}. Do not treat it as one image request. Before the first generation, silently inspect all current-turn uploads and build a PRODUCT MAP in upload order. Group alternate angles of the same SKU as one product; use visible product name, label, colourway and packaging geometry to keep every product identity distinct. Never default every row to Product 1 and never choose only the easiest product.

EXECUTION CONTRACT. Act as the batch controller. Execute the queue sequentially from OUTPUT 1/${n} through OUTPUT ${n}/${n}. For each queue row, make exactly one separate ${image?'image-generation call':'generation or deliverable-construction step'} using only that row's assigned product${S.am==='together'?' set':''}. Complete and deliver that standalone result, record the row as complete, then continue automatically to the next row. Do not send the entire queue into one generation call. Do not stop after the first result. A written plan, prompt list, collage, contact sheet, multi-panel board or one image containing several requested outputs does not count. The response is incomplete until all ${n} queue rows have produced ${n} separate deliverables.

QUEUE
${rows.join('\n')}

REFERENCE ROUTING. For each separate-product row, use only the current-turn source image or grouped alternate views assigned to that Product number. Other uploaded products may be consulted only to identify the product map; they must not replace, merge with or appear in that row. For Together rows, include every mapped product once. If the platform offers selectable image references, attach only the assigned product group for that row. Keep a silent completion ledger and verify Product 1 through Product ${p} each received exactly ${c} deliverable${c===1?'':'s'} before ending.`;
}
function copydiversity(x){const c=S.cc;if(c<=1)return'';const scope=S.am==='together'?'the combined product set':'each product';return`MULTI-OUTPUT COPY + STYLE DIVERSITY LOCK — HIGHEST PRIORITY. The user requested exactly ${c} variations for ${scope}. Before generating, silently create a variation matrix with one independent row per output covering: communication angle, exact headline, supporting facts or pointers, copy hierarchy, information-module form, grid skeleton, product placement, typography architecture, palette, texture and graphic devices. Every row must be visibly and verbally different. Do not repeat the same headline, headline opening phrase, pointer sequence, fact-card labels, copy order, layout skeleton, type composition or campaign idea in two outputs. Use different truthful emphases drawn only from the current request and clearly readable product-label facts: product identity, distinct verified features, supplied usage context, supplied metric or proof, or neutral non-claim brand language. Repeating the immutable brand or product name is allowed. A fixed CTA or legally required line may repeat only when supplied as mandatory copy. If too few verified facts exist, vary hierarchy, wording that does not change meaning, and visual storytelling instead of inventing claims. Even when the same approved font family is retained, change the type scale, line breaks, alignment and interaction with the product. Output 2 must not look or read like a reskin of Output 1; each later output must pass an explicit duplicate-copy and duplicate-layout rejection check.`}
function familydiversity(x){const c=S.cc;if(c<=1)return'';if(S.fm==='native')return`NATIVE MULTI-OUTPUT FAMILY ROUTER — HIGHEST PRIORITY. Create ${c} independent native ${x.tab} solutions for each product or combined product set. Give every output a different solution type, communication structure, composition, typography architecture and presentation system. Do not force an Instagram infographic wrapper in Native mode, but never repeat the same native format or reskin the first output.`;if(x.tab==='Video')return`MIXED REEL FORMAT ROUTER — HIGHEST PRIORITY. Route each requested video to a different Reel family before choosing its shots: Output 1 = narrative visual campaign Reel; Output 2 = motion-infographic Reel with verified facts; Output 3 = editorial product film; Output 4 = contextual-use story; Output 5 = data/callout Reel; Output 6 = tactile craft film; Output 7 = art-directed CGI Reel; Output 8 = bold kinetic-type Reel. Use unused compatible families before repeating. Each Reel must have different storytelling, copy rhythm, title-card architecture, shot design and motion language.`;return`MIXED INSTAGRAM FORMAT ROUTER — HIGHEST PRIORITY FOR MULTIPLE OUTPUTS. Treat the selected Output Format as the shared Instagram channel and aspect ratio, not permission to clone one post type. For each product or combined product set, assign every output to a different standalone social-content family in this order: Output 1 = VISUAL CAMPAIGN CREATIVE, led by one memorable product-specific visual idea, strong professional headline and only compact supporting facts; Output 2 = BENEFIT INFOGRAPHIC, led by verified information cards, callouts, metric tiles or diagram modules and a different headline; Output 3 = EDITORIAL CREATIVE, led by magazine-like crop, type hierarchy and one factual pull-line; Output 4 = CONTEXTUAL STORY CREATIVE, led by a believable category-appropriate or supplied usage context; Output 5 = DATA + CALLOUT CREATIVE, led by supplied proof, comparison or metrics; Output 6 = CRAFTED/TACTILE CREATIVE; Output 7 = ART-DIRECTED CGI CREATIVE only when appropriate; Output 8 = BOLD-TYPE CAMPAIGN CREATIVE. Continue with unused compatible families before repeating. For exactly two outputs, one must be a visual campaign creative and the other a benefit infographic; they must not share the same layout skeleton, headline, pointer structure, information architecture, typography composition, product placement or graphic language. Generate each as a separate full-frame image, never as two panels or a carousel board. If the explicit current request specifies a different pair of formats, follow that pair while keeping them genuinely distinct.`}
function typo(){const y=Y[S.ty]||Y.auto;return`TYPOGRAPHY DIRECTION — ${y[0]}. ${y[1]} Use exact supplied copy and typeset it as a clean 2D layout layer. Keep existing product-label artwork untouched.`}
function format(x){const f=FM[S.fm]||FM.instagram;if(x.tab==='Video'){if(S.fm==='native')return`OUTPUT FORMAT — ${f[0]}. ${f[1]}`;return S.fm==='infographic'?'OUTPUT FORMAT — INFORMATION-LED INSTAGRAM REEL. Create a vertical 9:16 motion-design deliverable with readable exact fact cards, purposeful transitions and a coherent product story.':'OUTPUT FORMAT — INSTAGRAM REEL. Create a vertical 9:16 social-video deliverable; the selected tool is a filmmaking technique inside the Reel, not permission to return a still image.'}return`OUTPUT FORMAT — ${f[0]}. ${f[1]} ${S.fm==='native'?'':'Even when the selected tab is Flyer, 3D or Packaging, wrap its visual technique into this finished Instagram content design unless the user explicitly selects Native Tool Output.'}`}
function copyrule(){const c=CL[S.cl]||CL.balanced;return`CONTENT LEVEL — ${c[0]}. ${c[1]} First read the current composer copy and clearly visible product-label facts. Never invent a benefit, number, offer, ingredient, certification or CTA.`}
function designrule(){const lib=S.mods.design||{},all=Array.isArray(lib.designSystems)?lib.designSystems:[],pick=id=>all.find(d=>d.id===id),fallback=id=>DS[id]?.[1]||'';if(S.ds==='auto'){const seq=Array.isArray(lib.autoRouter?.sequence)&&lib.autoRouter.sequence.length?lib.autoRouter.sequence:Object.keys(DS).filter(x=>x!=='auto'),list=seq.map((id,i)=>{const d=pick(id);return`${i+1}. ${(d?.label||DS[id]?.[0]||id)} — ${d?.summary||fallback(id)}`}).join(' ');return`DESIGN DIRECTION — AUTO FRESH, NO REPEAT. Assign a different compatible design family to every requested output in order and do not reuse a family until all compatible systems are exhausted. ${list} A new design must change the idea, grid skeleton, crop, product scale/placement, type architecture, information-module shape, graphic devices, palette, texture, supporting elements, lighting and content rhythm. Reject two outputs that share the same layout skeleton.`}const d=pick(S.ds);if(!d)return`DESIGN DIRECTION — ${DS[S.ds]?.[0]||'Curated Social'}. ${fallback(S.ds)}`;return`DESIGN DIRECTION — ${d.label}. ${d.summary} LAYOUT: ${d.layout} PRODUCT: ${d.product} TYPOGRAPHY: ${d.typography} GRAPHICS: ${d.graphics} COLOR: ${d.color} INFORMATION: ${d.information} ART-DIRECTION FINISH: ${d.artDirectionFinish||d.cleanFinish||''} AVOID: ${d.avoid} Use these as design principles only; never copy a referenced brand, artwork, composition or text.`}
function trendrule(x){const t=S.mods.trends||{},date=String(t.trendDate||t.updatedAt||'latest').slice(0,10),all=Array.isArray(t.activeTrends)?t.activeTrends:[],fit=all.filter(v=>!Array.isArray(v.tabs)||v.tabs.includes(x.tab));if(!fit.length)return'';const list=fit.map((v,i)=>`${i+1}. ${v.label||v.id}: ${v.signal||''} LAYOUT ${v.layout||''} TYPE ${v.typography||''} COLOR ${v.palette||''} TEXTURE ${v.texture||''} AVOID ${v.avoid||''}`).join(' '),avoid=Array.isArray(t.globalAvoid)?t.globalAvoid.join('; '):'copying references; trend stacking; generic AI gloss; fake fonts; product deformation';return`DAILY TREND INTELLIGENCE — ${date}. ${t.selectionRule||'Choose one compatible current trend as a subtle art-direction layer and rotate trends across a batch without repetition.'} COMPATIBLE SIGNALS: ${list} GLOBAL TREND GUARDRAILS: ${avoid}. Use trends as original principles only, never as a copied template. The current brief, brand, product fidelity, readable typography and Human Studio rules always win.`}

function productrule(x){const lib=S.mods.product||{},modes=Array.isArray(lib.modes)?lib.modes:[],requested=S.pl,allowed=requested!=='authorized-redesign'||x.tab==='Packaging',id=allowed?requested:'exact-composite',m=modes.find(v=>v.id===id),fallback=PL[id]||PL['exact-composite'],workflow=Array.isArray(lib.workflow)?lib.workflow.join(' '):'Isolate the source product, reserve its silhouette in the new design, composite the unchanged source, add integration effects outside it, then compare geometry to the source.',checks=Array.isArray(lib.geometryChecklist)?lib.geometryChecklist.join(', '):'silhouette, height-to-width ratio, lid/cap, shoulder, body taper, base, label bounds, logo, colors and text';return`PRODUCT FIDELITY MODE — ${m?.label||fallback[0]} — HIGHEST PRIORITY. ${m?.rule||fallback[1]} REQUIRED WORKFLOW: ${workflow} FINAL SOURCE COMPARISON: verify ${checks}. If any product detail differs, discard the output and rebuild using the unchanged source composite. If no product is supplied in the current turn, this rule is inactive. ${requested==='authorized-redesign'&&!allowed?'Authorized Packaging Redesign is valid only in the Packaging tab; Pixel-Locked Composite is enforced here.':''}`}
function humanrule(x){const h=S.mods.human||{},cat=h.categoryRules?.[x.tab]||'',process=Array.isArray(h.process)?h.process.join(' '):'',reject=Array.isArray(h.rejectIf)?h.rejectIf.join('; '):'generic glossy CGI; default neon glow; centered pedestal symmetry; random particles or props; perfect plastic surfaces; fake bokeh; impossible reflections; pseudo-fonts; visible generative artifacts',qa=Array.isArray(h.qaChecklist)?h.qaChecklist.join(', '):'one clear idea, human-designed composition, believable physics, restrained effects, tactile detail, real readable typography and no visible generative artifacts';return`HUMAN STUDIO MODE — FINAL ART-DIRECTION AUTHORITY. ${h.globalRule||H} ${cat} ${h.typographyRule||Q} HUMAN WORKFLOW: ${process} REJECT IF PRESENT: ${reject}. FINAL HUMAN QA: verify ${qa}. If the output still looks AI-generated at first glance, discard it and rebuild with simpler, more believable art direction. Never weaken the pixel-locked product rule.`}

function cleanrule(x){const c=S.mods.clean||{},budget=c.contentBudgets?.[S.cl]||c.contentBudgets?.clean||'Use one short hook and no more than two exact supporting facts.',cat=c.categoryRules?.[x.tab]||'',fonts=c.fontSystem?.rule||'Typeset exact copy as a separate clean 2D layer using no more than two real professional font families and three weights.',layout=c.layoutSystem||{},reject=Array.isArray(c.rejectIf)?c.rejectIf.join('; '):'too much text; competing focal points; fake typography; random decorative shapes; clutter; visible AI artifacts',qa=Array.isArray(c.qaChecklist)?c.qaChecklist.join(', '):'two-second clarity, one focal point, whitespace, short exact copy, real typography, unchanged product';return`CLEAN HUMAN DESIGN MODE — FINAL OUTPUT AUTHORITY. ${c.globalRule||'Use one clear idea, one dominant focal point, generous breathing room, optical alignment and restrained effects.'} CONTENT BUDGET: ${budget} CATEGORY: ${cat} TYPOGRAPHY: ${fonts} LAYOUT: ${layout.spacing||''} ${layout.graphicBudget||''} ${layout.colorBudget||''} REJECT IF PRESENT: ${reject}. FINAL CLEAN QA: verify ${qa}. If any trend, preset or effect makes the result busy, generic or AI-looking, remove it. Never weaken product fidelity, factual accuracy or separate-output rules.`}

function artdirectionrule(x){const a=AR[S.ar]||AR.premium,cat={Creative:'Build a complete social composition with professional typography with strong scale contrast, product interaction, information design and campaign-level finish.',Flyer:'Use a strong promotional hierarchy, dynamic reading path and clearly grouped information without template stiffness.','3D':'Use CGI as one art-directed layer inside a finished social design; add real typography, graphic architecture and useful information.',Packaging:'Present packaging through an art-directed launch system with shelf-aware hierarchy, material detail and designed callouts.',Video:'Carry the selected richness into frames, title cards, transitions and motion-graphic information systems.'}[x.tab]||'';return`DESIGN RICHNESS — ${a[0]} — FINAL COMPOSITION AUTHORITY. ${a[1]} ${cat} Build depth through overlapping planes, crop tension, directional rhythm, scale contrast, tactile texture and precise micro-details where relevant. Every element must belong to one coherent system. If the result feels basic, like a template, or like a product image with text placed around it, discard it and rebuild. If a current-turn reference is supplied, extract its design density, hierarchy, grid tension, type scale, shape language and finish—but never copy its content or exact composition. Product fidelity, factual accuracy and readable typography remain locked.`}
function humancreativerule(x){const h=S.mods.human||{},c=h.compositionSystem||{},t=h.humanTypographySystem||{},gate=Array.isArray(h.finalProductionGate)?h.finalProductionGate.join(', '):'human agency finish, Instagram readability, fresh product-specific idea, professional typography, useful information design, exact unchanged product, no generative artifacts, separate standalone output',reject=Array.isArray(h.negativeAesthetic)?h.negativeAesthetic.join('; '):'AI-looking product render; cinematic image with text added; basic product plus headline; fake fonts; random effects; empty minimalism; repeated template';return`HUMAN-MADE CREATIVE MASTER LOCK — LAST VISUAL AUTHORITY. ${h.humanCreativeMaster||'Create a complete campaign-ready Instagram composition that looks concepted, art-directed, typeset and finished by an experienced human graphic-design team—not generated by AI.'} APPLY TO: ${x.tab}. COMPOSITION SYSTEM: ${c.rule||'Use one strong product-and-headline relationship, purposeful asymmetry, one to three useful information modules, two to five coordinated graphic devices, controlled overlaps, tactile texture and believable foreground/background depth.'} TYPOGRAPHY SYSTEM: ${t.rule||'Typeset exact supplied copy with a maximum of two named professional font families and three weights; use confident scale contrast, deliberate line breaks, optical kerning and accurate glyphs.'} FRESHNESS: ${h.freshnessRule||'Build a genuinely new product-specific idea and change the grid, crop, product placement, type architecture, information geometry, graphic language, palette, texture and spatial rhythm for every variation.'} REJECT: ${reject}. FINAL PRODUCTION GATE: verify ${gate}. If the result resembles an AI render, static cinematic poster, plain packshot, basic template or product image with text placed around it, discard it and rebuild as a complete human-designed Instagram creative. Never weaken Pixel-Locked Product Fidelity, factual accuracy, current-brief lock or separate-output delivery.`}
function route(x){const auto=['/creative','/variation','/surprise'].includes(String(x.cmd||'').toLowerCase());return auto?E:'DISTINCT-CONCEPT RULE. Honor the selected creative family, but each requested output must still begin independently on a blank canvas and use a new core idea, composition, background system, product placement, supporting-element family and typographic structure. Never derive later outputs from the first generated scene.'}
function brain(x){const m=S.br?.modules||{},gen=x.tab!=='AI Tools',social=gen&&S.fm!=='native';return[m.master,m.chatgpt,social?m.instagram:'',gen?m.fresh:'',gen?m.humanAuthenticity:'',gen?m.cleanDesign:'',m.sourceLock,gen?m.typography:'',gen?m.batch:'',m.output,m.conflict].filter(Boolean).join('\n')}
function prompt(x){const b=base(),gen=x.tab!=='AI Tools',image=['Creative','Flyer','3D','Packaging'].includes(x.tab),social=image&&S.fm!=='native';return[image?Z:'',A,b?`CURRENT REQUEST\n${b}`:'CURRENT REQUEST\nUse current-turn uploads and current composer intent only.',gen?plan(x):'',gen?queue(x):'',gen?copydiversity(x):'',`SELECTED ${x.tab.toUpperCase()} TOOL — TECHNIQUE ONLY\n${x.label}: ${x.ins}`,gen?format(x):'',gen?familydiversity(x):'',gen?designrule():'',gen?trendrule(x):'',gen?copyrule():'',brain(x),B,M[x.tab],gen?O:'',gen?H:'',gen?typo():'',gen?Q:'',social?I:'',social?G:'',x.tab==='3D'?`3D SECTION\n${x.group}.`:'',gen?productrule(x):'',L,gen?humanrule(x):'',gen?cleanrule(x):'',gen?artdirectionrule(x):'',gen?humancreativerule(x):'',C].filter(Boolean).join('\n\n')}
function token(x){const e=ed();if(!e)return;const r=read(e)||'',rx=/(?:^|\n)\s*\/[A-Za-z0-9_-]*\s*$/,v=x.cmd+' ',n=rx.test(r)?r.replace(rx,m=>(m.includes('\n')?'\n':'')+v):(!r.trim()?v:r.trimEnd()+' '+v);wr(e,n);hide()}
function sb(e){
  const f=e?.closest?.('form');
  const q=[
    'button[data-testid="send-button"]',
    'button[data-testid="composer-send-button"]',
    'button[aria-label="Send prompt"]',
    'button[aria-label="Send message"]',
    'button[aria-label*="Send" i]',
    'button[type="submit"]'
  ];
  if(f)for(const s of q)for(const b of f.querySelectorAll(s))if(vis(b))return b;
  for(const s of q)for(const b of document.querySelectorAll(s))if(vis(b))return b;
  return null;
}
function batchrows(x){
  const p=S.pc,c=S.cc,rows=[];
  let id=0;
  if(S.am==='together'){
    for(let v=1;v<=c;v++)rows.push({id:++id,product:0,variation:v,products:`Products 1–${p} together`,familyIndex:v-1});
  }else{
    for(let product=1;product<=p;product++)for(let v=1;v<=c;v++){
      id++;
      rows.push({id,product,variation:v,products:`Product ${product} only`,familyIndex:c>1?v-1:id-1});
    }
  }
  return rows;
}
function rowfamily(x,row){
  const native=['Native concept','Native information solution','Native editorial solution','Native contextual solution','Native technical solution','Native tactile solution','Native spatial solution','Native bold-type solution'];
  const video=['Narrative visual campaign Reel','Motion-infographic Reel','Editorial product film','Contextual-use story','Data and callout Reel','Tactile craft film','Art-directed CGI Reel','Bold kinetic-type Reel'];
  const image=['Visual Campaign Creative','Benefit Infographic','Editorial Creative','Contextual Story Creative','Data and Callout Creative','Crafted or Tactile Creative','Art-Directed CGI Creative','Bold-Type Campaign Creative'];
  const list=S.fm==='native'?native:(x.tab==='Video'?video:image);
  return list[row.familyIndex%list.length];
}
function batchlock(x,row,pos,total,id){
  const image=['Creative','Flyer','3D','Packaging'].includes(x.tab);
  const exact=S.am==='together'?S.refs.slice(0,S.pc).join(' | '):(S.refs[row.product-1]||`attachment position ${row.product}`);
  const assigned=S.am==='together'?`all ${S.pc} tagged products together`:`Product ${row.product} only — exact tagged source: ${exact}`;
  const source=pos===0
    ?`TAGGED SOURCE REGISTRATION. The current user message still contains all ${S.pc} original product tags or attachments. Register them in visible order and use only ${assigned} for this row.`
    :`EXACT TAGGED SOURCE ROUTING. In the batch-start user message, locate the original user product whose visible attachment name or tag is exactly "${exact}". Use that original source only. Do not choose Product 1 unless that exact name is Product 1's assigned source.`;
  return`AUTOMATIC PRODUCT ROUTER — FINAL EXECUTION AUTHORITY.
RUN: ${id}
CREATIVE: ${pos+1}/${total}
ASSIGNED SOURCE: ${assigned}
VARIATION: ${row.variation}/${S.cc}
FORMAT FAMILY: ${rowfamily(x,row)}

${source}

ONE-DELIVERABLE LOCK. Execute only this creative. ${image?'Make exactly one image-generation call and return exactly one finished standalone image.':'Return exactly one finished standalone deliverable.'} Never return alternatives, a collage, contact sheet, grid, split screen, carousel board or multi-panel canvas. Preserve the assigned product exactly, include it once and exclude every unassigned product. After this response finishes, Virag will request the next tagged product automatically.`
}
function brainrow(x){
  const m=S.br?.modules||{},gen=x.tab!=='AI Tools',social=gen&&S.fm!=='native';
  return[m.master,m.chatgpt,social?m.instagram:'',gen?m.fresh:'',gen?m.humanAuthenticity:'',gen?m.cleanDesign:'',m.sourceLock,gen?m.typography:'',m.output,m.conflict].filter(Boolean).join('\n');
}
function promptrow(x,row,pos,rows,id,brief){
  const gen=x.tab!=='AI Tools',image=['Creative','Flyer','3D','Packaging'].includes(x.tab),social=image&&S.fm!=='native';
  const rowLock=batchlock(x,row,pos,rows.length,id);
  return[
    image?Z:'',
    pos===0?A:'ACTIVE TAGGED-PRODUCT RUN. Continue only the same current brief and the exact named original user attachment assigned below.',
    pos===0?B:'Never use any assistant-generated output as a reference. Resolve the assigned product from the original user-tagged sources by exact visible name.',
    brief?`ORIGINAL REQUEST\n${brief}`:'ORIGINAL REQUEST\nUse the tagged products and current Virag settings.',
    rowLock,
    `SELECTED ${x.tab.toUpperCase()} TOOL — TECHNIQUE ONLY\n${x.label}: ${x.ins}`,
    gen?format(x):'',
    gen?designrule():'',
    gen?trendrule(x):'',
    gen?copyrule():'',
    brainrow(x),
    M[x.tab],
    gen?H:'',
    gen?typo():'',
    gen?Q:'',
    social?I:'',
    social?G:'',
    x.tab==='3D'?`3D SECTION\n${x.group}.`:'',
    gen?productrule(x):'',
    L,
    gen?humanrule(x):'',
    gen?cleanrule(x):'',
    gen?artdirectionrule(x):'',
    gen?humancreativerule(x):'',
    O,
    rowLock,
    C
  ].filter(Boolean).join('\n\n')
}
function assistantcount(){return document.querySelectorAll('[data-message-author-role="assistant"]').length}
function turnnodes(){
  const nodes=[...document.querySelectorAll('[data-message-author-role],[data-testid^="conversation-turn"],article[data-testid*="conversation"]')];
  return [...new Set(nodes)]
}
function resultmedia(){
  const main=document.querySelector('main')||document.body,total=[],ready=[];
  for(const el of main.querySelectorAll('img,canvas,video')){
    if(el.closest?.('form,[data-testid*="composer"],#prompt-textarea'))continue;
    const role=el.closest?.('[data-message-author-role]'),turn=el.closest?.('[data-testid^="conversation-turn"],article[data-testid*="conversation"]');
    if(role?.getAttribute('data-message-author-role')==='user'||(!role&&turn?.querySelector?.('[data-message-author-role="user"]')))continue;
    total.push(el);
    if(el.tagName==='IMG'&&el.complete&&el.naturalWidth>80)ready.push(el);
    else if(el.tagName==='CANVAS'&&el.width>80&&el.height>80)ready.push(el);
    else if(el.tagName==='VIDEO'&&el.readyState>=2)ready.push(el)
  }
  return{total:total.length,ready:ready.length}
}
function turnsnapshot(){
  const roles=document.querySelectorAll('[data-message-author-role]'),turns=turnnodes(),media=resultmedia();
  return{
    assistant:assistantcount(),
    roles:roles.length,
    turns:turns.length,
    resultMedia:media.total,
    resultReady:media.ready,
    allImages:document.querySelectorAll('main img').length,
    canvases:document.querySelectorAll('main canvas').length
  }
}
function lastresultnode(){
  const nodes=turnnodes();
  for(let i=nodes.length-1;i>=0;i--){
    if(!nodes[i].matches?.('[data-message-author-role="user"]')&&!nodes[i].querySelector?.(':scope > [data-message-author-role="user"]'))return nodes[i]
  }
  const a=[...document.querySelectorAll('[data-message-author-role="assistant"]')];
  return a[a.length-1]||document.querySelector('main')||document.body
}
function turnbusy(){
  const q=[
    'button[data-testid="stop-button"]',
    'button[data-testid="composer-stop-button"]',
    'button[aria-label*="Stop generating" i]',
    'button[aria-label*="Stop response" i]',
    'button[aria-label="Stop"]'
  ];
  return q.some(s=>[...document.querySelectorAll(s)].some(vis))
}
function generationpending(){
  const node=lastresultnode(),text=String(node?.innerText||node?.textContent||'').toLowerCase();
  if(/creating (?:an )?image|generating (?:an )?image|image generation in progress|working on (?:the|your) image|starting image generation|rendering image/.test(text))return true;
  return [...(node?.querySelectorAll?.('[role="progressbar"],[aria-busy="true"],[data-testid*="progress"],[data-testid*="loading"]')||[])].some(vis)
}
function turnsig(node,snap){
  const text=String(node?.innerText||node?.textContent||'').trim();
  const imgs=[...(node?.querySelectorAll?.('img')||[])];
  return`${snap.assistant}|${snap.roles}|${snap.turns}|${snap.resultMedia}|${snap.resultReady}|${snap.allImages}|${snap.canvases}|${text.length}|${imgs.length}|${imgs.filter(i=>i.complete).length}|${node?.querySelectorAll?.('button')?.length||0}`
}
function turnerror(node){
  const t=String(node?.innerText||node?.textContent||'').toLowerCase();
  const m=t.match(/something went wrong|failed to generate|could not generate|couldn't generate|unable to generate|rate limit|try again later|network error/);
  return m?m[0]:''
}
async function waitturn(before,batch){
  const started=Date.now(),deadline=started+15*60*1000;
  let sawBusy=false,last='',stableAt=0;
  while(Date.now()<deadline){
    if(batch.cancelled)throw new Error('BATCH_CANCELLED');
    const snap=turnsnapshot(),node=lastresultnode(),busy=turnbusy(),pending=generationpending(),elapsed=Date.now()-started;
    if(busy)sawBusy=true;
    const readyMedia=snap.resultReady>before.resultReady;
    const assistantAdvanced=snap.assistant>before.assistant;
    const conversationAdvanced=snap.roles>=before.roles+2||snap.turns>=before.turns+2;
    const completedBusyCycle=sawBusy&&!busy;
    const evidence=readyMedia||assistantAdvanced||conversationAdvanced||completedBusyCycle;
    const minimum=readyMedia?10000:(completedBusyCycle?15000:45000);
    const sig=turnsig(node,snap);
    if(evidence&&!busy&&!pending&&elapsed>=minimum){
      if(sig===last){
        if(!stableAt)stableAt=Date.now();
        if(Date.now()-stableAt>=7000){
          console.log('[Virag Detector] response complete',{elapsed,readyMedia,assistantAdvanced,conversationAdvanced,completedBusyCycle,before,after:snap});
          return node
        }
      }else{last=sig;stableAt=Date.now()}
    }else{last=sig;stableAt=0}
    await wait(1000)
  }
  console.error('[Virag Detector] timeout',{before,after:turnsnapshot(),busy:turnbusy(),pending:generationpending()});
  throw new Error('IMAGE_RESPONSE_NOT_DETECTED')
}
async function sendtext(y,preserve=0){
  const e=ed();
  if(!e)throw new Error('COMPOSER_NOT_FOUND');
  if(preserve){
    const addition=`\n\n${y}`;
    try{e.focus({preventScroll:true})}catch{}
    if(e.tagName==='TEXTAREA'){
      const p=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set,value=(e.value||'')+addition;
      p?p.call(e,value):(e.value=value);
      e.dispatchEvent(iev(value))
    }else{
      const sel=getSelection(),range=document.createRange();
      range.selectNodeContents(e);range.collapse(false);sel.removeAllRanges();sel.addRange(range);
      const ok=document.execCommand('insertText',false,addition);sel.removeAllRanges();
      if(!ok)throw new Error('TAGGED_COMPOSER_APPEND_FAILED')
    }
  }else wr(e,y);
  await wait(500);
  const intact=()=>preserve?norm(read(e)).includes(norm(y)):norm(read(e))===norm(y);
  if(!intact())throw new Error(preserve?'TAGGED_PRODUCTS_CHANGED':'COMPOSER_WRITE_FAILED');
  for(let i=0;i<750;i++){
    if(!intact())throw new Error('COMPOSER_CHANGED_BEFORE_SEND');
    const b=sb(e);
    if(b&&!b.disabled){b.click();return true}
    await wait(80)
  }
  throw new Error('SEND_BUTTON_NOT_READY')
}
function batchui(label,done,total,state='running'){
  mount();
  theme();
  const status=S.s.querySelector('.status'),launch=S.s.querySelector('.launch b');
  if(status)status.textContent=state==='running'?`v${V} · WORKING ${done}/${total}`:`v${V} · READY`;
  if(launch)launch.textContent=state==='running'?`${done}/${total} working`:'Open Virag'
}
async function runbatch(x){
  if(S.batch?.running)return toast(`Virag is already working on ${S.batch.done}/${S.batch.total}.`,1);
  const e=ed();
  if(!e)return toast('ChatGPT composer not found.',1);
  const brief=base();
  S.refs=capturetagrefs(e);
  if(S.pc>1&&S.refs.length<S.pc){
    show();
    st('TAG PRODUCTS FIRST');
    return toast(`Tag ${S.pc} products in the ChatGPT composer before selecting a tool. Virag detected ${S.refs.length}.`,1)
  }
  if(S.am==='separate'&&S.cc===1&&total()!==S.pc){
    show();
    return toast('Quantity check failed: one creative per product must equal the selected product count.',1)
  }
  const rows=batchrows(x),id=`VR-${Date.now().toString(36).toUpperCase()}`;
  const batch={id,running:true,cancelled:false,done:0,total:rows.length,startedAt:new Date().toISOString()};
  S.batch=batch;
  hide();
  console.log('[Virag Router] started',{id,products:S.pc,taggedSources:S.refs,creativesPerProduct:S.cc,total:rows.length,layout:S.am,tool:x.cmd});
  try{
    for(let i=0;i<rows.length;i++){
      const row=rows[i];
      batchui('WORKING',i,rows.length);console.log('[Virag Router] waiting for image completion signal',{creative:i+1,total:rows.length});
      const y=promptrow(x,row,i,rows,id,brief),before=turnsnapshot();
      console.log('[Virag Router] requesting',{id,creative:i+1,total:rows.length,product:row.product,exactSource:S.am==='together'?S.refs:S.refs[row.product-1],variation:row.variation,family:rowfamily(x,row)});
      await sendtext(y,i===0);
      const response=await waitturn(before,batch),error=turnerror(response);
      if(error)throw new Error(`CREATIVE_${i+1}_FAILED_${error.replace(/\s+/g,'_').toUpperCase()}`);
      batch.done=i+1;
      console.log('[Virag Router] completed',{id,creative:i+1,total:rows.length,product:row.product});
      if(i<rows.length-1)await wait(1800)
    }
    batch.running=false;
    batchui('READY',rows.length,rows.length,'complete');
    toast(`Virag completed ${rows.length}/${rows.length} separate creatives.`);
    console.log('[Virag Router] complete',{id,total:rows.length})
  }catch(error){
    batch.running=false;
    const code=String(error?.message||error);
    batchui('READY',batch.done,rows.length,'paused');
    show();
    toast(`Virag stopped after ${batch.done}/${rows.length}: ${code}.`,1);
    console.error('[Virag Router] stopped',{id,done:batch.done,total:rows.length,error:code})
  }
}
async function ex(x){
  if(!x)return;
  if(x.tab==='AI Tools')return token(x);
  return runbatch(x);
}
function gs(){if(S.m!=='3D')return['All'];const p=new Set([...S.l['3D'].values()].map(x=>x.group));return['All',...D.map(x=>x[0]).filter(x=>p.has(x))]}function ls(){let a=[...S.l[S.m].values()].sort((a,b)=>a.id-b.id);if(S.m==='3D'&&S.g!=='All')a=a.filter(x=>x.group===S.g);const q=S.q.toLowerCase().replace(/^\//,'');return q?a.filter(x=>(x.cmd+' '+x.label+' '+x.desc+' '+x.group).toLowerCase().includes(q)):a}
function hit(q){q=String(q||'').toLowerCase();if(!q)return null;const h=[];T.forEach(t=>S.l[t].forEach(x=>{const c=x.cmd.slice(1).toLowerCase();if(c===q||c.startsWith(q))h.push(x)}));return h.length===1?h[0]:null}
const CSS=`:host{all:initial}*{box-sizing:border-box}.p{position:fixed;z-index:2147483647;right:18px;top:72px;bottom:78px;width:min(1040px,calc(100vw - 36px));display:none;flex-direction:column;overflow:hidden;border:1px solid #d8deea;border-radius:22px;background:#f8fafcf7;color:#111827;box-shadow:0 28px 80px #0f172a2b;font-family:Inter,system-ui}.p.on{display:flex}.top,.bar,.foot{display:flex;align-items:center;justify-content:space-between;padding:10px 13px;border-bottom:1px solid #e2e8f0;background:#fff}.top-actions{display:flex;align-items:center;gap:9px}.close{width:34px;height:34px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;color:#475569;font-size:20px;line-height:1;cursor:pointer}.close:hover{background:#fee2e2;color:#b91c1c;border-color:#fecaca}.brand{font-size:14px;font-weight:900}.sub,.meta{font-size:8px;color:#64748b}.status{font-size:8px;font-weight:900;color:#047857}.tabs{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;padding:10px}.tab,.gb,.sync{border:1px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:9px;font-weight:900;cursor:pointer}.tab{height:36px}.tab.on{background:#f5f3ff;color:#5b21b6;border-color:#c4b5fd}.tab[data-t="3D"].on,.gb.on{background:#ecfdf5;color:#047857;border-color:#99f6e4}.groups{display:none;gap:7px;padding:0 10px 9px;overflow:auto}.groups.on{display:flex}.gb{height:30px;padding:0 10px;white-space:nowrap}.planner{display:none;grid-template-columns:repeat(5,minmax(130px,1fr));align-items:end;gap:8px;margin:0 10px 2px;padding:10px;border:1px solid #ddd6fe;border-radius:14px;background:linear-gradient(135deg,#faf5ff,#ecfeff)}.planner.on{display:grid}.planner label{display:grid;gap:5px;color:#475569;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}.planner select{width:100%;height:38px;padding:0 10px;border:1px solid #c4b5fd;border-radius:10px;background:#fff;color:#111827;font:900 11px Inter,system-ui;outline:none}.total{height:38px;min-width:145px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:10px;background:#5b21b6;color:#fff}.total b{font-size:17px}.total small{font-size:8px;font-weight:800}.search{display:grid;grid-template-columns:1fr auto;gap:8px;padding:10px}.q{height:40px;border:1px solid #d7deea;border-radius:11px;background:#fff;padding:0 12px;outline:none}.sync{height:40px;padding:0 12px}.grid{flex:1;overflow:auto;padding:0 10px 12px;display:grid;grid-template-columns:repeat(3,1fr);align-content:start;gap:9px}.card{min-height:108px;padding:11px;border:1px solid #dde3ed;border-radius:14px;background:#fff;cursor:pointer}.card:hover{border-color:#a7f3d0;box-shadow:0 8px 22px #64748b1c}.cmd,.tag,.chip{display:inline-block;border-radius:99px;padding:4px 7px;font-size:8px;font-weight:800}.cmd{background:#f1f5f9;color:#64748b;font-family:ui-monospace,monospace}.tag{float:right;max-width:58%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:#ecfdf5;color:#047857}.name{margin-top:10px;font-size:12px;font-weight:900}.desc{margin-top:5px;font-size:9px;line-height:1.35;color:#64748b}.empty{grid-column:1/-1;padding:30px;text-align:center;color:#64748b}.foot{justify-content:flex-start;gap:6px;overflow:auto;border-top:1px solid #e2e8f0;border-bottom:0}.chip{background:#f8fafc;color:#64748b;border:1px solid #e2e8f0;white-space:nowrap}.launch{position:fixed;right:20px;bottom:88px;z-index:2147483647;min-width:126px;height:46px;padding:0 15px;border:0;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#0891b2);color:#fff;font:800 12px Inter,system-ui;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 12px 32px #0f172a33}.launch span{display:grid;place-items:center;width:24px;height:24px;border-radius:8px;background:#ffffff26;font-size:13px}.p.on~.launch{display:none}.toast{position:fixed;right:20px;bottom:145px;z-index:2147483647;display:none;max-width:520px;padding:10px 12px;border-radius:10px;background:#111827;color:#fff;font-size:9px}.toast.on{display:block}@media(max-width:900px){.tabs{grid-template-columns:repeat(3,1fr)}.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.planner{grid-template-columns:1fr 1fr}.total{grid-column:1/-1}.launch{min-width:46px;width:46px;padding:0}.launch b{display:none}}`;
const NEON=`:host{--void:#030614;--navy:#070b20;--glass:#0d1431;--glass2:#111a3d;--ink:#f4f7ff;--muted:#8d9ac5;--line:#6f7ee54d;--violet:#9b87ff;--blue:#6b8cff;--cyan:#76dcff}.p{isolation:isolate;border-color:#8294ff8f;background:linear-gradient(155deg,#0d1431f7 0%,#070b20fa 52%,#030614fc 100%);color:var(--ink);box-shadow:0 0 0 1px #ffffff0d,0 0 28px #6574ff4d,0 0 75px #6137d72e,0 34px 110px #000c;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}.p:before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.44;background-image:linear-gradient(#8ba0ff0a 1px,transparent 1px),linear-gradient(90deg,#8ba0ff0a 1px,transparent 1px);background-size:54px 54px}.p:after{content:'';position:absolute;inset:-35%;z-index:0;pointer-events:none;background:radial-gradient(circle at 72% 12%,#6979ff25 0,transparent 23%),radial-gradient(circle at 16% 78%,#9b5cff1d 0,transparent 24%)}.p>*{position:relative;z-index:1}.top,.bar,.foot{border-color:#7586df2e;background:linear-gradient(90deg,#0d1431e8,#070b20d9);box-shadow:inset 0 -1px #ffffff08}.top{padding:12px 15px}.brand{color:#fff;font-size:15px;letter-spacing:.01em;text-shadow:0 0 12px #bdd1ff99,0 0 28px #7188ff73}.brand:before{content:'✦';display:inline-grid;place-items:center;width:23px;height:23px;margin-right:8px;border:1px solid #dce7ffb3;border-radius:8px;background:linear-gradient(145deg,#778dff80,#7d4ad95c);box-shadow:0 0 7px #fff7,0 0 22px #6f83ffb3;color:#fff}.sub,.meta{color:var(--muted);letter-spacing:.04em}.status{color:#aaf2ff;text-shadow:0 0 10px #62d9ff}.close{border-color:#7d8ddb66;background:#0a1029c7;color:#cbd5ff;box-shadow:inset 0 0 12px #7185ff14;transition:.2s ease}.close:hover{border-color:#f5f7ff;background:#1a2146;color:#fff;box-shadow:0 0 7px #fff8,0 0 24px #7188ff99;transform:scale(1.04)}.tabs{gap:9px;padding:12px}.tab,.gb,.sync{border-color:#6474c94a;background:linear-gradient(145deg,#121a3bd9,#080d24e8);color:#9eacd3;box-shadow:inset 0 0 16px #8290ff0b;transition:border-color .2s ease,box-shadow .2s ease,color .2s ease,transform .2s ease}.tab{height:40px}.tab:hover,.gb:hover,.sync:hover{color:#eaf1ff;border-color:#91a2ff99;box-shadow:0 0 16px #7188ff47,inset 0 0 18px #7f8fff14;transform:translateY(-1px)}.tab.on,.tab[data-t="3D"].on{color:#fff;border-color:#eef3ff;background:linear-gradient(145deg,#5368c975,#111a3dee);box-shadow:0 0 5px #fff9,0 0 20px #7890ffcc,0 0 44px #744bdf73,inset 0 0 22px #8494ff38;text-shadow:0 0 11px #dce7ff}.groups{padding-bottom:11px}.gb.on{color:#eaffff;border-color:#c2f3ff;background:linear-gradient(145deg,#2d6a9473,#111a3de8);box-shadow:0 0 4px #e9ffffb3,0 0 18px #55d9ff8f,inset 0 0 16px #69dfff24;text-shadow:0 0 8px #7ee8ff}.planner{border-color:#758aff73;background:linear-gradient(135deg,#121a3de8,#090f28ed);box-shadow:0 0 22px #6c7cff26,inset 0 0 22px #7889ff0d}.planner label{color:#9facd5}.planner select{border-color:#7182dd70;background:#070d24;color:#edf3ff;box-shadow:inset 0 0 16px #7889ff12;transition:.2s ease}.planner select:focus,.planner select:hover{border-color:#dce7ff;box-shadow:0 0 5px #fff7,0 0 18px #718bff80,inset 0 0 16px #8b9aff1c}.total{background:linear-gradient(135deg,#697fff,#8759dd);box-shadow:0 0 7px #ffffff73,0 0 23px #7085ff9e,inset 0 0 16px #fff2}.total b{color:#fff;text-shadow:0 0 10px #fff}.search{padding:11px 12px}.q{border-color:#6475ca52;background:#060b1ee8;color:#eef3ff;box-shadow:inset 0 0 18px #6678dc0d;transition:.2s ease}.q::placeholder{color:#7380aa}.q:focus{border-color:#cdd9ff;box-shadow:0 0 5px #fff5,0 0 18px #6782ff70,inset 0 0 18px #6f82ff14}.sync{height:40px;padding:0 14px}.bar{color:#eaf0ff}.title{text-shadow:0 0 10px #8ea7ff57}.grid{scrollbar-color:#6577d8 #080d22}.card{position:relative;overflow:hidden;border-color:#5363af4a;background:linear-gradient(145deg,#111a3dde,#070c21ed);color:#f5f7ff;box-shadow:inset 0 1px #ffffff09,inset 0 0 24px #7f8fff08,0 10px 28px #0003;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.card:before{content:'';position:absolute;left:12%;right:12%;top:-1px;height:1px;background:linear-gradient(90deg,transparent,#c8d6ff99,transparent);box-shadow:0 0 9px #8298ff9e}.card:hover{transform:translateY(-3px);border-color:#cad6ffcc;box-shadow:0 0 5px #fff5,0 0 20px #6e86ff7a,0 14px 34px #0007,inset 0 0 25px #7589ff14}.cmd{background:#0b112d;color:#aebdf0;border:1px solid #5969b657;box-shadow:inset 0 0 10px #7486ef12}.tag{background:#102d47;color:#8eedff;border:1px solid #4ebfe15c;text-shadow:0 0 8px #4ad8ff70}.name{color:#f8faff;text-shadow:0 0 8px #aabaff36}.desc,.empty{color:#93a0c7}.foot{border-top-color:#7384dd33}.chip{border-color:#5262ae52;background:#090f27;color:#8f9dca;box-shadow:inset 0 0 12px #7589ff0d}.launch{border:1px solid #e8efffd9;background:linear-gradient(135deg,#111a3df5,#28346cec 52%,#6d4bd4e8);box-shadow:0 0 6px #fff8,0 0 24px #7188ffbd,0 0 48px #6f43cc73,0 16px 40px #0008;animation:viragPulse 2.8s ease-in-out infinite}.launch span{border:1px solid #dce7ff9c;background:#9b87ff33;box-shadow:0 0 12px #aabaff9c;text-shadow:0 0 8px #fff}.toast{border:1px solid #7f91ed8f;background:#080e26f2;color:#f5f7ff;box-shadow:0 0 20px #6f83ff66,0 15px 40px #0008}@keyframes viragPulse{0%,100%{box-shadow:0 0 5px #fff7,0 0 20px #7188ffaa,0 0 42px #6f43cc60,0 16px 40px #0008}50%{box-shadow:0 0 8px #fffa,0 0 30px #7d92ffdc,0 0 58px #8056df85,0 16px 42px #0009}}@media(prefers-reduced-motion:reduce){.launch{animation:none}.tab,.gb,.sync,.card,.close{transition:none}}`;
const BOARD=`:host{
  --neo-ink:#eef6ff;
  --neo-muted:#96a7bb;
  --neo-line:#d9ecff2e;
  --neo-glass:#172231b8;
  --neo-glass-2:#0b1420d9;
  --neo-blue:#477cff;
  --neo-cyan:#58edf2;
  --neo-shadow:#000a;
}
.p{
  position:fixed;
  isolation:isolate;
  overflow:hidden;
  border:1px solid #dff1ff42;
  border-radius:34px;
  background:
    linear-gradient(145deg,#263548b8 0%,#111c2acb 38%,#070d16ed 100%);
  color:var(--neo-ink);
  box-shadow:
    inset 1px 1px 0 #ffffff4d,
    inset -1px -1px 0 #0008,
    inset 0 0 54px #a8d8ff0e,
    0 26px 80px #000c,
    0 0 42px #3cecf238;
  backdrop-filter:blur(34px) saturate(1.25);
  -webkit-backdrop-filter:blur(34px) saturate(1.25);
  font-family:Inter,"Helvetica Neue",Arial,sans-serif
}
.p:before{
  content:'';
  position:absolute;
  inset:-28%;
  z-index:0;
  pointer-events:none;
  background:
    radial-gradient(circle at 4% 2%,#c7ecff6b 0 5%,#72cfff2b 15%,transparent 34%),
    radial-gradient(circle at 100% 100%,#31f0ef57 0 4%,#2acccc24 14%,transparent 34%),
    radial-gradient(circle at 72% 16%,#467eff26,transparent 25%);
  filter:blur(24px)
}
.p:after{
  content:'';
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  border-radius:inherit;
  background:linear-gradient(122deg,#ffffff21 0%,transparent 17%,transparent 72%,#5effff17 100%);
  box-shadow:inset -2px -2px 20px #4ff8ff1f
}
.p>*{position:relative;z-index:1}
.top,.bar,.foot{
  border-color:#deeeff1d;
  background:linear-gradient(180deg,#182431c9,#0d1722b8);
  box-shadow:inset 0 1px #ffffff1f,inset 0 -1px #0006;
  backdrop-filter:blur(20px)
}
.top{padding:17px 20px}
.brand{
  display:flex;
  align-items:center;
  color:#f8fbff;
  font-size:21px;
  font-weight:750;
  letter-spacing:-.045em;
  text-shadow:0 2px 16px #0008
}
.brand:before{
  content:'V';
  display:grid;
  place-items:center;
  width:31px;
  height:31px;
  margin-right:11px;
  border:1px solid #eff8ff70;
  border-radius:11px;
  background:linear-gradient(145deg,#324356,#101924);
  color:#fff;
  box-shadow:inset 1px 1px #ffffff42,inset -2px -2px 5px #0008,0 7px 15px #0008,0 0 13px #62eef24a;
  font-size:12px;
  font-weight:900
}
.sub{margin-top:7px;color:#91a5bb;font-size:8px;letter-spacing:.18em}
.status{
  min-width:118px;
  padding:9px 12px;
  border:1px solid #dbeaff29;
  border-radius:999px;
  background:#cfe3f50d;
  color:#bdd0e4;
  box-shadow:inset 1px 1px #ffffff20,inset -2px -2px 8px #0006;
  text-align:center;
  text-shadow:0 1px 7px #000;
  letter-spacing:.08em
}
.close{
  width:38px;
  height:38px;
  border:1px solid #e3f0ff2e;
  border-radius:13px;
  background:linear-gradient(145deg,#263545,#101923);
  color:#c8d5e2;
  box-shadow:inset 1px 1px #ffffff28,inset -2px -2px 6px #0008,0 9px 16px #0007;
  transition:.2s ease
}
.close:hover{
  border-color:#91f5f3a3;
  color:#fff;
  box-shadow:inset 1px 1px #ffffff3d,0 0 16px #51e7e75e,0 10px 20px #0008;
  transform:translateY(-1px)
}
.tabs{
  gap:9px;
  padding:13px 14px 11px;
  background:#08111bb0
}
.tab,.gb,.sync{
  border:1px solid #d4e8ff2e;
  background:linear-gradient(145deg,#233141cf,#101a26e8);
  color:#9eb0c3;
  box-shadow:inset 1px 1px #ffffff20,inset -2px -2px 7px #0009,0 8px 17px #0007;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease
}
.tab{
  height:43px;
  border-radius:15px;
  letter-spacing:.01em
}
.tab:hover,.gb:hover,.sync:hover{
  color:#f4f8ff;
  border-color:#b8d7ff70;
  transform:translateY(-2px);
  box-shadow:inset 1px 1px #ffffff2e,inset -2px -2px 8px #0009,0 12px 22px #0009,0 0 14px #477cff34
}
.tab:active,.gb:active,.sync:active{transform:translateY(1px);box-shadow:inset 2px 2px 8px #000b,inset -1px -1px #ffffff1c}
.tab.on,.tab[data-t="3D"].on{
  border-color:#77a2ff;
  background:linear-gradient(145deg,#5a8aff,#2864f0);
  color:#fff;
  box-shadow:inset 1px 1px #ffffff75,inset -2px -3px 8px #1645c9,0 11px 24px #0a255da8,0 0 20px #4f83ff80;
  text-shadow:0 1px 7px #173b9c
}
.groups{gap:8px;padding:0 14px 12px;background:#08111bb0}
.gb{height:32px;border-radius:999px;padding:0 12px}
.gb.on{
  border-color:#6ceff0a8;
  background:linear-gradient(145deg,#62edf2,#2399bc);
  color:#04141d;
  box-shadow:inset 1px 1px #ffffff80,0 8px 18px #1aa6c76e,0 0 15px #56eff28a
}
.planner{
  gap:11px;
  margin:4px 14px 6px;
  padding:15px;
  border:1px solid #d8eaff2c;
  border-radius:24px;
  background:linear-gradient(145deg,#cfe3f515,#5f7d9c09 46%,#07111bd4);
  box-shadow:inset 1px 1px #ffffff25,inset -2px -2px 14px #0008,0 16px 32px #0007;
  backdrop-filter:blur(25px)
}
.planner label{color:#9dafc2;font-size:8px;letter-spacing:.12em}
.planner select{
  height:43px;
  border:1px solid #dbeaff35;
  border-radius:14px;
  padding:0 12px;
  background:linear-gradient(145deg,#263647,#101b27);
  color:#f1f6fc;
  box-shadow:inset 1px 1px #ffffff2d,inset -3px -3px 9px #0009,0 8px 14px #0006;
  font:750 10px Inter,"Helvetica Neue",Arial,sans-serif;
  transition:.18s ease
}
.planner select:hover,.planner select:focus{
  border-color:#72dfe8a3;
  background:linear-gradient(145deg,#2b4053,#12202d);
  box-shadow:inset 1px 1px #ffffff35,inset -3px -3px 9px #0008,0 0 16px #45dce84a
}
.total{
  height:43px;
  border:1px solid #f4fbff9c;
  border-radius:14px;
  background:linear-gradient(145deg,#f8fbff,#cfdbe8);
  color:#111a24;
  box-shadow:inset 1px 1px #fff,inset -2px -2px 8px #91a1b3,0 11px 19px #0008,0 0 18px #d9f4ff3a
}
.total b{color:#101923;font-size:18px;text-shadow:none}
.total small{color:#3b4a5a}
.search{gap:10px;padding:11px 14px}
.q{
  height:44px;
  border:1px solid #d6e8fa2c;
  border-radius:15px;
  background:linear-gradient(145deg,#1e2c3b,#0d1722);
  color:#eef6ff;
  box-shadow:inset 2px 2px 8px #0009,inset -1px -1px #ffffff20,0 8px 16px #0006;
  transition:.18s ease
}
.q::placeholder{color:#75889b}
.q:focus{
  border-color:#68e5e78f;
  box-shadow:inset 2px 2px 8px #0008,inset -1px -1px #ffffff27,0 0 17px #4be6e74f
}
.sync{height:44px;border-radius:15px;padding:0 16px}
.bar{padding:11px 14px;color:#f4f8ff}
.title{font-size:13px;font-weight:780;letter-spacing:-.015em;text-shadow:0 2px 10px #000}
.meta{
  max-width:72%;
  overflow:hidden;
  color:#8194a8;
  white-space:nowrap;
  text-overflow:ellipsis
}
.grid{
  padding:3px 14px 15px;
  gap:11px;
  scrollbar-color:#5d7fa0 #09121d
}
.card{
  position:relative;
  min-height:114px;
  overflow:hidden;
  border:1px solid #d9eaff24;
  border-radius:21px;
  background:linear-gradient(145deg,#1e2c3bbf,#0c1622e8);
  color:#f3f8fd;
  box-shadow:inset 1px 1px #ffffff1f,inset -3px -3px 10px #0009,0 13px 24px #0008;
  backdrop-filter:blur(18px);
  transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease
}
.card:before{
  content:'';
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(132deg,#ffffff14,transparent 35%,transparent 70%,#45eced0b)
}
.card:hover{
  transform:translateY(-4px);
  border-color:#6de7ec7a;
  box-shadow:inset 1px 1px #ffffff2b,inset -3px -3px 11px #0008,0 18px 30px #000a,0 0 19px #47e6e746
}
.card:active{transform:translateY(0);box-shadow:inset 3px 3px 12px #000b,inset -1px -1px #ffffff1b}
.cmd{
  border:1px solid #cddff122;
  background:#c7dbef12;
  color:#a9bdd0;
  box-shadow:inset 1px 1px #ffffff18
}
.tag{
  border:1px solid #5debed54;
  background:#55e5e51a;
  color:#7cf5f3;
  text-shadow:0 0 8px #3ee8e86b
}
.name{color:#f9fbff;font-size:13px;letter-spacing:-.018em;text-shadow:0 2px 9px #000}
.desc{color:#8fa2b5}
.foot{gap:7px;padding:10px 14px}
.chip{
  border:1px solid #d8eaff1d;
  background:linear-gradient(145deg,#1b2937,#0d1721);
  color:#8093a6;
  box-shadow:inset 1px 1px #ffffff17,inset -2px -2px 5px #0007
}
.launch{
  min-width:145px;
  height:52px;
  border:1px solid #9ff7f788;
  border-radius:18px;
  background:linear-gradient(145deg,#27394b,#101b27);
  color:#f2fbff;
  box-shadow:inset 1px 1px #ffffff38,inset -3px -3px 9px #0009,0 15px 30px #000a,0 0 25px #49ecec5e;
  animation:neoBreath 3.2s ease-in-out infinite;
  backdrop-filter:blur(20px)
}
.launch span{
  border:1px solid #a5ffffa8;
  background:linear-gradient(145deg,#61f4f2,#2b9fc4);
  color:#03151c;
  box-shadow:inset 1px 1px #ffffff9c,inset -2px -2px 5px #147d98,0 0 16px #53eeeea8;
  text-shadow:none
}
.toast{
  border:1px solid #8deeee63;
  background:linear-gradient(145deg,#223445f5,#0c1722f7);
  color:#f3f9ff;
  box-shadow:inset 1px 1px #ffffff26,0 18px 35px #000b,0 0 20px #45e7e73b;
  backdrop-filter:blur(22px)
}
@keyframes neoBreath{
  0%,100%{box-shadow:inset 1px 1px #ffffff38,inset -3px -3px 9px #0009,0 15px 30px #000a,0 0 20px #49ecec48}
  50%{box-shadow:inset 1px 1px #ffffff50,inset -3px -3px 9px #0009,0 17px 34px #000b,0 0 32px #58f5f580}
}
@media(max-width:900px){
  .p{right:9px;top:58px;bottom:66px;width:calc(100vw - 18px);border-radius:27px}
  .planner{grid-template-columns:repeat(2,minmax(135px,1fr))}
  .tabs{grid-template-columns:repeat(3,1fr)}
  .grid{grid-template-columns:repeat(2,1fr)}
  .meta{max-width:58%}
}
@media(max-width:560px){
  .planner,.grid{grid-template-columns:1fr}
  .brand{font-size:17px}
  .meta{display:none}
}
@media(prefers-reduced-motion:reduce){
  .launch{animation:none}
  .tab,.gb,.sync,.card,.close,.planner select{transition:none}
}`;
function theme(){if(!S.s||S.s.querySelector('style[data-board]'))return;const e=document.createElement('style');e.dataset.board='1';e.textContent=BOARD;S.s.appendChild(e);const sub=S.s.querySelector('.sub');if(sub)sub.textContent='NEO-TACTILE CREATIVE SYSTEM · VIRAG'}
function mount(){if(S.p)return;S.h=document.createElement('div');document.documentElement.appendChild(S.h);S.s=typeof S.h.attachShadow==='function'?S.h.attachShadow({mode:'open'}):S.h;S.s.innerHTML=`<style>${CSS}${NEON}</style><div class="p"><div class="top"><div><div class="brand">Virag Creative OS</div><div class="sub">NEON GLASS COMMAND CENTER · SIX CREATIVE LIBRARIES</div></div><div class="top-actions"><div class="status">v${V} · READY</div><button class="close" aria-label="Close Virag" title="Close Virag">×</button></div></div><div class="tabs"></div><div class="groups"></div><div class="planner"><label>Number of products<select class="products" aria-label="Number of products"></select></label><label>Product layout<select class="arrangement" aria-label="Product layout"><option value="separate">Separate — one product each</option><option value="together">Together — all products in each</option></select></label><label><span class="ptype">Creatives per product</span><select class="creatives" aria-label="Output quantity"></select></label><label>Real font style<select class="typography" aria-label="Real font style"></select></label><label>Output format<select class="format" aria-label="Output format"></select></label><label>Content level<select class="contentlevel" aria-label="Content level"></select></label><label>Design richness<select class="richness" aria-label="Design richness"></select></label><label>Design direction<select class="design" aria-label="Design direction"></select></label><label>Product fidelity<select class="productlock" aria-label="Product fidelity"></select></label><div class="total"><b></b><small>SEPARATE OUTPUTS</small></div></div><div class="search"><input class="q" placeholder="Search inside Creative…"><button class="sync">SYNC</button></div><div class="bar"><b class="title"></b><span class="meta"></span></div><div class="grid"></div><div class="foot"></div></div><button class="launch" aria-label="Open Virag" title="Open Virag"><span>V</span><b>Open Virag</b></button><div class="toast"></div>`;S.p=S.s.querySelector('.p');S.to=S.s.querySelector('.toast');S.s.querySelector('.launch').onclick=show;S.s.querySelector('.close').onclick=hide;S.s.querySelector('.sync').onclick=()=>sy(1);const fill=(e,n,v)=>{for(let i=1;i<=n;i++){const o=document.createElement('option');o.value=i;o.textContent=i;o.selected=i===v;e.appendChild(o)}};const ps=S.s.querySelector('.products'),cs=S.s.querySelector('.creatives'),as=S.s.querySelector('.arrangement'),ts=S.s.querySelector('.typography'),fs=S.s.querySelector('.format'),cls=S.s.querySelector('.contentlevel'),ars=S.s.querySelector('.richness'),ds=S.s.querySelector('.design'),pls=S.s.querySelector('.productlock');fill(ps,20,S.pc);fill(cs,10,S.cc);as.value=S.am;Object.entries(Y).forEach(([v,y])=>{const o=document.createElement('option');o.value=v;o.textContent=y[0];o.selected=v===S.ty;ts.appendChild(o)});ts.value=S.ty;Object.entries(FM).forEach(([v,y])=>{const o=document.createElement('option');o.value=v;o.textContent=y[0];o.selected=v===S.fm;fs.appendChild(o)});fs.value=S.fm;Object.entries(CL).forEach(([v,y])=>{const o=document.createElement('option');o.value=v;o.textContent=y[0];o.selected=v===S.cl;cls.appendChild(o)});cls.value=S.cl;Object.entries(AR).forEach(([v,y])=>{const o=document.createElement('option');o.value=v;o.textContent=y[0];o.selected=v===S.ar;ars.appendChild(o)});ars.value=S.ar;Object.entries(DS).forEach(([v,y])=>{const o=document.createElement('option');o.value=v;o.textContent=y[0];o.selected=v===S.ds;ds.appendChild(o)});ds.value=S.ds;Object.entries(PL).forEach(([v,y])=>{const o=document.createElement('option');o.value=v;o.textContent=y[0];o.selected=v===S.pl;pls.appendChild(o)});pls.value=S.pl;ps.onchange=()=>{S.pc=+ps.value;if(S.am==='separate'&&S.pc>1){S.cc=1;cs.value='1';sv('virag.plan.outputs.v115',1)}sv('virag.plan.products',S.pc);rd()};cs.onchange=()=>{S.cc=+cs.value;sv('virag.plan.outputs.v115',S.cc);rd()};as.onchange=()=>{S.am=as.value==='together'?'together':'separate';sv('virag.plan.arrangement',S.am);rd()};ts.onchange=()=>{S.ty=Y[ts.value]?ts.value:'auto';sv('virag.plan.type',S.ty);rd()};fs.onchange=()=>{S.fm=FM[fs.value]?fs.value:'instagram';sv('virag.plan.format',S.fm);rd()};cls.onchange=()=>{S.cl=CL[cls.value]?cls.value:'balanced';sv('virag.plan.content.v114',S.cl);rd()};ars.onchange=()=>{S.ar=AR[ars.value]?ars.value:'premium';sv('virag.plan.richness.v114',S.ar);rd()};ds.onchange=()=>{S.ds=DS[ds.value]?ds.value:'auto';sv('virag.plan.design',S.ds);rd()};pls.onchange=()=>{S.pl=PL[pls.value]?pls.value:'exact-composite';sv('virag.plan.productlock',S.pl);rd()};const q=S.s.querySelector('.q');q.oninput=()=>{S.q=q.value;rd()};q.onkeydown=e=>{if(e.key==='Enter'){const x=ls()[0];if(x){e.preventDefault();ex(x)}}};rd()}
function st(x){mount();theme();S.s.querySelector('.status').textContent=`v${V} · ${x}`}function toast(x,b=0){mount();theme();S.to.textContent=x;S.to.className='toast on';clearTimeout(toast.t);toast.t=setTimeout(()=>S.to.className='toast',5200)}
function qp(){if(!S.s)return;const gen=S.m!=='AI Tools',p=S.s.querySelector('.planner');p?.classList.toggle('on',gen);if(!gen)return;const separate={Creative:'Creatives per product',Flyer:'Flyers per product','3D':'3D creatives per product',Packaging:'Designs per product',Video:'Video outputs per product'},together={Creative:'Combined Instagram post variations',Flyer:'Combined flyer variations','3D':'Combined 3D variations',Packaging:'Combined design variations',Video:'Combined video variations'},t=S.s.querySelector('.total b'),small=S.s.querySelector('.total small'),pt=S.s.querySelector('.ptype');if(t)t.textContent=total();if(small)small.textContent=S.am==='separate'&&S.cc===1?'ONE PER PRODUCT':(S.fm==='native'?'TOTAL NATIVE OUTPUTS':(S.m==='Video'?'TOTAL SEPARATE REELS':'TOTAL SEPARATE IMAGES'));if(pt)pt.textContent=(S.am==='together'?together:separate)[S.m]||'Output quantity'}
function rd(){if(!S.p)return;const tb=S.s.querySelector('.tabs');tb.innerHTML='';T.forEach(t=>{const b=document.createElement('button');b.className='tab'+(S.m===t?' on':'');b.dataset.t=t;b.textContent=t;b.onclick=async()=>{S.m=t;S.g='All';S.q='';S.s.querySelector('.q').value='';st('LOADING '+t.toUpperCase());await sy(0,0);rd()};tb.appendChild(b)});const gg=S.s.querySelector('.groups');gg.innerHTML='';gg.classList.toggle('on',S.m==='3D');if(S.m==='3D')gs().forEach(g=>{const n=g==='All'?S.l['3D'].size:[...S.l['3D'].values()].filter(x=>x.group===g).length,b=document.createElement('button');b.className='gb'+(S.g===g?' on':'');b.textContent=`${g} (${n})`;b.onclick=()=>{S.g=g;S.q='';S.s.querySelector('.q').value='';rd()};gg.appendChild(b)});qp();const a=ls(),n=total(),gen=S.m!=='AI Tools',q=S.s.querySelector('.q'),layout=S.am==='together'?'together':'separate',ad=['Creative','3D'].includes(S.m);q.placeholder=`Search inside ${S.m}…`;S.s.querySelector('.title').textContent=S.m==='3D'?`CGI + SOCIAL CONTENT ENGINE · ${S.g}`:S.m==='Creative'?'CREATIVE · INSTAGRAM CONTENT DESIGN ENGINE':gen?`${S.m} · UNIVERSAL MASTER OUTPUT PLAN`:S.m;S.s.querySelector('.meta').textContent=`Library ${S.v[S.m]} · Brain ${S.bv} · ${S.l[S.m].size} tools${gen?' · ALL MASTER LOCKS ACTIVE · PRODUCT IDENTITY LOCKED · REAL FONT ONLY · HUMAN-STUDIO QA · HUMAN-MADE MASTER · PREMIUM-DESIGNED DEFAULT · CROSS-BROWSER · TAGGED-PRODUCT AUTO ROUTER · MIXED-FORMAT VARIATIONS':''}${ad?' · INSTAGRAM 4:5 · POST-READY · DESIGN-LAYER GATE · NOT A POSTER · BLANK CANVAS · PREVIOUS OUTPUTS EXCLUDED · RAW RENDERS REJECTED · HUMAN-MADE CREATIVE MASTER · PREMIUM ART DIRECTION · ORIGINAL CONCEPT LOCK':''}${gen?' · FORMAT '+FM[S.fm][0].toUpperCase()+' · CONTENT '+CL[S.cl][0].toUpperCase()+' · RICHNESS '+AR[S.ar][0].toUpperCase()+' · DESIGN '+DS[S.ds][0].toUpperCase()+' · FIDELITY '+PL[S.pl][0].toUpperCase()+' · TYPE '+Y[S.ty][0].split(' — ')[0].toUpperCase()+' · DAILY TREND '+String(S.mods.trends?.trendDate||'SYNCING').toUpperCase():''}${S.m==='3D'?` · ${S.d.size}/${D.length} sections · showing ${a.length} · ${S.pc} product${S.pc===1?'':'s'} ${layout} · ${n} output${n===1?'':'s'}`:gen?` · ${S.pc} product${S.pc===1?'':'s'} ${layout} · ${n} output${n===1?'':'s'}`:''}`;const gr=S.s.querySelector('.grid');gr.innerHTML='';a.forEach(x=>{const c=document.createElement('div');c.className='card';c.innerHTML='<span class="cmd"></span><span class="tag"></span><div class="name"></div><div class="desc"></div>';c.querySelector('.cmd').textContent=x.cmd;c.querySelector('.tag').textContent=x.tab==='3D'?x.group:'';c.querySelector('.tag').style.display=x.tab==='3D'?'inline-block':'none';c.querySelector('.name').textContent=x.label;c.querySelector('.desc').textContent=x.desc;c.onclick=()=>ex(x);gr.appendChild(c)});if(!a.length)gr.innerHTML='<div class="empty">No tools found. Press SYNC to retry.</div>';const ft=S.s.querySelector('.foot');ft.innerHTML='';T.forEach(t=>{const c=document.createElement('span');c.className='chip';c.textContent=`${t} ${S.v[t]}${t==='3D'?` · ${S.l[t].size}`:''}`;ft.appendChild(c)})}
function show(){mount();S.p.classList.add('on')}function hide(){S.p?.classList.remove('on')}
document.addEventListener('input',e=>{const t=e.target;if(!(t?.tagName==='TEXTAREA'||t?.isContentEditable||t?.closest?.('[contenteditable="true"]')))return;const x=t.tagName==='TEXTAREA'||t.isContentEditable?t:t.closest('[contenteditable="true"]'),m=read(x).match(/(?:^|\n)\s*\/([A-Za-z0-9_-]*)$/);if(!m)return;mount();S.q=m[1]||'';const h=hit(S.q);if(h){S.m=h.tab;S.g=h.tab==='3D'?h.group:'All'}show();S.s.querySelector('.q').value=S.q;rd()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()},true);
function indiaNow(){return new Date(Date.now()+IST_OFFSET)}function indiaDate(){const d=indiaNow();return`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`}function pastDailyWindow(){const d=indiaNow();return d.getUTCHours()>DAILY_HOUR||(d.getUTCHours()===DAILY_HOUR&&d.getUTCMinutes()>=DAILY_MINUTE)}function dailyDelay(){const now=Date.now(),d=new Date(now+IST_OFFSET);let t=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),DAILY_HOUR,DAILY_MINUTE);if(t<=now+IST_OFFSET)t+=86400000;return Math.max(60000,t-(now+IST_OFFSET))}async function dailySync(force=0){if(!force&&document.hidden)return;const today=indiaDate();if(!force&&pastDailyWindow()&&gv(DAILY_KEY,'')===today)return;const ok=await sy();if(ok&&pastDailyWindow())sv(DAILY_KEY,today)}function armDaily(){setTimeout(async()=>{await dailySync();armDaily()},dailyDelay())}const autosync=()=>dailySync();(window.requestIdleCallback||((f)=>setTimeout(f,450)))(async()=>{await cleanupLegacyCaches();mount();st('BROWSER READY');dailySync(1);armDaily()});window.addEventListener('focus',autosync);window.addEventListener('online',autosync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)dailySync()});
})();





