// ==UserScript==
// @name         Virag Update Monitor
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      1.0.0
// @description  Live status for Virag V1 Core, 100-code Codebook and Minimal Brain.
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
const R='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const get=u=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:u+'?v='+Date.now(),timeout:10000,onload:r=>{try{if(r.status<200||r.status>299)throw Error();ok(r.responseText)}catch(e){no(e)}},onerror:no,ontimeout:no}));
const h=document.createElement('div');document.documentElement.appendChild(h);const s=h.attachShadow({mode:'open'});s.innerHTML='<style>:host{all:initial}.b{position:fixed;right:22px;bottom:140px;z-index:2147483646;padding:7px 10px;border:1px solid #5ec67d55;border-radius:10px;background:#0b0d0bed;color:#91e3a8;font:800 8px Inter,system-ui;cursor:pointer}.p{position:fixed;right:22px;bottom:178px;z-index:2147483646;width:250px;display:none;padding:10px;border:1px solid #9f72d744;border-radius:14px;background:#0b0910f7;color:#eee6f8;font:9px Inter,system-ui}.p.on{display:block}.r{display:flex;justify-content:space-between;padding:6px 2px;border-top:1px solid #ffffff0d}.ok{color:#8fe1a6}</style><button class="b">Virag V1 · CHECKING</button><div class="p"><div class="r"><span>Core</span><b class="core">—</b></div><div class="r"><span>Codebook</span><b class="code">—</b></div><div class="r"><span>Brain</span><b class="brain">—</b></div><div class="r"><span>Commands</span><b class="count">—</b></div></div>';const b=s.querySelector('.b'),p=s.querySelector('.p');b.onclick=()=>p.classList.toggle('on');
async function run(){try{const [ct,cj,bj]=await Promise.all([get(R+'creative-slash-menu.user.js'),get(R+'commands.json'),get(R+'creative-library.json')]);const c=JSON.parse(cj),br=JSON.parse(bj),cv=ct.match(/@version\s+([^\s]+)/)?.[1]||'?';s.querySelector('.core').textContent=cv;s.querySelector('.code').textContent=c.libraryVersion||'?';s.querySelector('.brain').textContent=br.libraryVersion||'?';s.querySelector('.count').textContent=(c.commands?.length||0)+'/100';b.textContent=`Virag V1 · ${c.commands?.length===100?'100/100 LIVE':'CHECK'}`}catch{b.textContent='Virag V1 · CHECK'}}run();setInterval(run,300000);})();