// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      8.4.1
// @description  Virag Creative Library with true workspace filtering, compact deduplicated prompts, Ad3X, Flyer Studio, 3D, sequential separate-image queue, exact ratio and product locks.
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
const V='8.4.1';
const ROOT='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/';
const CORE=ROOT+'5a8b3b5f2d644da8d30f6343fb6c68a1e2d43ec9/rohit-slash-menu/creative-slash-menu.user.js';
const PATCH_SOURCE=ROOT+'3193771c9577e0e80a7ada1efd86fdc25d6ae5d7/rohit-slash-menu/creative-slash-menu.user.js';
const AD=ROOT+'main/rohit-slash-menu/ad3x.json';
const LIB=ROOT+'main/rohit-slash-menu/creative-library.json';
let loading=false,loaded=false,badge=null;
const req=url=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:url+(url.includes('?')?'&':'?')+'v='+Date.now(),timeout:12000,onload:r=>r.status>=200&&r.status<300?ok(r.responseText):no(new Error('HTTP '+r.status)),onerror:no,ontimeout:no}));
function extractPatchCore(src){const a=src.indexOf('function patchCore(code){'),b=src.indexOf('\nasync function loadCore',a);if(a<0||b<0)throw new Error('Virag patchCore source not found');const fn=src.slice(a,b);return new Function(`const V=${JSON.stringify(V)};${fn};return patchCore;`)()}
function replaceSection(code,start,end,replacement){const a=code.indexOf(start);if(a<0)throw new Error('Missing section: '+start);const b=code.indexOf(end,a);if(b<0)throw new Error('Missing section end: '+end);return code.slice(0,a)+replacement+code.slice(b)}

function patchWorkspaces(code,ad){
 const rt=String(ad?.runtime||'');
 const list=Array.isArray(ad?.commands)?ad.commands:[];
 const src='\n '+list.map(x=>JSON.stringify(x)).join(',\n ')+',';
 code=code.replace("const c=(category,cmd,label,desc,tags=[])=>",`const AD_MULTIPLIER_RUNTIME=${JSON.stringify(rt)};\nconst c=(category,cmd,label,desc,tags=[])=>`);
 code=code.replace(" c('Edit','/edit'",src+"\n c('Edit','/edit'");
 code=code.replace("let commands=firstJSON([K.commands,'virag760.commands','csm740.commands','csm730.c'],FALLBACK);",`let commands=(()=>{const cached=firstJSON([K.commands,'virag760.commands','csm740.commands','csm730.c'],[]),m=new Map();FALLBACK.forEach(x=>m.set(x.cmd,x));(Array.isArray(cached)?cached:[]).forEach(x=>x?.cmd&&m.set(x.cmd,{...(m.get(x.cmd)||{}),...x}));return [...m.values()]})();`);
 code=code.replace("function routed(x){const base=runtime.baseRules||FALLR.baseRules;","function routed(x){const base=runtime.baseRules||FALLR.baseRules;if(x.category==='Ad Multiplier & Performance Ads')return AD_MULTIPLIER_RUNTIME+' '+(runtime.productRules||PRODUCT_LOCK)+' '+NO_INVENT;");

 const pools=`function workspacePool(){let a=[...commands];if(mode==='Flyers')return a.filter(x=>x.category==='Flyers');if(mode==='Ad3X')return a.filter(x=>x.category==='Ad Multiplier & Performance Ads');if(mode==='3D')return a.filter(x=>x.category==='CGI / 3D');if(mode==='Packaging')return a.filter(x=>x.category==='Packaging');if(mode==='Video')return a.filter(x=>['Video','Video / UGC','Camera'].includes(x.category));if(mode==='UGC')return a.filter(x=>['UGC Video','Video / UGC'].includes(x.category));if(mode==='Brand')return a.filter(x=>['Brand','Packaging','Product','Product Ads'].includes(x.category));if(mode==='Face')return a.filter(x=>x.category==='Identity / Face');if(mode==='Favorites'){const f=gj(K.favorites,[]);return a.filter(x=>f.includes(x.cmd))}return a;}
function categoriesForMode(){return [...new Set(workspacePool().map(x=>x.category))].sort()}
function source(){let a=workspacePool();if(category!=='All')a=a.filter(x=>x.category===category);if(mode==='3D'&&sub!=='All')a=a.filter(x=>(x.tags||[]).includes(sub));if(query){const q=query.toLowerCase();a=a.filter(x=>[x.cmd,x.label,x.desc,...(x.tags||[])].join(' ').toLowerCase().includes(q))}return a;}
`;
 code=replaceSection(code,'function categoriesForMode(){','function renderTabs(){',pools);

 const tabs=`function renderTabs(){const el=menu.querySelector('.tabs');el.innerHTML='';[['Library','Library'],['Flyers','Flyer Studio'],['Ad3X','Ad3X'],['3D','3D Studio'],['Packaging','Packaging'],['Video','Video'],['UGC','UGC'],['Brand','Brand'],['Face','Face / Identity'],['Favorites','★ Favorites']].forEach(([v,l])=>{const b=document.createElement('button');b.className='tab'+(mode===v?' on':'')+(v==='3D'?' three':'');b.textContent=l;b.onclick=()=>{mode=v;if(v==='Ad3X'){format='9:16';ss(K.format,format);const fe=menu.querySelector('.format');if(fe)fe.value=format;}category='All';sub='All';query='';visibleCount=24;menu.querySelector('.search').value='';render(false)};el.appendChild(b)})}
`;
 code=replaceSection(code,'function renderTabs(){','function renderFilters(){',tabs);

 code=code.replace("menu.querySelector('.sectionTitle').textContent=mode==='3D'?'3D Studio':mode==='Flyers'?'Flyer Studio':mode;",`menu.querySelector('.sectionTitle').textContent=({Library:'Library',Flyers:'Flyer Studio',Ad3X:'Ad Multiplier 3X','3D':'3D Studio',Packaging:'Packaging',Video:'Video',UGC:'UGC',Brand:'Brand',Face:'Face / Identity',Favorites:'Favorites'})[mode]||mode;`);
 code=code.replace("if(!s)mode='Library';else if(['flyer','loyalty','pulav','mandi'].some(k=>s.includes(k)))mode='Flyers';else if(s.includes('3d')||s.includes('cgi'))",`if(!s)mode='Library';else if(['ad3x','ad-multiplier','performance-ad-3x','higgsfield-ad3x','live-ad-intelligence','region-intelligence','creator-3x','credit-min','variant-control'].some(k=>s.includes(k))){mode='Ad3X';format='9:16';ss(K.format,format);const fe=menu.querySelector('.format');if(fe)fe.value=format;}else if(['flyer','loyalty','pulav','mandi'].some(k=>s.includes(k)))mode='Flyers';else if(s.includes('3d')||s.includes('cgi'))`);
 code=code.replace('.card[data-cat="Flyers"]{border-top:3px solid #f05a3c}', '.card[data-cat="Flyers"]{border-top:3px solid #f05a3c}.card[data-cat="Ad Multiplier & Performance Ads"]{border-top:3px solid #ff7a18}');
 code=code.replace('Creative OS Lite • 3D • Packaging • Edit • Video','Creative Library • Workspace OS • Ad3X • 3D');
 code=code.replace('● Sequential Queue','● Workspace Filter &nbsp; ● Sequential Queue');
 return code;
}

