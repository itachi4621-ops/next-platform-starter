// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      8.3.2
// @description  Virag flattened stable loader with Ad3X, sequential separate-image queue, Flyer Studio, 3D, exact ratio and product locks.
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
const V='8.3.2';
const ROOT='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/';
const CORE=ROOT+'5a8b3b5f2d644da8d30f6343fb6c68a1e2d43ec9/rohit-slash-menu/creative-slash-menu.user.js';
const PATCH_SOURCE=ROOT+'3193771c9577e0e80a7ada1efd86fdc25d6ae5d7/rohit-slash-menu/creative-slash-menu.user.js';
const AD=ROOT+'main/rohit-slash-menu/ad3x.json';
let loading=false,loaded=false,badge=null;
const req=url=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:url+(url.includes('?')?'&':'?')+'v='+Date.now(),timeout:12000,onload:r=>r.status>=200&&r.status<300?ok(r.responseText):no(new Error('HTTP '+r.status)),onerror:no,ontimeout:no}));
function extractPatchCore(src){const a=src.indexOf('function patchCore(code){'),b=src.indexOf('\nasync function loadCore',a);if(a<0||b<0)throw new Error('Virag patchCore source not found');const fn=src.slice(a,b);return new Function(`const V=${JSON.stringify(V)};${fn};return patchCore;`)()}
function patchAd3X(code,ad){
 const rt=String(ad?.runtime||'');
 const list=Array.isArray(ad?.commands)?ad.commands:[];
 const src='\n '+list.map(x=>JSON.stringify(x)).join(',\n ')+',';
 code=code.replace("const c=(category,cmd,label,desc,tags=[])=>",`const AD_MULTIPLIER_RUNTIME=${JSON.stringify(rt)};\nconst c=(category,cmd,label,desc,tags=[])=>`);
 code=code.replace(" c('Edit','/edit'",src+"\n c('Edit','/edit'");
 code=code.replace("function routed(x){const base=runtime.baseRules||FALLR.baseRules;","function routed(x){const base=runtime.baseRules||FALLR.baseRules;if(x.category==='Ad Multiplier & Performance Ads')return AD_MULTIPLIER_RUNTIME+' '+(runtime.productRules||PRODUCT_LOCK)+' '+NO_INVENT;");
 code=code.replace("function categoriesForMode(){let a=commands;if(mode==='Flyers')","function categoriesForMode(){let a=commands;if(mode==='Ad3X')a=a.filter(x=>x.category==='Ad Multiplier & Performance Ads');else if(mode==='UGC')a=a.filter(x=>['UGC Video','Video / UGC','Ad Multiplier & Performance Ads'].includes(x.category));else if(mode==='Brand')a=a.filter(x=>['Packaging','Brand','Product Ads','Ad Multiplier & Performance Ads'].includes(x.category));else if(mode==='Flyers')");
 code=code.replace("function source(){let a=[...commands];if(mode==='Flyers')","function source(){let a=[...commands];if(mode==='Ad3X')a=a.filter(x=>x.category==='Ad Multiplier & Performance Ads');else if(mode==='UGC')a=a.filter(x=>['UGC Video','Video / UGC','Ad Multiplier & Performance Ads'].includes(x.category));else if(mode==='Brand')a=a.filter(x=>['Packaging','Brand','Product Ads','Ad Multiplier & Performance Ads'].includes(x.category));else if(mode==='Flyers')");
 code=code.replaceAll("else if(mode==='Video')a=a.filter(x=>['Video / UGC','Video','UGC Video','Camera'].includes(x.category));","else if(mode==='Video')a=a.filter(x=>['Video / UGC','Video','UGC Video','Camera','Ad Multiplier & Performance Ads'].includes(x.category));");
 code=code.replace("[['Library','Library'],['Flyers','Flyer Studio']","[['Library','Library'],['Ad3X','Ad3X'],['Flyers','Flyer Studio']");
 code=code.replace("['Video','Video'],['Face','Face / Identity']","['Video','Video'],['UGC','UGC'],['Brand','Brand'],['Face','Face / Identity']");
 code=code.replace("b.onclick=()=>{mode=v;category='All';","b.onclick=()=>{mode=v;if(v==='Ad3X'){format='9:16';ss(K.format,format);const fe=menu.querySelector('.format');if(fe)fe.value=format;}category='All';");
 code=code.replace("menu.querySelector('.sectionTitle').textContent=mode==='3D'?'3D Studio':mode==='Flyers'?'Flyer Studio':mode;","menu.querySelector('.sectionTitle').textContent=mode==='Ad3X'?'Ad Multiplier 3X':mode==='3D'?'3D Studio':mode==='Flyers'?'Flyer Studio':mode;");
 code=code.replace("if(!s)mode='Library';else if(['flyer','loyalty','pulav','mandi'].some(k=>s.includes(k)))","if(!s)mode='Library';else if(['ad3x','ad-multiplier','performance-ad-3x','higgsfield-ad3x','live-ad-intelligence','region-intelligence','creator-3x','credit-min','variant-control'].some(k=>s.includes(k))){mode='Ad3X';format='9:16';ss(K.format,format);const fe=menu.querySelector('.format');if(fe)fe.value=format;}else if(['flyer','loyalty','pulav','mandi'].some(k=>s.includes(k)))");
 code=code.replace('.card[data-cat="Flyers"]{border-top:3px solid #f05a3c}', '.card[data-cat="Flyers"]{border-top:3px solid #f05a3c}.card[data-cat="Ad Multiplier & Performance Ads"]{border-top:3px solid #ff7a18}');
 code=code.replace('Creative OS Lite • 3D • Packaging • Edit • Video','Creative OS • Ad3X • 3D • Packaging • Video');
 code=code.replace('● Sequential Queue','● Sequential Queue &nbsp; ● Ad3X');
 return code;
}
async function load(replay=null){if(loaded||loading)return;loading=true;if(badge)badge.textContent='Virag…';try{const [core,patchSrc,adRaw]=await Promise.all([req(CORE),req(PATCH_SOURCE),req(AD)]);const applyV821=extractPatchCore(patchSrc);let code=applyV821(core);code=code.replace('@version      8.2.1','@version      '+V).replace("const V='8.2.1';",`const V='${V}';`);code=patchAd3X(code,JSON.parse(adRaw));badge?.remove();badge=null;(0,eval)(code);loaded=true;if(replay)setTimeout(()=>replay.dispatchEvent(new Event('input',{bubbles:true})),160)}catch(e){console.error('Virag load failed',e);if(badge){badge.textContent='Virag • retry';badge.title=String(e?.message||e)}}finally{loading=false}}
const editor=t=>t?.tagName==='TEXTAREA'||t?.isContentEditable?t:t?.closest?.('[contenteditable="true"],[contenteditable="plaintext-only"]');
const text=e=>e?.tagName==='TEXTAREA'?e.value:(e?.innerText||e?.textContent||'');
function mount(){if(badge||loaded)return;badge=document.createElement('button');badge.type='button';badge.textContent='Virag';Object.assign(badge.style,{position:'fixed',right:'18px',bottom:'88px',zIndex:'2147483647',border:'1px solid #ddd',borderRadius:'999px',background:'#fff',color:'#222',padding:'9px 13px',font:'800 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',boxShadow:'0 8px 24px #0002',cursor:'pointer'});badge.onclick=()=>load();document.documentElement.appendChild(badge)}
document.addEventListener('input',e=>{if(loaded)return;const ed=editor(e.target);if(!ed)return;if(/(?:^|\n)\/[\w-]*$/.test(text(ed)))load(ed)},true);
(window.requestIdleCallback||((f)=>setTimeout(f,900)))(mount);
})();
