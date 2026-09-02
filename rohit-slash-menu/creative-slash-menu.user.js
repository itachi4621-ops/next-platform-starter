// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      0.0.0
// @description  Virag complete reset baseline. No commands, no libraries, no prompt injection. Ready for clean V1 rebuild.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/creative-slash-menu.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/creative-slash-menu.user.js
// ==/UserScript==
(()=>{'use strict';
const ID='virag-reset-zero';
if(document.getElementById(ID))return;
const host=document.createElement('div');host.id=ID;document.documentElement.appendChild(host);
const sh=host.attachShadow({mode:'open'});
sh.innerHTML=`<style>:host{all:initial}*{box-sizing:border-box}.v{position:fixed;right:22px;bottom:82px;z-index:2147483647;width:54px;height:44px;border:1px solid #b78cff66;border-radius:14px;background:#0b0910;color:#eee3ff;font:900 11px Inter,system-ui;box-shadow:0 8px 28px #0008;cursor:pointer}.p{position:fixed;right:22px;bottom:136px;z-index:2147483647;width:290px;display:none;padding:16px;border:1px solid #8f72b644;border-radius:18px;background:#0b0910f5;color:#eee7f8;font-family:Inter,system-ui;box-shadow:0 22px 60px #000a}.p.on{display:block}.ok{font-size:13px;font-weight:900;margin-bottom:6px}.z{font-size:28px;font-weight:950;color:#b98cff;line-height:1}.m{margin-top:9px;color:#aaa0b8;font-size:9px;line-height:1.6}.tag{display:inline-block;margin-top:12px;padding:6px 8px;border:1px solid #6ec68b44;border-radius:9px;color:#8edda7;font-size:8px;font-weight:900}</style><button class="v">V0</button><div class="p"><div class="ok">VIRAG RESET COMPLETE</div><div class="z">0.0.0</div><div class="m">0 commands<br>0 creative rules<br>0 3D presets<br>0 AI tools<br>0 Movie Lab presets<br>0 Ad3X rules<br>0 prompt injection<br>0 hidden fallbacks</div><span class="tag">READY FOR CLEAN V1</span></div>`;
const b=sh.querySelector('.v'),p=sh.querySelector('.p');b.onclick=()=>p.classList.toggle('on');
})();
