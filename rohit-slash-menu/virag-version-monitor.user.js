// ==UserScript==
// @name         Virag Update Monitor
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      1.0.0
// @description  Live Virag version badge for Core, Creative Brain, Commands, 3D, AI, Movie and Ad3X.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-version-monitor.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-version-monitor.user.js
// ==/UserScript==
(()=>{'use strict';
const ROOT='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const SRC={
 core:{url:ROOT+'creative-slash-menu.user.js',type:'text'},
 brain:{url:ROOT+'creative-library.json',type:'json'},
 commands:{url:ROOT+'commands.json',type:'json'},
 d3:{url:ROOT+'3d-library.json',type:'json'},
 ai:{url:ROOT+'ai-tools.json',type:'json'},
 movie:{url:ROOT+'movie-lab.json',type:'json'},
 ad3x:{url:ROOT+'ad3x.json',type:'json'}
};
const get=(url,type)=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:url+'?v='+Date.now(),timeout:10000,onload:r=>{try{if(r.status<200||r.status>299)throw Error('HTTP '+r.status);ok(type==='json'?JSON.parse(r.responseText):r.responseText)}catch(e){no(e)}},onerror:no,ontimeout:no}));
const ver=(id,v)=>{
 if(id==='core')return String(v.match(/@version\s+([^\s]+)/)?.[1]||v.match(/const V='([^']+)'/)?.[1]||'?');
 if(id==='ad3x')return String(v.version||v.libraryVersion||'?');
 return String(v.libraryVersion||v.version||'?');
};
let data={},host,sh,badge,panel,stamp='';
const CSS=`:host{all:initial}*{box-sizing:border-box}.badge{position:fixed;right:22px;bottom:140px;z-index:2147483646;height:30px;padding:0 10px;border:1px solid #56c77b66;border-radius:11px;background:#0b1110ed;color:#93e7ad;font:800 9px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 8px 28px #0008;cursor:pointer}.badge.warn{border-color:#d9a84f66;color:#f0cc7b;background:#15120bed}.panel{position:fixed;right:22px;bottom:178px;z-index:2147483646;width:280px;display:none;padding:10px;border:1px solid #9f72d74a;border-radius:16px;background:linear-gradient(145deg,#171222f5,#09080df8);color:#f4ecff;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 20px 55px #000a}.panel.on{display:block}.title{display:flex;align-items:center;gap:8px;margin-bottom:8px}.title b{font-size:11px}.title small{margin-left:auto;color:#9f96a8;font-size:8px}.row{display:grid;grid-template-columns:1fr auto auto;gap:7px;align-items:center;padding:7px 5px;border-top:1px solid #ffffff0d;font-size:9px}.v{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#ddd0ed}.live{color:#86dfa2;font-size:8px;font-weight:900}.err{color:#ff9ca1;font-size:8px;font-weight:900}.actions{display:flex;gap:6px;margin-top:9px}.btn{height:28px;border:1px solid #a77bd34a;border-radius:9px;background:#171020;color:#eee4fb;padding:0 9px;font-size:8px;font-weight:800;cursor:pointer}.note{margin-top:8px;color:#9d94a8;font-size:7.5px;line-height:1.4}`;
function mount(){if(host)return;host=document.createElement('div');document.documentElement.appendChild(host);sh=host.attachShadow({mode:'open'});sh.innerHTML=`<style>${CSS}</style><button class="badge warn">Virag · CHECKING</button><div class="panel"><div class="title"><b>Virag Update Monitor</b><small class="time">—</small></div><div class="rows"></div><div class="actions"><button class="btn refresh">Check Now</button></div><div class="note">LIVE means this monitor fetched the current GitHub file directly. After a Virag library update, press Sync in Virag and compare the version here.</div></div>`;badge=sh.querySelector('.badge');panel=sh.querySelector('.panel');badge.onclick=()=>panel.classList.toggle('on');sh.querySelector('.refresh').onclick=refresh;}
function render(){mount();const b=data.brain;badge.textContent=b?.ok?`Virag · Brain ${b.version} LIVE`:'Virag · PARTIAL';badge.className='badge'+(b?.ok?'':' warn');const labels={core:'Core',brain:'Creative Brain',commands:'Commands',d3:'3D Studio',ai:'AI Tools',movie:'Movie Lab',ad3x:'Ad3X'};sh.querySelector('.rows').innerHTML=Object.keys(labels).map(k=>{const x=data[k]||{};return `<div class="row"><span>${labels[k]}</span><span class="v">${x.version||'—'}</span><span class="${x.ok?'live':'err'}">${x.ok?'LIVE':'ERROR'}</span></div>`}).join('');sh.querySelector('.time').textContent=stamp;}
async function refresh(){mount();badge.textContent='Virag · CHECKING';badge.className='badge warn';const ids=Object.keys(SRC),rs=await Promise.allSettled(ids.map(id=>get(SRC[id].url,SRC[id].type)));data={};for(let i=0;i<ids.length;i++){const id=ids[i],r=rs[i];if(r.status==='fulfilled')data[id]={ok:true,version:ver(id,r.value)};else data[id]={ok:false,version:'—'};}stamp=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});render();}
mount();refresh();setInterval(refresh,300000);
})();