// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      5.0.0
// @description  English-only creative-design slash menu for ChatGPT with free automatic updates.
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

(() => {
  'use strict';

  const VERSION = '5.0.0';
  const COMMANDS_URL = 'https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/commands.json';
  const CACHE_KEY = 'creativeSlashMenu.commands.v5';
  const CACHE_TIME_KEY = 'creativeSlashMenu.commandsTime.v5';
  const SYNC_MS = 6 * 60 * 60 * 1000;

  const FALLBACK = {
    libraryVersion: '5.0.0-local',
    categories: ['Core','Product','Campaign','Style','Environment','Social','Info','Print','Brand','Utility'],
    commands: [
      {category:'Core',cmd:'/creative',label:'Fresh Creative',desc:'Create a fresh, non-repetitive professional creative'},
      {category:'Core',cmd:'/trend',label:'Trend-Led',desc:'Use a current premium design direction'},
      {category:'Core',cmd:'/surprise',label:'Surprise Me',desc:'Choose an unexpected premium art direction'},
      {category:'Core',cmd:'/redesign',label:'Redesign',desc:'Completely redesign the uploaded creative'},
      {category:'Product',cmd:'/productad',label:'Product Ad',desc:'Create a professional product advertisement'},
      {category:'Product',cmd:'/producthero',label:'Product Hero',desc:'Build a premium hero-product composition'},
      {category:'Product',cmd:'/cgi',label:'CGI Creative',desc:'Create a high-end 3D CGI product advertising scene'},
      {category:'Product',cmd:'/studio',label:'Studio Shot',desc:'Create premium commercial studio product photography'},
      {category:'Product',cmd:'/macro',label:'Macro Detail',desc:'Create an extreme close-up product detail visual'},
      {category:'Product',cmd:'/floating',label:'Floating Product',desc:'Create a dynamic floating-product composition'},
      {category:'Product',cmd:'/ingredients',label:'Ingredients',desc:'Create ingredient-led product storytelling'},
      {category:'Product',cmd:'/benefits',label:'Benefits',desc:'Visualize key product benefits without clutter'},
      {category:'Campaign',cmd:'/launch',label:'Launch',desc:'Create a premium product or brand launch campaign'},
      {category:'Campaign',cmd:'/offer',label:'Offer / Sale',desc:'Create a premium promotional offer creative'},
      {category:'Style',cmd:'/premium',label:'Premium',desc:'Use high-end commercial advertising art direction'},
      {category:'Style',cmd:'/luxury',label:'Luxury',desc:'Use sophisticated luxury editorial art direction'},
      {category:'Style',cmd:'/minimal',label:'Minimal',desc:'Use clean negative space and precise hierarchy'},
      {category:'Style',cmd:'/cinematic',label:'Cinematic',desc:'Use film-like lighting, depth and framing'},
      {category:'Style',cmd:'/surreal',label:'Surreal',desc:'Use a reality-bending premium product concept'},
      {category:'Environment',cmd:'/gym',label:'Gym',desc:'Use a premium fitness or gym environment'},
      {category:'Environment',cmd:'/lifestyle',label:'Lifestyle',desc:'Create a real-world lifestyle campaign visual'},
      {category:'Environment',cmd:'/ugc',label:'UGC Style',desc:'Create a natural creator-style visual with commercial polish'},
      {category:'Social',cmd:'/story',label:'Story',desc:'Create a vertical 9:16 Instagram Story creative'},
      {category:'Social',cmd:'/reelcover',label:'Reel Cover',desc:'Create a high-impact vertical Reel cover'},
      {category:'Social',cmd:'/carousel',label:'Carousel',desc:'Create separate carousel slide concepts'},
      {category:'Info',cmd:'/infographic',label:'Infographic',desc:'Create clear premium visual information design'},
      {category:'Brand',cmd:'/packaging',label:'Packaging',desc:'Create or redesign product packaging'},
      {category:'Brand',cmd:'/label',label:'Label Design',desc:'Create or redesign the product label'},
      {category:'Utility',cmd:'/layout',label:'Layout',desc:'Improve composition, spacing and hierarchy'},
      {category:'Utility',cmd:'/resize',label:'Resize',desc:'Adapt the design to another aspect ratio'}
    ]
  };

  const BASE_RULES = 'Use the uploaded product/image/reference whenever one is present. Preserve the original product shape, packaging, label, logo, colors, proportions and brand identity accurately. Aim for a genuinely fresh global-advertising-quality concept, not a generic template. Avoid repeating recent composition, pedestal, splash, background, lighting, camera angle, typography system, material treatment or overall layout. Keep unnecessary text to a minimum. Unless another format is explicitly requested, use a standalone 4:5 Instagram creative. Never make a collage unless explicitly requested.';

  const SPECIAL = {
    '/creative': `Create a completely fresh high-end professional creative. Choose the strongest art direction for the uploaded product/image and make it visibly different from recent designs. ${BASE_RULES}`,
    '/trend': `Create a current trend-led premium creative. First research relevant contemporary high-end advertising, CGI, editorial and social design references online when useful, then synthesize an original direction instead of copying one reference. ${BASE_RULES}`,
    '/surprise': `Create an unexpected but commercially strong premium creative. Choose a less obvious art direction, composition and visual story while keeping the result brand-appropriate and polished. ${BASE_RULES}`,
    '/redesign': `Completely redesign the uploaded creative. Keep only the essential content and brand information, but rebuild the composition, hierarchy, background, typography treatment, lighting, visual story and overall design system. Do not simply recolor or rearrange the existing design. ${BASE_RULES}`,
    '/cgi': `Create a high-end 3D CGI advertising creative using the uploaded product image as the exact hero-product reference. Build an original cinematic 3D environment around it with physically believable materials, premium commercial lighting, realistic reflections and shadows, atmospheric depth and strong art direction. Avoid the generic centered-product-on-a-pedestal formula unless the concept genuinely requires it. Do not reuse the same rocks, smoke, splash, pedestal, camera angle or background from recent creatives. Make it look like a premium global campaign. ${BASE_RULES}`,
    '/productad': `Create a high-end professional product advertisement with strong hierarchy, premium commercial lighting and a fresh visual concept. Make the product the unmistakable focal point without distorting its packaging. ${BASE_RULES}`,
    '/producthero': `Create a premium hero-product campaign visual. Use scale, depth, lighting, framing and supporting elements to make the product dominant and iconic while preserving it exactly. ${BASE_RULES}`,
    '/story': 'Create a premium standalone 9:16 Instagram Story creative with a fresh vertical composition, strong hierarchy and accurate brand/product visuals. Never make a collage.',
    '/reelcover': 'Create a premium standalone 9:16 Reel cover with an immediate focal point, readable hierarchy at mobile size and a fresh campaign look. Preserve the uploaded product/brand accurately.',
    '/carousel': 'Create a premium Instagram carousel system. Every slide must be delivered as a separate standalone image, never combined into a collage or contact sheet. Keep the campaign cohesive while giving each slide a distinct composition. Default each slide to 4:5. Preserve product and brand identity accurately.',
    '/infographic': 'Create a premium infographic that communicates the information primarily through hierarchy, icons, diagrams and visual grouping rather than dense text. Make it easy to understand at a glance and aesthetically polished. Default to standalone 4:5 unless another format is clearly better.',
    '/packaging': 'Create or redesign the packaging using the uploaded brand/product reference. Preserve all required factual information and brand elements while improving hierarchy, shelf impact, typography, graphics and material treatment. Do not invent mandatory product claims.',
    '/label': 'Create or redesign the product label using the uploaded reference. Preserve required factual information, dimensions and brand identity where provided, while improving typography, hierarchy, graphics and premium finish.',
    '/resize': 'Adapt the uploaded design to the requested aspect ratio while preserving the visual hierarchy, key content and product accuracy. Recompose intelligently rather than simply stretching or cropping.'
  };

  function genericPrompt(item) {
    const action = item.desc || item.label || item.cmd;
    switch (item.category) {
      case 'Style': return `Create a premium creative using the “${item.label}” visual direction. ${action}. ${BASE_RULES}`;
      case 'Environment': return `Create a premium product/campaign creative using a “${item.label}” environment or visual world. ${action}. ${BASE_RULES}`;
      case 'Campaign': return `Create a premium campaign creative for “${item.label}”. ${action}. ${BASE_RULES}`;
      case 'Product': return `Create a premium product-focused creative using the “${item.label}” treatment. ${action}. ${BASE_RULES}`;
      case 'Social': return `Create a premium social-media design for “${item.label}”. ${action}. Preserve uploaded brand/product identity accurately and keep the composition fresh.`;
      case 'Info': return `Create a clear premium “${item.label}” visual. ${action}. Prioritize comprehension, hierarchy and clean information design.`;
      case 'Print': return `Create a professional “${item.label}” design using the supplied content and brand assets. ${action}. Use print-conscious hierarchy and spacing; use the provided dimensions when available.`;
      case 'Brand': return `Create a premium brand-design output for “${item.label}”. ${action}. Preserve existing brand identity and required factual information unless the user asks for a rebrand.`;
      case 'Utility': return `${action} using the uploaded creative/image. Preserve factual content, product identity and brand accuracy while improving the requested aspect.`;
      default: return `Create a premium creative for “${item.label}”. ${action}. ${BASE_RULES}`;
    }
  }

  function normalizeLibrary(remote) {
    const incoming = remote && Array.isArray(remote.commands) ? remote.commands : [];
    const local = Object.fromEntries(FALLBACK.commands.map(x => [x.cmd, x]));
    const remoteMap = Object.fromEntries(incoming.filter(x => x && x.cmd).map(x => [x.cmd, x]));
    const order = [];
    incoming.forEach(x => { if (x?.cmd && !order.includes(x.cmd)) order.push(x.cmd); });
    FALLBACK.commands.forEach(x => { if (!order.includes(x.cmd)) order.push(x.cmd); });
    const commands = order.map(cmd => {
      const item = {...(local[cmd] || {}), ...(remoteMap[cmd] || {})};
      item.prompt = item.prompt || SPECIAL[cmd] || genericPrompt(item);
      return item;
    }).filter(x => x.cmd && x.label);
    const categories = Array.from(new Set([...(remote?.categories || []), ...FALLBACK.categories, ...commands.map(x => x.category).filter(Boolean)]));
    return {...FALLBACK, ...(remote || {}), categories, commands};
  }

  function getCachedLibrary() {
    try {
      const raw = GM_getValue(CACHE_KEY, '');
      if (raw) return normalizeLibrary(JSON.parse(raw));
    } catch (_) {}
    return normalizeLibrary(FALLBACK);
  }

  function setCachedLibrary(lib) {
    try {
      GM_setValue(CACHE_KEY, JSON.stringify(lib));
      GM_setValue(CACHE_TIME_KEY, Date.now());
    } catch (_) {}
  }

  function requestJSON(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `${url}?t=${Date.now()}`,
        timeout: 12000,
        onload: r => {
          try {
            if (r.status < 200 || r.status >= 300) throw new Error(`HTTP ${r.status}`);
            resolve(JSON.parse(r.responseText));
          } catch (e) { reject(e); }
        },
        onerror: reject,
        ontimeout: () => reject(new Error('timeout'))
      });
    });
  }

  let LIB = getCachedLibrary();
  let syncStatus = 'Ready';
  async function syncLibrary(force = false) {
    const last = Number(GM_getValue(CACHE_TIME_KEY, 0) || 0);
    if (!force && Date.now() - last < SYNC_MS) return LIB;
    try {
      const remote = await requestJSON(COMMANDS_URL);
      LIB = normalizeLibrary(remote);
      setCachedLibrary(LIB);
      syncStatus = 'Synced';
    } catch (_) {
      LIB = getCachedLibrary();
      syncStatus = last ? 'Cached' : 'Built-in';
    }
    return LIB;
  }

  let host, shadow, menu, activeEditor = null, items = [], selectedIndex = 0, currentQuery = '', activeCategory = 'All';

  const CSS = `
    :host{all:initial}.menu{box-sizing:border-box;position:fixed;z-index:2147483647;display:none;overflow:hidden;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(22,22,25,.985);color:#fff;box-shadow:0 22px 70px rgba(0,0,0,.55);backdrop-filter:blur(20px);font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.menu.show{display:block}.header{display:flex;justify-content:space-between;align-items:center;padding:14px 15px 11px;border-bottom:1px solid rgba(255,255,255,.07)}.title{font-size:14px;font-weight:750}.subtitle{margin-top:3px;font-size:11px;color:rgba(255,255,255,.5)}.status{font-size:10px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.75)}.categories{display:flex;gap:6px;overflow-x:auto;padding:8px 9px;border-bottom:1px solid rgba(255,255,255,.055);scrollbar-width:none}.categories::-webkit-scrollbar{display:none}.cat{border:0;border-radius:999px;padding:6px 9px;background:rgba(255,255,255,.055);color:rgba(255,255,255,.65);font:500 10.5px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;white-space:nowrap}.cat.active,.cat:hover{background:rgba(167,139,250,.18);color:#d8ccff}.list{max-height:min(430px,50vh);overflow-y:auto;padding:7px}.item{box-sizing:border-box;display:grid;grid-template-columns:125px 1fr;gap:10px;align-items:center;padding:10px 11px;border-radius:11px;cursor:pointer}.item:hover,.item.selected{background:rgba(255,255,255,.085)}.command{font:750 12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#b9a5ff}.topline{display:flex;align-items:center;gap:7px}.label{font-size:12.8px;font-weight:680}.chip{font-size:9px;padding:2px 5px;border-radius:5px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.45)}.desc{margin-top:2px;font-size:11.3px;line-height:1.3;color:rgba(255,255,255,.55)}.empty{padding:22px;text-align:center;font-size:12px;color:rgba(255,255,255,.5)}.footer{display:flex;align-items:center;justify-content:space-between;padding:8px 11px;border-top:1px solid rgba(255,255,255,.06);font-size:10px;color:rgba(255,255,255,.43)}.sync{border:0;border-radius:7px;padding:5px 8px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.76);cursor:pointer;font-size:10px}.sync:hover{background:rgba(255,255,255,.12)}`;

  function isEditor(el) {
    return !!el && (el.tagName === 'TEXTAREA' || el.isContentEditable || !!el.closest?.('[contenteditable="true"]'));
  }
  function getEditor(el) {
    if (!el) return null;
    if (el.tagName === 'TEXTAREA') return el;
    if (el.isContentEditable) return el;
    return el.closest?.('[contenteditable="true"]') || null;
  }
  function getText(editor) {
    return editor?.tagName === 'TEXTAREA' ? editor.value : (editor?.innerText || '');
  }
  function setText(editor, text) {
    if (!editor) return;
    if (editor.tagName === 'TEXTAREA') {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      if (setter) setter.call(editor, text); else editor.value = text;
      editor.dispatchEvent(new Event('input', {bubbles:true}));
      editor.focus();
      try { editor.setSelectionRange(text.length, text.length); } catch (_) {}
      return;
    }
    editor.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    sel.removeAllRanges();
    sel.addRange(range);
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (_) {}
    if (!ok) {
      editor.replaceChildren();
      const p = document.createElement('p');
      p.textContent = text;
      editor.appendChild(p);
      editor.dispatchEvent(new InputEvent('input', {bubbles:true,inputType:'insertText',data:text}));
    }
    const end = document.createRange();
    end.selectNodeContents(editor); end.collapse(false);
    sel.removeAllRanges(); sel.addRange(end); editor.focus();
  }

  function createMenu() {
    if (menu) return;
    host = document.createElement('div');
    host.id = 'creative-slash-menu-userscript-host';
    host.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647';
    document.documentElement.appendChild(host);
    shadow = host.attachShadow({mode:'open'});
    const style = document.createElement('style'); style.textContent = CSS; shadow.appendChild(style);
    menu = document.createElement('div'); menu.className = 'menu';
    menu.innerHTML = `<div class="header"><div><div class="title">Creative Commands</div><div class="subtitle">English only • Free auto-update • Real prompt actions</div></div><div class="status">Ready</div></div><div class="categories"></div><div class="list"></div><div class="footer"><span class="version">v${VERSION}</span><button class="sync" type="button">Sync commands</button></div>`;
    shadow.appendChild(menu);
    menu.querySelector('.sync').addEventListener('mousedown', async e => {
      e.preventDefault(); e.stopPropagation(); menu.querySelector('.status').textContent = 'Syncing…';
      await syncLibrary(true); render(currentQuery);
    });
  }

  function positionMenu() {
    if (!menu || !activeEditor) return;
    const r = activeEditor.getBoundingClientRect();
    const width = Math.min(620, Math.max(390, r.width || 390));
    menu.style.width = `${width}px`;
    let left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
    let top = r.top - Math.min(560, window.innerHeight * .64) - 10;
    if (top < 12) top = Math.min(r.bottom + 8, window.innerHeight - 500);
    menu.style.left = `${left}px`; menu.style.top = `${Math.max(12, top)}px`;
  }

  function renderCategories() {
    const wrap = menu.querySelector('.categories'); wrap.innerHTML = '';
    ['All', ...(LIB.categories || [])].forEach(cat => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = cat;
      b.className = `cat${cat === activeCategory ? ' active' : ''}`;
      b.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); activeCategory = cat; selectedIndex = 0; render(currentQuery); });
      wrap.appendChild(b);
    });
  }

  function score(item, q) {
    if (!q) return 1;
    const hay = [item.cmd,item.label,item.desc,...(item.tags || [])].join(' ').toLowerCase();
    let s = hay.includes(q) ? 10 : 0;
    if ((item.cmd || '').toLowerCase().startsWith('/' + q)) s += 20;
    if ((item.label || '').toLowerCase().startsWith(q)) s += 8;
    return s;
  }

  function render(query='') {
    createMenu(); currentQuery = String(query || '').toLowerCase().trim(); renderCategories();
    let filtered = (LIB.commands || []).filter(x => activeCategory === 'All' || x.category === activeCategory);
    if (currentQuery) filtered = filtered.map(x => [x,score(x,currentQuery)]).filter(x => x[1] > 0).sort((a,b) => b[1]-a[1]).map(x => x[0]);
    filtered = filtered.slice(0,18); items = filtered; selectedIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));
    const list = menu.querySelector('.list'); list.innerHTML = '';
    filtered.forEach((x,i) => {
      const row = document.createElement('div'); row.className = `item${i === selectedIndex ? ' selected' : ''}`;
      row.innerHTML = '<div class="command"></div><div><div class="topline"><span class="label"></span><span class="chip"></span></div><div class="desc"></div></div>';
      row.querySelector('.command').textContent = x.cmd || ''; row.querySelector('.label').textContent = x.label || ''; row.querySelector('.chip').textContent = x.category || ''; row.querySelector('.desc').textContent = x.desc || '';
      row.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); selectCommand(x); }); list.appendChild(row);
    });
    if (!filtered.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No matching command'; list.appendChild(e); }
    menu.querySelector('.status').textContent = syncStatus;
    menu.querySelector('.version').textContent = `Script ${VERSION} • Library ${LIB.libraryVersion || 'local'}`;
    menu.classList.add('show'); positionMenu();
  }

  function hideMenu() { if (menu) menu.classList.remove('show'); items = []; selectedIndex = 0; currentQuery = ''; activeCategory = 'All'; }
  function slashQuery(text) { const m = String(text || '').match(/(?:^|\n)\/([a-zA-Z0-9_-]*)$/); return m ? m[1] : null; }
  function selectCommand(item) {
    if (!activeEditor || !item) return;
    const text = getText(activeEditor); const replacement = item.prompt || item.desc || item.cmd;
    const replaced = text.replace(/(?:^|\n)\/[a-zA-Z0-9_-]*$/, m => (m.startsWith('\n') ? '\n' : '') + replacement);
    setText(activeEditor, replaced); hideMenu();
  }

  document.addEventListener('input', async e => {
    if (!isEditor(e.target)) return;
    activeEditor = getEditor(e.target); const q = slashQuery(getText(activeEditor));
    if (q !== null) { await syncLibrary(false); render(q); } else hideMenu();
  }, true);

  document.addEventListener('keydown', e => {
    if (!menu?.classList.contains('show') || !isEditor(e.target)) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); selectedIndex = (selectedIndex + 1) % Math.max(1, items.length); render(currentQuery); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); selectedIndex = (selectedIndex - 1 + Math.max(1, items.length)) % Math.max(1, items.length); render(currentQuery); }
    else if (e.key === 'Enter' && !e.shiftKey && items.length) { e.preventDefault(); e.stopPropagation(); selectCommand(items[selectedIndex]); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hideMenu(); }
  }, true);

  document.addEventListener('pointerdown', e => {
    if (!menu?.classList.contains('show')) return;
    const path = e.composedPath?.() || [];
    if (path.includes(host) || path.includes(menu)) return;
    if (!isEditor(e.target)) hideMenu();
  }, true);

  window.addEventListener('resize', positionMenu);
  window.addEventListener('scroll', positionMenu, true);
  syncLibrary(false);
})();
