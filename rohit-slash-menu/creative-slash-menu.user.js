// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      8.0.2
// @description  Virag Lite loader: cleans legacy storage and lazy-loads the full creative OS only when needed.
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
const V='8.0.2';
const CORE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/5a8b3b5f2d644da8d30f6343fb6c68a1e2d43ec9/rohit-slash-menu/creative-slash-menu.user.js';
const KEEP=new Set(['virag.brand','virag.format','virag.layout','virag.platform','virag.quality','virag.products','virag.perProduct','virag.favorites','virag.recent','virag.diversity','virag.lastSync','virag.cleanupVersion']);
let loading=false,loaded=false,badge=null;
const get=(k,d='')=>{try{return String(GM_getValue(k,d)||d)}catch{return d}};
const set=(k,v)=>{try{GM_setValue(k,String(v))}catch{}};
function clean(){
 try{
  if(get('virag.cleanupVersion')===V)return;
  for(const k of GM_listValues())if((k.startsWith('csm')||k.startsWith('virag'))&&!KEEP.has(k))GM_deleteValue(k);
  ['virag.commands','virag.runtime','virag.brands','virag760.commands','virag760.runtime','virag760.brands'].forEach(k=>{try{GM_deleteValue(k)}catch{}});
  set('virag.cleanupVersion',V);
 }catch{}
}
function requestText(url){return new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:url+'?lazy='+Date.now(),timeout:12000,onload:r=>r.status>=200&&r.status<300?ok(r.responseText):no(new Error('HTTP '+r.status)),onerror:no,ontimeout:no}))}
async function loadCore(replayTarget=null){
 if(loaded||loading)return;loading=true;if(badge)badge.textContent='Virag…';
 try{
  let code=await requestText(CORE);
  code=code.replace("const V='8.0.0';",`const V='${V}';`);
  badge?.remove();badge=null;
  (0,eval)(code);
  loaded=true;
  if(replayTarget)setTimeout(()=>replayTarget.dispatchEvent(new Event('input',{bubbles:true})),80);
 }catch(e){if(badge)badge.textContent='Virag • retry'}finally{loading=false}
}
function editorOf(t){return t?.tagName==='TEXTAREA'||t?.isContentEditable?t:t?.closest?.('[contenteditable="true"]')}
function valueOf(e){return e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'')}
function mountBadge(){
 if(badge||loaded)return;
 badge=document.createElement('button');badge.type='button';badge.textContent='Virag';
 Object.assign(badge.style,{position:'fixed',right:'18px',bottom:'88px',zIndex:'2147483647',border:'1px solid #ddd',borderRadius:'999px',background:'#fff',color:'#222',padding:'9px 13px',font:'800 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',boxShadow:'0 8px 24px #0002',cursor:'pointer'});
 badge.onclick=()=>loadCore();document.documentElement.appendChild(badge);
}
clean();
document.addEventListener('input',e=>{if(loaded)return;const ed=editorOf(e.target);if(!ed)return;const t=valueOf(ed);if(/(?:^|\n)\/[\w-]*$/.test(t))loadCore(ed)},true);
const idle=window.requestIdleCallback||((fn)=>setTimeout(fn,900));idle(mountBadge);
})();
