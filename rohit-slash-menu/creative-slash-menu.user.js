// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      8.1.1
// @description  Virag Lite with Flyer Studio, reliable preset-count selector, hard separate multi-image output lock, storage cleanup and lazy-loaded Creative OS.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/creative-slash-menu.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/creative-slash-menu.user.js
// ==/UserScript==

(()=>{'use strict';
const V='8.1.1';
const CORE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/5a8b3b5f2d644da8d30f6343fb6c68a1e2d43ec9/rohit-slash-menu/creative-slash-menu.user.js';
const KEEP=new Set(['virag.brand','virag.format','virag.layout','virag.platform','virag.quality','virag.products','virag.perProduct','virag.favorites','virag.recent','virag.diversity','virag.lastSync','virag.cleanupVersion']);
let loading=false,loaded=false,badge=null;
const get=(k,d='')=>{try{return String(GM_getValue(k,d)||d)}catch{return d}};
const set=(k,v)=>{try{GM_setValue(k,String(v))}catch{}};
function clean(){try{if(get('virag.cleanupVersion')===V)return;for(const k of GM_listValues())if((k.startsWith('csm')||k.startsWith('virag'))&&!KEEP.has(k))GM_deleteValue(k);['virag.commands','virag.runtime','virag.brands','virag760.commands','virag760.runtime','virag760.brands'].forEach(k=>{try{GM_deleteValue(k)}catch{}});set('virag.lastSync','0');set('virag.cleanupVersion',V)}catch{}}
const requestText=url=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:url+'?lazy='+Date.now(),timeout:12000,onload:r=>r.status>=200&&r.status<300?ok(r.responseText):no(new Error('HTTP '+r.status)),onerror:no,ontimeout:no}));

