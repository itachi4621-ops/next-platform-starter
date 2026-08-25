// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      7.8.0
// @description  Virag Creative OS: rich clean UI, 3D Studio, exact ratio lock, product lock, anti-repeat, 2K/4K and quantity controls.
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
const VERSION='7.8.0';
const CORE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/d1dd4774900ef6facf2cd0cf5042b2a8b1587500/rohit-slash-menu/creative-slash-menu.user.js';
const KP='virag.products',KC='virag.perProduct';
const get=(k,d)=>{try{return String(GM_getValue(k,d)||d)}catch{return d}};
const set=(k,v)=>{try{GM_setValue(k,String(v))}catch{}};
const req=u=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:u+'?v='+Date.now(),timeout:15000,onload:r=>r.status>=200&&r.status<300?ok(r.responseText):no(new Error('HTTP '+r.status)),onerror:no,ontimeout:no}));
const clean=t=>t.replace(/^\/\/ ==UserScript==[\s\S]*?^\/\/ ==\/UserScript==\s*/m,'');

function editor(){return document.querySelector('textarea')||document.querySelector('[contenteditable="true"]')}
function read(e){return e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'')}
function write(e,t){if(!e)return;if(e.tagName==='TEXTAREA'){const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));return}e.focus();e.textContent=t;e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}))}
function qtyRule(){const p=get(KP,'Auto'),c=Math.max(1,Math.min(5,Number(get(KC,'1'))||1));if(p==='Auto')return `QUANTITY LOCK: detect the number of distinct uploaded products. Create exactly ${c} separate creative${c>1?'s':''} per distinct product. Different angles of the same SKU count as one product. Keep every output as a separate standalone image, never a collage. If only one product is present, create exactly ${c} genuinely different design variation${c>1?'s':''}. If the total exceeds 10 outputs, produce the first 10 in product order.`;const n=Math.max(1,Math.min(5,Number(p)||1)),total=n*c;return `QUANTITY LOCK: there are ${n} distinct product${n>1?'s':''}. Create exactly ${c} separate creative${c>1?'s':''} per product = ${total} requested standalone output${total>1?'s':''}. ${n===1&&c>1?'These must be '+c+' genuinely different design variations of the same product. ':''}${n>1?'Do not combine products unless explicitly requested; treat each product independently. ':''}Never make a collage/contact sheet. ${total>10?'Maximum 10 outputs in this run: produce the first 10 in logical product order.':''}`}

const RICH=`
.shell{width:min(1120px,calc(100vw - 220px))!important;border-radius:28px!important;background:linear-gradient(180deg,#fcfcff,#f7f7fb)!important;border-color:#e4e5ee!important;box-shadow:0 30px 90px rgba(20,20,43,.18),0 8px 24px rgba(20,20,43,.08)!important}
.hero{padding:18px 20px 14px!important;background:linear-gradient(135deg,#fff 0%,#f5f2ff 58%,#fff8fc 100%)!important}
.logo{width:46px!important;height:46px!important;border-radius:16px!important;background:linear-gradient(135deg,#6557ff,#a855f7)!important;box-shadow:0 12px 28px rgba(101,87,255,.28)!important}
.title{font-size:20px!important;letter-spacing:-.5px!important}.subtitle{font-size:11px!important;color:#73737d!important}.status{padding:8px 11px!important;background:#fff!important;box-shadow:0 3px 10px rgba(0,0,0,.03)!important}
.locks{gap:7px!important;margin-top:11px!important}.lock{padding:6px 9px!important;background:rgba(255,255,255,.78)!important}.lock:nth-child(n+3){display:none!important}
.searchRow{padding:14px 16px 12px!important;background:#fbfbfe!important}.search{height:48px!important;border-radius:16px!important;background:#fff!important;border-color:#e6e7ef!important}.search:focus{border-color:#cfc7ff!important;box-shadow:0 0 0 4px rgba(101,87,255,.08)!important}
.nav{gap:8px!important;padding:0 16px 12px!important;background:#fbfbfe!important}.navBtn{padding:9px 13px!important;border:1px solid #ececf2!important;background:#fff!important;border-radius:12px!important}.navBtn.on{background:#171717!important}.navBtn.threed.on{background:linear-gradient(135deg,#6557ff,#a855f7)!important;border-color:transparent!important}
.controls{gap:10px!important;padding:11px 16px!important;background:#fff!important}.controls>div{padding:9px 10px!important;border:1px solid #ececf2!important;border-radius:15px!important;background:linear-gradient(180deg,#fff,#fafafe)!important}.controlLabel{margin-bottom:7px!important;color:#9a9ba8!important}.chip{padding:7px 9px!important}.content{grid-template-columns:180px 1fr!important;background:#f7f7fb!important}.side{padding:13px 9px!important;background:#fafafd!important}.sideBtn{padding:10px 11px!important}.main{padding:16px!important;background:linear-gradient(180deg,#fafafe,#f5f6fb)!important}
.grid{gap:12px!important}.card{min-height:132px!important;padding:14px!important;border-radius:20px!important;border-color:#e7e8ef!important;background:linear-gradient(180deg,#fff,#fbfbfe)!important;box-shadow:0 8px 20px rgba(15,23,42,.04)!important}.card:before{width:100%!important;height:4px!important}.card[data-cat="CGI / 3D"]:before{background:linear-gradient(90deg,#6557ff,#a855f7)!important}.card[data-cat="Packaging"]:before{background:linear-gradient(90deg,#00a184,#4dd9ba)!important}.card:hover{transform:translateY(-2px)!important;box-shadow:0 16px 34px rgba(15,23,42,.09)!important}.cardName{font-size:13px!important}.cardDesc{line-height:1.4!important}.tags{opacity:.66!important}.card:hover .tags{opacity:1!important}.footer{background:#fff!important}
.qtybar{display:grid;grid-template-columns:160px 190px 1fr;gap:10px;align-items:end;padding:10px 16px;border-bottom:1px solid #ececf1;background:linear-gradient(180deg,#fff,#fafafe)}.qtybox{padding:9px 10px;border:1px solid #ececf2;border-radius:15px;background:#fff}.qtylabel{font-size:8px;font-weight:950;letter-spacing:.8px;color:#9a9ba8;margin-bottom:6px}.qtyselect{width:100%;height:32px;border:1px solid #e5e6ed;border-radius:9px;background:#f8f8fb;padding:0 8px;font-size:10px;font-weight:850;color:#34343a;outline:0}.qtysummary{min-height:52px;display:flex;align-items:center;padding:10px 13px;border-radius:15px;background:linear-gradient(135deg,#f2efff,#fff4fa);border:1px solid #e7e1ff;font-size:10px;font-weight:900;color:#5143a8}.qtysummary b{color:#171717}
@media(max-width:900px){.qtybar{grid-template-columns:1fr 1fr}.qtysummary{grid-column:1/-1}.shell{width:calc(100vw - 16px)!important}.content{grid-template-columns:135px 1fr!important}}
`;