function patchLibrary(code,lib){
 const payload=JSON.stringify(lib||{});
 code=code.replace('const COMP=[',`const CREATIVE_LIBRARY=${payload};\nconst COMP=[`);
 const fresh=`function freshSignature(x){const L=CREATIVE_LIBRARY||{},A=L.artDirection||{},h=gj(K.diversity,{n:0}),n=(h.n||0)+1;h.n=n;sj(K.diversity,h);const pick=(a,o)=>Array.isArray(a)&&a.length?a[(n*3+o*5+(x.cmd||'').length)%a.length]:'';return \`ART DIRECTION: composition=\${pick(A.composition,1)}; camera=\${pick(A.camera,2)}; environment=\${pick(A.environment,3)}; typography=\${pick(A.typography,4)}. \${L.modules?.diversity||''}\`;}`;
 code=replaceSection(code,'function freshSignature(x){','\n\nfunction exactFormatRule()',fresh+'\n\n');
 const fmt=`function exactFormatRule(){if(format==='Auto')return'';const L=CREATIVE_LIBRARY||{};return \`FORMAT: \${format}. LAYOUT: \${layout}. \${L.modules?.format||''}\`;}`;
 code=replaceSection(code,'function exactFormatRule(){','\nfunction quantityRule',fmt+'\n');
 const qty=`function quantityRule(x){const eligible=['Create','Product Ads','Product','CGI / 3D','Flyers','Food','Social','Campaign','Style','Info'].includes(x.category);if(!eligible)return'';const L=CREATIVE_LIBRARY||{},one=L.modules?.singleOutput||'';const n=products==='Auto'?null:Number(products),p=Math.max(1,Number(per)||1),total=n?n*p:null;if(!n)return \`OUTPUT: auto-detect distinct products; create \${p} separate creative image\${p>1?'s':''} per product. \${one}\`;if(total===1)return \`OUTPUT: exactly 1 standalone image. \${one}\`;return \`OUTPUT PLAN: \${n} product\${n>1?'s':''} × \${p} creative\${p>1?'s':''} = \${total} separate images. Virag sequential queue sends one image request at a time; never combine them.\`;}`;
 code=replaceSection(code,'function quantityRule(x){','\nfunction qualityRule',qty+'\n');
 const routed=`function routed(x){const L=CREATIVE_LIBRARY||{},mods=L.modules||{},map=L.categoryMap||{};if(x.category==='Ad Multiplier & Performance Ads')return \`\${mods.ad3x||''} \${AD_MULTIPLIER_RUNTIME||''}\`;let key=map[x.category];if(!key&&['Food','Social','Campaign','Style','Info','Product'].includes(x.category))key=x.category==='Product'?'productAd':'creative';return key&&mods[key]?mods[key]:(mods.creative||'');}`;
 code=replaceSection(code,'function routed(x){','\nfunction makePrompt',routed+'\n');
 const make=`function makePrompt(x){const L=CREATIVE_LIBRARY||{},mods=L.modules||{},fresh=['Create','Product Ads','Product','CGI / 3D','Flyers','Food','Social','Campaign','Style','Info'].includes(x.category)?freshSignature(x):'';const plat=platform==='Auto'?'':\`PLATFORM: \${platform}.\`;const productNeeded=['Create','Product Ads','Product','CGI / 3D','Flyers','Food','Social','Campaign','Style','Info'].includes(x.category);return [brandContext(),\`PRESET: \${x.label}. \${x.prompt||x.desc||x.label}.\`,plat,exactFormatRule(),qualityRule(),quantityRule(x),fresh,routed(x),productNeeded?(mods.product||''):'',mods.safety||''].filter(Boolean).join(' ');}`;
 code=replaceSection(code,'function makePrompt(x){','\n\nconst CSS=',make+'\n\n');
 const one=`function viragOnePrompt(x,pi,ci,n,p,index,total){const L=CREATIVE_LIBRARY||{},mods=L.modules||{},fresh=['Create','Product Ads','Product','CGI / 3D','Flyers','Food','Social','Campaign','Style','Info'].includes(x.category)?freshSignature(x):'';const plat=platform==='Auto'?'':\`PLATFORM: \${platform}.\`;const target=n===1?'Use the ONE supplied product as the immutable reference.':\`Use uploaded product #\${pi} of \${n} only; do not include the other products in this image.\`;const productNeeded=['Create','Product Ads','Product','CGI / 3D','Flyers','Food','Social','Campaign','Style','Info'].includes(x.category);return [brandContext(),\`PRESET: \${x.label}. \${x.prompt||x.desc||x.label}.\`,plat,exactFormatRule(),qualityRule(),\`SEQUENTIAL OUTPUT \${index} OF \${total}. EXACTLY ONE STANDALONE IMAGE. \${mods.singleOutput||''}\`,target,\`VARIATION \${ci} OF \${p}: materially change the art direction while keeping product/brand fidelity.\`,fresh,routed(x),productNeeded?(mods.product||''):'',mods.safety||''].filter(Boolean).join(' ');}`;
 code=replaceSection(code,'function viragOnePrompt(','function viragBuildQueue',one+'\n');
 code=code.replace('Virag v${V} • lightweight on-demand sync','Virag v${V} • Creative Library '+String(lib?.libraryVersion||'1.0.0'));
 return code;
}

