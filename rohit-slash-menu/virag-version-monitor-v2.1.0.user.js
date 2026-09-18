// ==UserScript==
// @name         Virag Update Monitor
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      2.1.0
// @description  Automatic live update status for every Virag module, including dynamic Daily Trends validation.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.xmlHttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-version-monitor.user.js
// @downloadURL  https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/virag-version-monitor.user.js
// ==/UserScript==

(() => {
  'use strict';

  const ROOT = 'https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
  const MANIFEST_URL = ROOT + 'virag-manifest.json';
  const CHECK_INTERVAL = 300000;
  const DAILY_TRENDS_FRESH_MS = 36 * 60 * 60 * 1000;
  const REQUIRED_TREND_SAFEGUARDS = {
    cleanHumanDefault: true,
    maximumFontFamilies: 2,
    shortCopyDefault: true,
    trendCannotAddClutter: true,
    designRichnessDefault: 'premium',
    cleanDoesNotMeanSparse: true,
    premiumArtDirectionRequired: true,
    informationModulesRange: '1-3',
    coordinatedGraphicDevicesRange: '2-5'
  };

  function requestText(url) {
    const cacheFreeUrl = url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
    const options = {
      method: 'GET',
      url: cacheFreeUrl,
      headers: { 'Cache-Control': 'no-cache' },
      timeout: 12000
    };

    return new Promise((resolve, reject) => {
      let settled = false;
      const done = (fn, value) => {
        if (settled) return;
        settled = true;
        fn(value);
      };
      const onload = response => {
        if (response.status >= 200 && response.status < 300) {
          done(resolve, response.responseText);
        } else {
          done(reject, new Error(String(response.status)));
        }
      };
      const onerror = error => done(reject, error instanceof Error ? error : new Error('Network error'));
      const ontimeout = () => done(reject, new Error('Request timeout'));

      try {
        const legacy = typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest : null;
        const modern = typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function'
          ? GM.xmlHttpRequest.bind(GM)
          : null;
        const requester = legacy || modern;
        if (requester) {
          const result = requester({ ...options, onload, onerror, ontimeout });
          if (result && typeof result.then === 'function') {
            result.then(onload).catch(onerror);
          }
          return;
        }
        fetch(cacheFreeUrl, { cache: 'no-store', credentials: 'omit' })
          .then(response => {
            if (!response.ok) throw new Error(String(response.status));
            return response.text();
          })
          .then(text => done(resolve, text))
          .catch(onerror);
      } catch (error) {
        onerror(error);
      }
    });
  }

  async function getStored(key, fallback) {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(key, fallback);
      if (typeof GM !== 'undefined' && typeof GM.getValue === 'function') return await GM.getValue(key, fallback);
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }

  async function setStored(key, value) {
    try {
      if (typeof GM_setValue === 'function') return GM_setValue(key, value);
      if (typeof GM !== 'undefined' && typeof GM.setValue === 'function') return await GM.setValue(key, value);
      localStorage.setItem(key, value);
    } catch {
      // Status monitoring must never interrupt ChatGPT.
    }
  }

  function staticVersion(text, type) {
    if (type === 'userscript') return text.match(/@version\s+([^\s]+)/)?.[1] || '?';
    try {
      const json = JSON.parse(text);
      return String(json.libraryVersion || json.version || json.release || '?');
    } catch {
      return '?';
    }
  }

  function inspectDailyTrends(text) {
    try {
      const json = JSON.parse(text);
      const actual = String(json.libraryVersion || '?');
      const trendDateVersion = String(json.trendDate || '').replaceAll('-', '.');
      const updatedAt = Date.parse(json.updatedAt);
      const age = Date.now() - updatedAt;
      const fresh = Number.isFinite(updatedAt) && age >= -10 * 60 * 1000 && age <= DAILY_TRENDS_FRESH_MS;
      const safeguardsPass = Object.entries(REQUIRED_TREND_SAFEGUARDS)
        .every(([key, value]) => json.safeguards?.[key] === value);
      const valid = json.enabled !== false
        && json.schemaVersion === 1
        && Array.isArray(json.activeTrends)
        && json.activeTrends.length === 8
        && actual === trendDateVersion
        && safeguardsPass
        && fresh;
      const reasons = [];
      if (json.schemaVersion !== 1) reasons.push('schema');
      if (!Array.isArray(json.activeTrends) || json.activeTrends.length !== 8) reasons.push('trend-count');
      if (actual !== trendDateVersion) reasons.push('date-version');
      if (!safeguardsPass) reasons.push('safeguards');
      if (!fresh) reasons.push('stale');
      return { status: valid ? 'LIVE' : 'UPDATE', actual, note: reasons.join(', ') || 'fresh dynamic module' };
    } catch {
      return { status: 'UPDATE', actual: '?', note: 'invalid JSON' };
    }
  }

  function inspectModule(text, module) {
    if (module.id === 'trends') return inspectDailyTrends(text);
    const actual = staticVersion(text, module.type);
    return {
      status: actual === String(module.version) ? 'LIVE' : 'UPDATE',
      actual,
      note: actual === String(module.version) ? 'version matched' : `expected ${module.version}`
    };
  }

  const host = document.createElement('div');
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>
    :host{all:initial}.b{position:fixed;right:22px;bottom:140px;z-index:2147483646;height:34px;padding:0 11px;border:1px solid #9f72d766;border-radius:10px;background:#0b0910f2;color:#eee6f8;font:800 9px Inter,system-ui;cursor:pointer;box-shadow:0 10px 28px #0008}.p{position:fixed;right:22px;bottom:182px;z-index:2147483646;width:278px;display:none;overflow:hidden;border:1px solid #9f72d75c;border-radius:14px;background:#0b0910fa;color:#eee6f8;font:9px Inter,system-ui;box-shadow:0 22px 70px #000b}.p.on{display:block}.h,.f{display:flex;align-items:center;justify-content:space-between;padding:11px 10px}.h{font-weight:900}.time{color:#8f849a;font-size:8px}.rows{border-top:1px solid #ffffff12}.r{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #ffffff0d}.v{font:800 8px ui-monospace,monospace}.ok{color:#6ee89a}.warn{color:#ffd166}.bad{color:#ff7b8d}.tag{font-size:7px;font-weight:950;letter-spacing:.08em}.f{background:#ffffff05}.check{height:30px;padding:0 11px;border:1px solid #a77bd080;border-radius:9px;background:#25172e;color:#f7efff;font:800 8px Inter,system-ui;cursor:pointer}.auto{color:#8f849a;font-size:7px}
  </style><button class="b">Virag · CHECKING</button><div class="p on"><div class="h"><span>Virag Update Monitor</span><span class="time">—</span></div><div class="rows"></div><div class="f"><button class="check">Check Now</button><span class="auto">AUTO · 5 MIN</span></div></div>`;

  const button = shadow.querySelector('.b');
  const panel = shadow.querySelector('.p');
  const rows = shadow.querySelector('.rows');
  const time = shadow.querySelector('.time');
  const check = shadow.querySelector('.check');
  let busy = false;

  button.onclick = () => panel.classList.toggle('on');

  function render(modules, states) {
    rows.innerHTML = '';
    modules.forEach((module, index) => {
      const state = states[index] || { status: 'OFFLINE', actual: '?', note: 'request failed' };
      const row = document.createElement('div');
      row.className = 'r';
      row.title = state.note || '';
      const className = state.status === 'LIVE' ? 'ok' : state.status === 'UPDATE' ? 'warn' : 'bad';
      row.innerHTML = '<span></span><b class="v"></b><span class="tag ' + className + '"></span>';
      row.children[0].textContent = module.name;
      row.children[1].textContent = state.actual;
      row.children[2].textContent = state.status;
      rows.appendChild(row);
    });
  }

  async function run(manual = false) {
    if (busy) return;
    busy = true;
    button.textContent = 'Virag · CHECKING';
    check.disabled = true;
    try {
      const manifestText = await requestText(MANIFEST_URL);
      const manifest = JSON.parse(manifestText);
      const modules = Array.isArray(manifest.modules) ? manifest.modules : [];
      await setStored('virag.manifest.cache', manifestText);
      const results = await Promise.allSettled(modules.map(module => requestText(ROOT + module.file)));
      const states = modules.map((module, index) => {
        const result = results[index];
        if (result.status !== 'fulfilled') return { status: 'OFFLINE', actual: '?', note: String(result.reason || 'request failed') };
        return inspectModule(result.value, module);
      });
      render(modules, states);
      const live = states.filter(state => state.status === 'LIVE').length;
      button.textContent = live === modules.length ? 'Virag · ALL LIVE' : `Virag · ${live}/${modules.length} LIVE`;
      time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await setStored('virag.last.check', Date.now());
      const failedTrend = states[modules.findIndex(module => module.id === 'trends')];
      if (failedTrend && failedTrend.status !== 'LIVE') {
        console.warn('[Virag Monitor] Daily Trends validation failed:', failedTrend.note);
      }
    } catch (error) {
      try {
        const cached = JSON.parse(await getStored('virag.manifest.cache', '{}'));
        const modules = cached.modules || [];
        render(modules, modules.map(module => ({ status: 'CACHED', actual: module.version, note: 'offline cached manifest' })));
        button.textContent = 'Virag · OFFLINE';
      } catch {
        button.textContent = 'Virag · CHECK';
      }
    } finally {
      busy = false;
      check.disabled = false;
      if (manual) {
        check.textContent = 'Updated';
        setTimeout(() => { check.textContent = 'Check Now'; }, 1600);
      }
    }
  }

  check.onclick = () => run(true);
  const wake = () => { if (!document.hidden) run(); };
  run();
  setInterval(wake, CHECK_INTERVAL);
  window.addEventListener('focus', wake);
  window.addEventListener('online', wake);
  document.addEventListener('visibilitychange', wake);
})();