function findShell(){for(const e of document.querySelectorAll('*')){if(e.shadowRoot?.querySelector('.shell'))return e.shadowRoot}return null}
function addQuantity(sh){if(sh.querySelector('.qtybar'))return;const controls=sh.querySelector('.controls');if(!controls)return;const bar=document.createElement('div');bar.className='qtybar';bar.innerHTML=`<div class="qtybox"><div class="qtylabel">PRODUCTS</div><select class="qtyselect qp"><option>Auto</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div><div class="qtybox"><div class="qtylabel">CREATIVES / PRODUCT</div><select class="qtyselect qc"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div><div class="qtysummary"></div>`;controls.after(bar);const p=bar.querySelector('.qp'),c=bar.querySelector('.qc'),s=bar.querySelector('.qtysummary');p.value=get(KP,'Auto');c.value=get(KC,'1');const paint=()=>{set(KP,p.value);set(KC,c.value);const pv=p.value,cv=Number(c.value),total=pv==='Auto'?null:Number(pv)*cv;s.innerHTML=pv==='Auto'?`Auto-detect products × <b>${cv}</b> creative${cv>1?'s':''} each`:`<b>${pv} × ${cv} = ${total}</b>&nbsp; separate output${total===1?'':'s'}${total>10?' • first 10 this run':''}`};p.onchange=paint;c.onchange=paint;paint();
 const grid=sh.querySelector('.grid');grid?.addEventListener('click',e=>{if(!e.target.closest('.card'))return;setTimeout(()=>{const ed=editor();if(!ed)return;const t=read(ed);if(t.includes('QUANTITY LOCK:'))return;write(ed,t.trim()+`\n\n${qtyRule()}`)},80)},true)
}
function beautify(sh){if(!sh||sh.__virag78)return;sh.__virag78=true;const st=document.createElement('style');st.textContent=RICH;sh.appendChild(st);addQuantity(sh);const patch=()=>{sh.querySelectorAll('.status').forEach(e=>e.textContent=e.textContent.replace(/v7\.6\.0|v7\.7\.0/g,'v'+VERSION));sh.querySelectorAll('.footer span').forEach(e=>e.textContent=e.textContent.replace(/v7\.6\.0|v7\.7\.0/g,'v'+VERSION));const sub=sh.querySelector('.subtitle');if(sub)sub.textContent='Rich Creative Workspace • 3D Studio • Packaging • Edit • Video'};patch();new MutationObserver(()=>{patch();addQuantity(sh)}).observe(sh,{subtree:true,childList:true})}
function watch(){const go=()=>{const sh=findShell();if(sh)beautify(sh)};go();new MutationObserver(go).observe(document.documentElement,{childList:true,subtree:true});setInterval(go,1500)}

req(CORE).then(t=>{(0,eval)(clean(t));watch()}).catch(err=>console.error('[Virag 7.8] core load failed',err));
})();