function patchCore(code){
 code=code.replace("const V='8.0.0';",`const V='${V}';`);
 const flyerRule="FLYER STUDIO — NON-NEGOTIABLE: do not create a basic information flyer. Create a scroll-stopping, memory-sticking campaign flyer that earns attention and drives one clear action. Start from a strong single-minded hook, then build bold hierarchy, appetite/emotion/benefit-led visual storytelling, intentional typography, custom graphic devices, clear focal point and a visible CTA. Keep copy concise enough to understand in 2–3 seconds. The flyer must feel like an ad campaign, not a template. Use supplied claims/location/offer details exactly; never invent prices, dates, rewards, food varieties or facts. For restaurant/food flyers, make the food genuinely appetizing and brand-specific while avoiding generic menu-card layouts. When seating/experience references are supplied, use them as an important visual story element instead of decoration. Repeated flyer requests must use a materially different visual concept, layout, hero crop, type system, palette treatment and CTA architecture.";
 code=code.replace('const c=(category,cmd,label,desc,tags=[])=>',`const FLYER_RULE=\`${flyerRule}\`;\nconst c=(category,cmd,label,desc,tags=[])=>`);
 const flyers=`\n c('Flyers','/flyer','Campaign Flyer','High-attention promotional flyer built around one memorable hook and one clear CTA',['flyer','cta','campaign']),\n c('Flyers','/loyaltyflyer','Loyalty Points Flyer','Introduce loyalty points for online orders with a reward-first visual hook and clear order CTA',['loyalty','online','cta']),\n c('Flyers','/pulavflyer','20+ Pulav Launch Flyer','Launch a 20+ Pulav varieties story using the supplied local-first/first-time claim exactly as provided',['food','pulav','launch']),\n c('Flyers','/foodflyer','Food Hero Flyer','Appetite-led food promotion with a bold campaign hook, hero dish and direct CTA',['food','restaurant','cta']),\n c('Flyers','/restaurantflyer','Restaurant Campaign Flyer','Restaurant promotion that sells both the food and the dining experience',['restaurant','campaign']),\n c('Flyers','/mandiflyer','Mandi Experience Flyer','Mandi plate as the food hero plus supplied special Mandi seating as a memorable dining-experience hook',['mandi','food','experience']),\n c('Flyers','/mandicampaign','Mandi Flyer + Reel','Create two coordinated deliverables: one standalone Mandi flyer and one separate reel concept using the Mandi plate and supplied special seating references',['mandi','flyer','reel']),\n c('Flyers','/ctaflyer','CTA Flyer','Action-first flyer optimized around one unmistakable next step',['cta','conversion']),\n c('Flyers','/menuflyer','Menu Highlight Flyer','Promote a menu range or signature selection without turning the design into a dense menu card',['menu','food']),\n c('Flyers','/launchflyer','Launch Flyer','Big-news launch flyer with a curiosity hook and immediate action cue',['launch','cta']),\n c('Flyers','/experienceflyer','Experience Flyer','Sell a distinctive in-person experience using environment, seating and food/service references',['experience','hospitality']),\n c('Flyers','/boldflyer','Bold Attention Flyer','Maximum-impact flyer with unconventional art direction and strong recall',['bold','attention']),\n c('Flyers','/flyerreel','Flyer + Reel Campaign','Build a coordinated standalone flyer plus a separate short-form reel direction sharing one campaign idea',['flyer','reel','campaign']),`;
 code=code.replace(" c('Edit','/edit'",flyers+"\n c('Edit','/edit'");
 code=code.replace("packagingRules:'PACKAGING MODE:","flyerRules:FLYER_RULE,packagingRules:'PACKAGING MODE:");
 code=code.replace("if(x.category==='Packaging')return", "if(x.category==='Flyers')return `${runtime.flyerRules||FLYER_RULE} ${base}`;if(x.category==='Packaging')return");
 code=code.replace("if(mode==='3D')a=a.filter(x=>x.category==='CGI / 3D');else if(mode==='Packaging')", "if(mode==='Flyers')a=a.filter(x=>x.category==='Flyers');else if(mode==='3D')a=a.filter(x=>x.category==='CGI / 3D');else if(mode==='Packaging')");
 code=code.replace("if(mode==='3D')a=a.filter(x=>x.category==='CGI / 3D');else if(mode==='Packaging')", "if(mode==='Flyers')a=a.filter(x=>x.category==='Flyers');else if(mode==='3D')a=a.filter(x=>x.category==='CGI / 3D');else if(mode==='Packaging')");
 code=code.replace("[['Library','Library'],['3D','3D Studio']", "[['Library','Library'],['Flyers','Flyer Studio'],['3D','3D Studio']");
 code=code.replace("menu.querySelector('.sectionTitle').textContent=mode==='3D'?'3D Studio':mode;", "menu.querySelector('.sectionTitle').textContent=mode==='3D'?'3D Studio':mode==='Flyers'?'Flyer Studio':mode;");
 code=code.replace("if(!s)mode='Library';else if(s.includes('3d')||s.includes('cgi'))", "if(!s)mode='Library';else if(['flyer','loyalty','pulav','mandi'].some(k=>s.includes(k)))mode='Flyers';else if(s.includes('3d')||s.includes('cgi'))");
 code=code.replace('.card[data-cat="Packaging"]{border-top:3px solid #17a584}', '.card[data-cat="Packaging"]{border-top:3px solid #17a584}.card[data-cat="Flyers"]{border-top:3px solid #f05a3c}');
 const qtyFn=`function quantityRule(x){
  const eligible=['Create','Product Ads','CGI / 3D','Flyers','Food','Social','Campaign','Style','Info'].includes(x.category);if(!eligible)return'';
  const n=products==='Auto'?null:Number(products),p=Math.max(1,Number(per)||1),total=n?n*p:null;
  const hard='MULTI-IMAGE OUTPUT LOCK — NON-NEGOTIABLE: produce the requested count as SEPARATE standalone image generations/outputs. Never combine multiple creatives in one canvas, collage, grid, contact sheet, split-screen, multi-panel layout, storyboard, carousel preview or moodboard. When more than one image is requested, DO NOT STOP AFTER IMAGE 1. Continue until the exact requested number of separate images is completed. Every output must be independently usable and visually distinct while the supplied product identity/geometry remains unchanged.';
  if(!n)return \`QUANTITY MODE: auto-detect distinct products from uploaded references; different angles/views of the same SKU count as ONE product. Create EXACTLY \\${p} separate creative image output\\${p>1?'s':''} PER detected product. \\${hard} Maximum 10 images per batch; if the total exceeds 10, continue in ordered batches until complete.\`;
  if(n===1&&p>1)return \`OUTPUT COUNT: EXACTLY \\${p} SEPARATE IMAGE GENERATIONS for ONE SAME PRODUCT. Create \\${p} genuinely different concepts, not one image containing \\${p} designs. Generate Creative 1 through Creative \\${p} as separate outputs. \\${hard}\`;
  if(n>1&&p===1)return \`OUTPUT COUNT: EXACTLY \\${n} SEPARATE IMAGE GENERATIONS — one standalone creative for each of the \\${n} distinct products. Never group the products into one creative. \\${hard}\`;
  return \`OUTPUT COUNT: EXACTLY \\${total} SEPARATE IMAGE GENERATIONS = \\${n} products × \\${p} creatives per product. Each product gets \\${p} genuinely different standalone concepts. \\${hard} \\${total>10?'Deliver in ordered batches of maximum 10 separate images until all '+total+' outputs are complete.':'Generate all '+total+' separate image outputs; do not finish the response early.'}\`;
}`;
 code=code.replace(/function quantityRule\(x\)\{[\s\S]*?\}\nfunction qualityRule\(\)/,qtyFn+'\nfunction qualityRule()');
 code=code.replace('<button class="loadMore" hidden>Load 24 more</button>','<select class="select showCount" style="display:block;width:150px;margin:12px auto 2px"><option value="24">Show 24 presets</option><option value="48">Show 48 presets</option><option value="999">Show all presets</option></select>');
 code=code.replace("menu.querySelector('.loadMore').onclick=()=>{visibleCount+=24;render(false)};updateSummary()","const sc=menu.querySelector('.showCount');if(sc){sc.value='24';sc.onchange=()=>{visibleCount=Number(sc.value)||24;render(false)}};updateSummary()");
 code=code.replace("menu.querySelector('.loadMore').hidden=view.length>=all.length;","const sc=menu.querySelector('.showCount');if(sc){sc.style.display=all.length>24?'block':'none';sc.value=visibleCount>=999?'999':String(visibleCount===48?48:24)};");
 return code;
}