async function load(replay=null){if(loaded||loading)return;loading=true;if(badge)badge.textContent='Virag…';try{const [core,patchSrc,adRaw,libRaw]=await Promise.all([req(CORE),req(PATCH_SOURCE),req(AD),req(LIB)]);const applyV821=extractPatchCore(patchSrc);let code=applyV821(core);code=code.replace('@version      8.2.1','@version      '+V).replace("const V='8.2.1';",`const V='${V}';`);code=patchWorkspaces(code,JSON.parse(adRaw));code=patchLibrary(code,JSON.parse(libRaw));badge?.remove();badge=null;(0,eval)(code);loaded=true;if(replay)setTimeout(()=>replay.dispatchEvent(new Event('input',{bubbles:true})),160)}catch(e){console.error('Virag load failed',e);if(badge){badge.textContent='Virag • retry';badge.title=String(e?.message||e)}}finally{loading=false}}
const editor=t=>t?.tagName==='TEXTAREA'||t?.isContentEditable?t:t?.closest?.('[contenteditable="true"],[contenteditable="plaintext-only"]');
const text=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||e?.textContent||'');
function mount(){if(badge||loaded)return;badge=document.createElement('button');badge.type='button';badge.textContent='Virag';Object.assign(badge.style,{position:'fixed',right:'18px',bottom:'88px',zIndex:'2147483647',border:'1px solid #ddd',borderRadius:'999px',background:'#fff',color:'#222',padding:'9px 13px',font:'800 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',boxShadow:'0 8px 24px #0002',cursor:'pointer'});badge.onclick=()=>load();document.documentElement.appendChild(badge)}
document.addEventListener('input',e=>{if(loaded)return;const ed=editor(e.target);if(!ed)return;if(/(?:^|\n)\/[\w-]*$/.test(text(ed)))load(ed)},true);
(window.requestIdleCallback||((f)=>setTimeout(f,900)))(mount);
})();
