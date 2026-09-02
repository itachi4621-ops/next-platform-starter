// ==UserScript==
// @name         Virag Update Monitor
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      0.0.0
// @description  Virag reset marker. Monitoring disabled until clean V1 rebuild.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-version-monitor.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-version-monitor.user.js
// ==/UserScript==
(()=>{'use strict';const h=document.createElement('div');document.documentElement.appendChild(h);const s=h.attachShadow({mode:'open'});s.innerHTML='<style>:host{all:initial}.b{position:fixed;right:22px;bottom:140px;z-index:2147483646;padding:7px 9px;border:1px solid #a77bd344;border-radius:10px;background:#0b0910ed;color:#b7a9c8;font:800 8px Inter,system-ui}</style><div class="b">Virag · RESET 0.0.0</div>';})();