async function loadCore(replayTarget=null){if(loaded||loading)return;loading=true;if(badge)badge.textContent='Virag…';try{let code=await requestText(CORE);code=patchCore(code);badge?.remove();badge=null;(0,eval)(code);loaded=true;if(replayTarget)setTimeout(()=>replayTarget.dispatchEvent(new Event('input',{bubbles:true})),100)}catch(e){console.error('Virag load failed',e);if(badge)badge.textContent='Virag • retry'}finally{loading=false}}
const editorOf=t=>t?.tagName==='TEXTAREA'||t?.isContentEditable?t:t?.closest?.('[contenteditable="true"]');
const valueOf=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'');
function mountBadge(){if(badge||loaded)return;badge=document.createElement('button');badge.type='button';badge.textContent='Virag';Object.assign(badge.style,{position:'fixed',right:'18px',bottom:'88px',zIndex:'2147483647',border:'1px solid #ddd',borderRadius:'999px',background:'#fff',color:'#222',padding:'9px 13px',font:'800 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',boxShadow:'0 8px 24px #0002',cursor:'pointer'});badge.onclick=()=>loadCore();document.documentElement.appendChild(badge)}
clean();
document.addEventListener('input',e=>{if(loaded)return;const ed=editorOf(e.target);if(!ed)return;const t=valueOf(ed);if(/(?:^|\n)\/[\w-]*$/.test(t))loadCore(ed)},true);
const idle=window.requestIdleCallback||((fn)=>setTimeout(fn,900));idle(mountBadge);
})();