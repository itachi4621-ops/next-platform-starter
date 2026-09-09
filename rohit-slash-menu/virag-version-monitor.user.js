// ==UserScript==
// @name         Virag Update Monitor
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      2.0.0
// @description  Automatic live update status for every Virag module.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-version-monitor.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-version-monitor.user.js
// ==/UserScript==
(()=>{'use strict';
const R='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/',M=R+'virag-manifest.json',EVERY=300000;
const get=u=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:u+(u.includes('?')?'&':'?')+'v='+Date.now(),headers:{'Cache-Control':'no-cache'},timeout:12000,onload:r=>r.status>=200&&r.status<300?ok(r.responseText):no(Error(String(r.status))),onerror:no,ontimeout:no}));
const version=(text,type)=>{if(type==='userscript')return text.match(/@version\s+([^\s]+)/)?.[1]||'?';try{const j=JSON.parse(text);return String(j.libraryVersion||j.version||j.release||'?')}catch{return'?'}};
const root=document.createElement('div');document.documentElement.appendChild(root);const s=root.attachShadow({mode:'open'});
s.innerHTML=`<style>:host{all:initial}.b{position:fixed;right:22px;bottom:140px;z-index:2147483646;height:34px;padding:0 11px;border:1px solid #9f72d766;border-radius:10px;background:#0b0910f2;color:#eee6f8;font:800 9px Inter,system-ui;cursor:pointer;box-shadow:0 10px 28px #0008}.p{position:fixed;right:22px;bottom:182px;z-index:2147483646;width:278px;display:none;overflow:hidden;border:1px solid #9f72d75c;border-radius:14px;background:#0b0910fa;color:#eee6f8;font:9px Inter,system-ui;box-shadow:0 22px 70px #000b}.p.on{display:block}.h,.f{display:flex;align-items:center;justify-content:space-between;padding:11px 10px}.h{font-weight:900}.time{color:#8f849a;font-size:8px}.rows{border-top:1px solid #ffffff12}.r{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #ffffff0d}.v{font:800 8px ui-monospace,monospace}.ok{color:#6ee89a}.warn{color:#ffd166}.bad{color:#ff7b8d}.tag{font-size:7px;font-weight:950;letter-spacing:.08em}.f{background:#ffffff05}.check{height:30px;padding:0 11px;border:1px solid #a77bd080;border-radius:9px;background:#25172e;color:#f7efff;font:800 8px Inter,system-ui;cursor:pointer}.auto{color:#8f849a;font-size:7px}</style><button class="b">Virag · CHECKING</button><div class="p on"><div class="h"><span>Virag Update Monitor</span><span class="time">—</span></div><div class="rows"></div><div class="f"><button class="check">Check Now</button><span class="auto">AUTO · 5 MIN</span></div></div>`;
const b=s.querySelector('.b'),p=s.querySelector('.p'),rows=s.querySelector('.rows'),time=s.querySelector('.time'),check=s.querySelector('.check');let busy=0;
b.onclick=()=>p.classList.toggle('on');
const render=(mods,states)=>{rows.innerHTML='';mods.forEach((m,i)=>{const st=states[i]||{status:'OFFLINE',actual:'?'};const r=document.createElement('div');r.className='r';const cls=st.status==='LIVE'?'ok':st.status==='UPDATE'?'warn':'bad';r.innerHTML='<span></span><b class="v"></b><span class="tag '+cls+'"></span>';r.children[0].textContent=m.name;r.children[1].textContent=st.actual;r.children[2].textContent=st.status;rows.appendChild(r)})};
async function run(manual=0){if(busy)return;busy=1;b.textContent='Virag · CHECKING';check.disabled=true;try{
const mt=await get(M),man=JSON.parse(mt),mods=Array.isArray(man.modules)?man.modules:[];GM_setValue('virag.manifest.cache',mt);
const rs=await Promise.allSettled(mods.map(m=>get(R+m.file)));const states=mods.map((m,i)=>{const r=rs[i];if(r.status!=='fulfilled')return{status:'OFFLINE',actual:'?'};const v=version(r.value,m.type);return{status:v===String(m.version)?'LIVE':'UPDATE',actual:v}});
render(mods,states);const live=states.filter(x=>x.status==='LIVE').length;const all=live===mods.length;b.textContent=all?'Virag · ALL LIVE':`Virag · ${live}/${mods.length} LIVE`;time.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});GM_setValue('virag.last.check',Date.now());
}catch(e){try{const man=JSON.parse(GM_getValue('virag.manifest.cache','{}')),mods=man.modules||[];render(mods,mods.map(m=>({status:'CACHED',actual:m.version})));b.textContent='Virag · OFFLINE'}catch{b.textContent='Virag · CHECK'}}finally{busy=0;check.disabled=false;if(manual){check.textContent='Updated';setTimeout(()=>check.textContent='Check Now',1600)}}}
check.onclick=()=>run(1);const wake=()=>{if(!document.hidden)run()};run();setInterval(wake,EVERY);window.addEventListener('focus',wake);window.addEventListener('online',wake);document.addEventListener('visibilitychange',wake);
})();