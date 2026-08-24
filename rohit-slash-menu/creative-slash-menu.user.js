// ==UserScript==
// @name         Creative Slash Menu
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      5.1.0
// @description  Creative + Video slash menu for ChatGPT with live GitHub command sync.
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

  const VERSION = '5.1.0';
  const COMMANDS_URL = 'https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/commands.json';
  const CACHE_KEY = 'creativeSlashMenu.library.v51';
  const CACHE_TIME_KEY = 'creativeSlashMenu.libraryTime.v51';

  const BASE_RULES =
    'Use the uploaded product/image/reference whenever one is present. Preserve the original product shape, packaging, label, logo, colors, proportions and brand identity accurately. Keep every new concept visually fresh and avoid repeating recent composition, pedestal, splash, background, lighting, camera angle, typography system, material treatment or overall layout. Keep unnecessary text minimal. Unless another format is explicitly requested, use a standalone 4:5 Instagram creative. Never make a collage unless explicitly requested.';

  const FALLBACK = {
    libraryVersion: '5.1.0-fallback',
    categories: ['Core','Product','Campaign','Style','Environment','Social','Info','Print','Brand','Utility','Video','UGC Video','Camera'],
    commands: [
      {category:'Core',cmd:'/creative',label:'Fresh Creative',desc:'Fresh premium standalone creative'},
      {category:'Core',cmd:'/trend',label:'Trend-Led',desc:'Current high-end visual direction'},
      {category:'Core',cmd:'/surprise',label:'Surprise Me',desc:'Unexpected premium art direction'},
      {category:'Core',cmd:'/redesign',label:'Redesign',desc:'Complete visual redesign'},
      {category:'Product',cmd:'/productad',label:'Product Ad',desc:'Professional product advertisement'},
      {category:'Product',cmd:'/producthero',label:'Product Hero',desc:'Premium hero-product composition'},
      {category:'Product',cmd:'/cgi',label:'CGI Creative',desc:'High-end 3D CGI product world'},
      {category:'Product',cmd:'/studio',label:'Studio Shot',desc:'Premium studio product photography'},
      {category:'Campaign',cmd:'/launch',label:'Launch',desc:'Premium launch campaign'},
      {category:'Campaign',cmd:'/offer',label:'Offer / Sale',desc:'Premium promotional creative'},
      {category:'Style',cmd:'/premium',label:'Premium',desc:'High-end commercial advertising'},
      {category:'Style',cmd:'/luxury',label:'Luxury',desc:'Luxury editorial art direction'},
      {category:'Style',cmd:'/cinematic',label:'Cinematic',desc:'Film-like lighting and framing'},
      {category:'Social',cmd:'/story',label:'Story',desc:'9:16 Instagram Story'},
      {category:'Social',cmd:'/carousel',label:'Carousel',desc:'Separate carousel slides'},
      {category:'Info',cmd:'/infographic',label:'Infographic',desc:'Premium visual information design'},
      {category:'Brand',cmd:'/packaging',label:'Packaging',desc:'Packaging design concept'},

      {category:'Video',cmd:'/video',label:'Fresh Video Concept',desc:'Complete fresh AI video concept with shot flow'},
      {category:'Video',cmd:'/productvideo',label:'Product Video',desc:'Premium cinematic product advertising video'},
      {category:'Video',cmd:'/cgivideo',label:'CGI Product Video',desc:'High-end 3D CGI product animation'},
      {category:'Video',cmd:'/cinematicvideo',label:'Cinematic Video',desc:'Feature-film style commercial video'},
      {category:'Video',cmd:'/reelvideo',label:'Reel Video',desc:'Fast premium Instagram Reel concept'},
      {category:'Video',cmd:'/productreveal',label:'Product Reveal',desc:'Premium product reveal sequence'},
      {category:'Video',cmd:'/unboxing',label:'Unboxing Video',desc:'Natural product unboxing video'},
      {category:'Video',cmd:'/testimonial',label:'Testimonial Video',desc:'Natural creator testimonial'},
      {category:'Video',cmd:'/broll',label:'B-Roll Sequence',desc:'Premium supporting B-roll shots'},
      {category:'Video',cmd:'/motion',label:'Product Motion',desc:'Natural product motion animation'},
      {category:'Video',cmd:'/seedance',label:'Seedance Video Prompt',desc:'Seedance-ready complete prompt'},
      {category:'Video',cmd:'/kling',label:'Kling Video Prompt',desc:'Kling-ready video prompt'},
      {category:'Video',cmd:'/runway',label:'Runway Video Prompt',desc:'Runway-ready video prompt'},

      {category:'UGC Video',cmd:'/ugcvideo',label:'UGC Video',desc:'Natural creator-style UGC video'},
      {category:'UGC Video',cmd:'/ugc-indian',label:'Indian UGC',desc:'Indian creator with natural Indian English / Hinglish'},
      {category:'UGC Video',cmd:'/ugc-american',label:'American UGC',desc:'US creator with natural American English'},
      {category:'UGC Video',cmd:'/ugc-british',label:'British UGC',desc:'UK creator with natural British English'},
      {category:'UGC Video',cmd:'/ugc-australian',label:'Australian UGC',desc:'Australian creator style'},
      {category:'UGC Video',cmd:'/ugc-middleeast',label:'Middle East UGC',desc:'Middle East / Gulf creator style'},
      {category:'UGC Video',cmd:'/ugc-european',label:'European UGC',desc:'Modern European creator style'},
      {category:'UGC Video',cmd:'/ugc-latam',label:'Latin American UGC',desc:'Latin American creator style'},
      {category:'UGC Video',cmd:'/ugc-global',label:'Global / Neutral UGC',desc:'Region-neutral international UGC'},

      {category:'Camera',cmd:'/camera',label:'Camera Motion',desc:'Natural cinematic camera movement options'},
      {category:'Camera',cmd:'/transition',label:'Transitions',desc:'Natural premium transition ideas'},
      {category:'Camera',cmd:'/slowmotion',label:'Slow Motion',desc:'Premium slow-motion shot'}
    ]
  };

  const SPECIAL = {
    '/creative': `Create a completely fresh high-end professional creative. Choose the strongest art direction for the uploaded product/image and make it visibly different from recent designs. ${BASE_RULES}`,
    '/trend': `Create a current trend-led premium creative. Research relevant contemporary high-end advertising, CGI, editorial and social design references online when useful, then synthesize an original direction rather than copying one reference. ${BASE_RULES}`,
    '/redesign': `Completely redesign the uploaded creative. Rebuild the composition, hierarchy, background, typography treatment, lighting, visual story and overall design system instead of simply recoloring or rearranging it. ${BASE_RULES}`,
    '/cgi': `Create a high-end 3D CGI advertising creative using the uploaded product image as the exact hero-product reference. Build an original cinematic 3D environment with believable materials, premium lighting, realistic reflections and shadows, atmospheric depth and strong art direction. Avoid generic repeated pedestal, smoke, splash, rock and camera-angle formulas. Make it look like a premium global campaign. ${BASE_RULES}`,

    '/video': 'Create a complete premium AI video concept using the uploaded product, image, or brief. Default to a 15-second 9:16 social video unless another duration or ratio is specified. Build a coherent shot-by-shot sequence with a strong opening hook, natural camera movement, realistic motion, consistent product identity, smooth transitions, premium lighting, and a clear final hero shot. Avoid random morphing, repeated shots, fake-looking movement, and generic templates.',
    '/productvideo': 'Create a premium cinematic product advertising video using the uploaded product as the exact visual reference. Preserve packaging, logo, shape, label, proportions, colors, and details in every shot. Default to 15 seconds, 9:16, with 6-10 distinct shots, realistic product physics, natural camera moves, macro details, hero angles, and a strong final packshot.',
    '/cgivideo': 'Create a high-end 3D CGI product advertising video using the uploaded product as the exact hero reference. Use premium physically believable materials, cinematic lighting, realistic reflections and shadows, atmospheric depth, elegant camera choreography, and smooth product motion. Preserve the product exactly in every frame. Default: 15 seconds, 9:16, 6-8 cinematic shots.',
    '/cinematicvideo': 'Create a cinematic commercial video from the uploaded product, image, or brief. Use film-like framing, natural depth of field, believable camera motion, realistic lighting, atmospheric detail, premium color grading, and clear visual storytelling. Default: 15 seconds, 9:16.',
    '/reelvideo': 'Create a high-retention 9:16 Instagram Reel concept. Default to 15 seconds with a strong first-second hook, 7-10 coherent shots, natural handheld or gimbal-style camera movement, clean transitions, visually varied compositions, and a satisfying final hero/product shot.',
    '/productreveal': 'Create a premium product reveal video using the uploaded product as the exact reference. Build anticipation, reveal progressively through light, motion, environment or material interaction, and finish on a clean hero frame. Preserve product shape and label throughout. Default: 8-12 seconds, 9:16.',
    '/unboxing': 'Create a natural premium unboxing video. Show believable hands, packaging interaction, opening, product reveal, close-up details, first reaction, and a clean final product shot. Default: 15-20 seconds, 9:16, realistic smartphone camera behavior and natural lighting.',
    '/testimonial': 'Create a believable vertical creator testimonial video. Use a strong natural hook, authentic speech, pauses, facial expressions, hand movement, product interaction, one clear personal benefit or story, product proof/demo, and a natural recommendation. Default: 15-30 seconds, 9:16.',
    '/broll': 'Create a premium B-roll sequence with 8-12 visually distinct shots covering wide, medium, close-up, macro, detail, movement, environment, interaction and hero angles. Camera movement must feel physically shot by a real camera or gimbal.',
    '/motion': 'Create a simple premium product-motion video that feels practically captured. Keep the product stable and accurate while using subtle push-ins, slides, arcs, parallax, focus changes, or gentle gimbal movement. Avoid unrealistic morphing or deformation.',
    '/seedance': 'Write a production-ready Seedance video prompt using the uploaded references. Include duration, aspect ratio, visual style, subject/product lock, scene progression, camera movement, lighting, motion behavior, transitions, and negative constraints.',
    '/kling': 'Write a production-ready Kling video prompt using the uploaded reference. Prioritize identity/product consistency, realistic physics, controlled camera movement, coherent action, cinematic lighting, and constraints against morphing, warping, label changes, extra objects, or unstable frames.',
    '/runway': 'Write a production-ready Runway video prompt based on the uploaded reference and brief. Specify subject lock, action, camera move, environment, lighting, motion speed, cinematic behavior, continuity, and what must remain unchanged.',

    '/ugcvideo': 'Create a natural creator-style UGC video for the uploaded product/brand. Default: 15-30 seconds, vertical 9:16, realistic smartphone camera behavior, natural lighting, authentic speech, believable hand gestures and product interaction, minimal commercial polish, and relatable unscripted delivery.',
    '/ugc-indian': 'Create a natural Indian-market UGC video for the uploaded product/brand. Use an Indian creator and a believable contemporary Indian home, gym, office, street, studio, or lifestyle setting appropriate to the product. Dialogue should sound like natural Indian English or Hinglish, not formal translation. Keep expressions, gestures, pacing, smartphone-camera movement, and product interaction authentic. Default: 15-30 seconds, 9:16.',
    '/ugc-american': 'Create a natural US-market UGC video. Use an American creator, believable US lifestyle setting, natural American English, conversational pacing, smartphone-camera behavior, casual gestures and realistic product interaction. Avoid exaggerated influencer acting. Default: 15-30 seconds, 9:16.',
    '/ugc-british': 'Create a natural UK-market UGC video. Use a British creator, believable UK lifestyle environment, natural British English, understated authentic delivery, realistic phone-camera movement and genuine product interaction. Default: 15-30 seconds, 9:16.',
    '/ugc-australian': 'Create a natural Australian-market UGC video. Use an Australian creator, authentic Australian English, believable local lifestyle context, casual delivery, smartphone-camera behavior and realistic product interaction. Default: 15-30 seconds, 9:16.',
    '/ugc-middleeast': 'Create a premium but natural Middle East/Gulf UGC video. Use a believable contemporary regional lifestyle setting and creator styling appropriate to the brief. Use natural English by default; use Arabic only if requested. Default: 15-30 seconds, 9:16.',
    '/ugc-european': 'Create a natural modern European-market UGC video. Use a believable contemporary European lifestyle setting and creator presentation. Use neutral English unless a specific country or language is requested. Default: 15-30 seconds, 9:16.',
    '/ugc-latam': 'Create a natural Latin American-market UGC video. Use a believable regional lifestyle setting and authentic creator presentation. Use English by default unless Spanish or Portuguese is requested. Default: 15-30 seconds, 9:16.',
    '/ugc-global': 'Create a globally neutral UGC video suitable for international use. Use a modern universal lifestyle setting, neutral English, natural smartphone-camera behavior, relatable creator delivery and realistic product interaction. Default: 15-30 seconds, 9:16.',

    '/camera': 'Create 8 practical cinematic camera-motion options for the uploaded product or scene: subtle push-in, pull-out, left-to-right slide, right-to-left slide, slow arc, low-angle rise, top-down drift, and gentle handheld/gimbal movement. Keep product identity stable.',
    '/transition': 'Create 8 premium motivated transitions: match cuts, foreground wipes, whip pans, light passes, rack-focus transitions, speed ramps, object wipes, and seamless environmental transitions. Avoid random AI morphing.',
    '/slowmotion': 'Create a premium slow-motion video prompt with realistic high-frame-rate behavior, physically believable particles/liquid/fabric/hair where relevant, controlled lighting, subtle camera movement, and stable subject/product identity.'
  };

  function genericPrompt(item) {
    const action = item.desc || item.label || item.cmd;
    if (item.category === 'Video' || item.category === 'UGC Video' || item.category === 'Camera') {
      return `${action}. Create a production-ready AI video prompt with realistic movement, stable identity/product continuity, clear camera behavior, and a coherent visual sequence.`;
    }
    return `Create a premium ${item.label || 'creative'} output. ${action}. ${BASE_RULES}`;
  }

  function normalizeLibrary(remote) {
    const incoming = remote && Array.isArray(remote.commands) ? remote.commands : [];
    const localByCmd = Object.fromEntries(FALLBACK.commands.map(x => [x.cmd, x]));
    const remoteByCmd = Object.fromEntries(incoming.filter(x => x?.cmd).map(x => [x.cmd, x]));
    const order = [];
    incoming.forEach(x => { if (x?.cmd && !order.includes(x.cmd)) order.push(x.cmd); });
    FALLBACK.commands.forEach(x => { if (!order.includes(x.cmd)) order.push(x.cmd); });

    const commands = order.map(cmd => {
      const item = {...(localByCmd[cmd] || {}), ...(remoteByCmd[cmd] || {})};
      item.prompt = item.prompt || SPECIAL[cmd] || genericPrompt(item);
      return item;
    }).filter(x => x.cmd && x.label);

    const categories = Array.from(new Set([
      ...(remote?.categories || []),
      ...FALLBACK.categories,
      ...commands.map(x => x.category).filter(Boolean)
    ]));

    return {
      ...FALLBACK,
      ...(remote || {}),
      categories,
      commands
    };
  }

  function getCached() {
    try {
      const raw = GM_getValue(CACHE_KEY, '');
      if (raw) return normalizeLibrary(JSON.parse(raw));
    } catch (_) {}
    return normalizeLibrary(FALLBACK);
  }

  function saveCached(lib) {
    try {
      GM_setValue(CACHE_KEY, JSON.stringify(lib));
      GM_setValue(CACHE_TIME_KEY, Date.now());
    } catch (_) {}
  }

  function gmRequest(url) {
    return new Promise((resolve, reject) => {
      try {
        GM_xmlhttpRequest({
          method: 'GET',
          url: `${url}?nocache=${Date.now()}`,
          timeout: 15000,
          headers: {'Cache-Control':'no-cache'},
          onload: r => {
            try {
              if (r.status < 200 || r.status >= 300) throw new Error(`HTTP ${r.status}`);
              resolve(JSON.parse(r.responseText));
            } catch (e) { reject(e); }
          },
          onerror: reject,
          ontimeout: () => reject(new Error('timeout'))
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async function browserFetch(url) {
    const r = await fetch(`${url}?nocache=${Date.now()}`, {cache:'no-store'});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  }

  let LIB = getCached();
  let syncStatus = 'Cached';
  let syncDetail = '';

  async function syncLibrary() {
    syncStatus = 'Syncing…';
    try {
      let remote;
      try {
        remote = await gmRequest(COMMANDS_URL);
        syncDetail = 'GM';
      } catch (_) {
        remote = await browserFetch(COMMANDS_URL);
        syncDetail = 'Fetch';
      }
      LIB = normalizeLibrary(remote);
      saveCached(LIB);
      syncStatus = 'Synced';
      return true;
    } catch (e) {
      LIB = getCached();
      syncStatus = 'Offline';
      syncDetail = e?.message || 'sync failed';
      return false;
    }
  }

  let host, shadow, menu;
  let activeEditor = null;
  let items = [];
  let selectedIndex = 0;
  let currentQuery = '';
  let activeCategory = 'All';

  const CSS = `
    :host{all:initial}
    .menu{box-sizing:border-box;position:fixed;z-index:2147483647;display:none;overflow:hidden;
    border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(22,22,25,.985);color:#fff;
    box-shadow:0 22px 70px rgba(0,0,0,.55);backdrop-filter:blur(20px);
    font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .menu.show{display:block}.header{display:flex;justify-content:space-between;align-items:center;padding:14px 15px 11px;border-bottom:1px solid rgba(255,255,255,.07)}
    .title{font-size:14px;font-weight:750}.subtitle{margin-top:3px;font-size:11px;color:rgba(255,255,255,.5)}
    .status{font-size:10px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.75)}
    .categories{display:flex;gap:6px;overflow-x:auto;padding:8px 9px;border-bottom:1px solid rgba(255,255,255,.055);scrollbar-width:none}
    .categories::-webkit-scrollbar{display:none}.cat{border:0;border-radius:999px;padding:6px 9px;background:rgba(255,255,255,.055);color:rgba(255,255,255,.65);
    font:500 10.5px ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;white-space:nowrap}
    .cat.active,.cat:hover{background:rgba(167,139,250,.18);color:#d8ccff}.list{max-height:min(430px,50vh);overflow-y:auto;padding:7px}
    .item{box-sizing:border-box;display:grid;grid-template-columns:128px 1fr;gap:10px;align-items:center;padding:10px 11px;border-radius:11px;cursor:pointer}
    .item:hover,.item.selected{background:rgba(255,255,255,.085)}.command{font:750 12px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#b9a5ff}
    .topline{display:flex;align-items:center;gap:7px}.label{font-size:12.8px;font-weight:680}.chip{font-size:9px;padding:2px 5px;border-radius:5px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.45)}
    .desc{margin-top:2px;font-size:11.3px;line-height:1.3;color:rgba(255,255,255,.55)}.empty{padding:22px;text-align:center;font-size:12px;color:rgba(255,255,255,.5)}
    .footer{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 11px;border-top:1px solid rgba(255,255,255,.06);font-size:10px;color:rgba(255,255,255,.43)}
    .sync{border:0;border-radius:7px;padding:6px 9px;background:rgba(167,139,250,.15);color:#d8ccff;cursor:pointer;font-size:10px}.sync:hover{background:rgba(167,139,250,.24)}
  `;

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
    end.selectNodeContents(editor);
    end.collapse(false);
    sel.removeAllRanges();
    sel.addRange(end);
    editor.focus();
  }

  function createMenu() {
    if (menu) return;

    host = document.createElement('div');
    host.id = 'creative-slash-menu-v51-host';
    host.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647';
    document.documentElement.appendChild(host);

    shadow = host.attachShadow({mode:'open'});
    const style = document.createElement('style');
    style.textContent = CSS;
    shadow.appendChild(style);

    menu = document.createElement('div');
    menu.className = 'menu';
    menu.innerHTML = `
      <div class="header">
        <div>
          <div class="title">Creative + Video Commands</div>
          <div class="subtitle">English • Live GitHub Sync • Real Prompt Actions</div>
        </div>
        <div class="status">Loading…</div>
      </div>
      <div class="categories"></div>
      <div class="list"></div>
      <div class="footer">
        <span class="version">Script ${VERSION}</span>
        <button class="sync" type="button">Force Sync</button>
      </div>`;

    shadow.appendChild(menu);

    menu.querySelector('.sync').addEventListener('mousedown', async e => {
      e.preventDefault();
      e.stopPropagation();
      menu.querySelector('.status').textContent = 'Syncing…';
      await syncLibrary();
      selectedIndex = 0;
      render(currentQuery);
    });
  }

  function positionMenu() {
    if (!menu || !activeEditor) return;
    const r = activeEditor.getBoundingClientRect();
    const width = Math.min(650, Math.max(400, r.width || 400));
    menu.style.width = `${width}px`;

    let left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
    let top = r.top - Math.min(570, window.innerHeight * .66) - 10;
    if (top < 12) top = Math.min(r.bottom + 8, window.innerHeight - 500);

    menu.style.left = `${left}px`;
    menu.style.top = `${Math.max(12, top)}px`;
  }

  function renderCategories() {
    const wrap = menu.querySelector('.categories');
    wrap.innerHTML = '';
    ['All', ...(LIB.categories || [])].forEach(cat => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = cat;
      b.className = `cat${cat === activeCategory ? ' active' : ''}`;
      b.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        activeCategory = cat;
        selectedIndex = 0;
        render(currentQuery);
      });
      wrap.appendChild(b);
    });
  }

  function score(item, q) {
    if (!q) return 1;
    const hay = [item.cmd,item.label,item.desc,...(item.tags || [])].join(' ').toLowerCase();
    let s = hay.includes(q) ? 10 : 0;
    if ((item.cmd || '').toLowerCase().startsWith('/' + q)) s += 25;
    if ((item.label || '').toLowerCase().startsWith(q)) s += 8;
    return s;
  }

  function render(query='') {
    createMenu();
    currentQuery = String(query || '').toLowerCase().trim();
    renderCategories();

    let filtered = (LIB.commands || []).filter(x => activeCategory === 'All' || x.category === activeCategory);

    if (currentQuery) {
      filtered = filtered
        .map(x => [x, score(x,currentQuery)])
        .filter(x => x[1] > 0)
        .sort((a,b) => b[1] - a[1])
        .map(x => x[0]);
    }

    filtered = filtered.slice(0, 22);
    items = filtered;
    selectedIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));

    const list = menu.querySelector('.list');
    list.innerHTML = '';

    filtered.forEach((x,i) => {
      const row = document.createElement('div');
      row.className = `item${i === selectedIndex ? ' selected' : ''}`;
      row.innerHTML = '<div class="command"></div><div><div class="topline"><span class="label"></span><span class="chip"></span></div><div class="desc"></div></div>';
      row.querySelector('.command').textContent = x.cmd || '';
      row.querySelector('.label').textContent = x.label || '';
      row.querySelector('.chip').textContent = x.category || '';
      row.querySelector('.desc').textContent = x.desc || '';
      row.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        selectCommand(x);
      });
      list.appendChild(row);
    });

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No matching command';
      list.appendChild(empty);
    }

    menu.querySelector('.status').textContent = syncStatus;
    menu.querySelector('.status').title = syncDetail;
    menu.querySelector('.version').textContent =
      `Script ${VERSION} • Library ${LIB.libraryVersion || 'local'}`;

    menu.classList.add('show');
    positionMenu();
  }

  function hideMenu() {
    if (menu) menu.classList.remove('show');
    items = [];
    selectedIndex = 0;
    currentQuery = '';
    activeCategory = 'All';
  }

  function slashQuery(text) {
    const m = String(text || '').match(/(?:^|\n)\/([a-zA-Z0-9_-]*)$/);
    return m ? m[1] : null;
  }

  function selectCommand(item) {
    if (!activeEditor || !item) return;
    const text = getText(activeEditor);
    const replacement = item.prompt || SPECIAL[item.cmd] || genericPrompt(item);
    const replaced = text.replace(/(?:^|\n)\/[a-zA-Z0-9_-]*$/, m =>
      (m.startsWith('\n') ? '\n' : '') + replacement
    );
    setText(activeEditor, replaced);
    hideMenu();
  }

  document.addEventListener('input', e => {
    if (!isEditor(e.target)) return;
    activeEditor = getEditor(e.target);
    const q = slashQuery(getText(activeEditor));
    if (q !== null) render(q);
    else hideMenu();
  }, true);

  document.addEventListener('keydown', e => {
    if (!menu?.classList.contains('show') || !isEditor(e.target)) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault(); e.stopPropagation();
      selectedIndex = (selectedIndex + 1) % Math.max(1, items.length);
      render(currentQuery);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); e.stopPropagation();
      selectedIndex = (selectedIndex - 1 + Math.max(1, items.length)) % Math.max(1, items.length);
      render(currentQuery);
    } else if (e.key === 'Enter' && !e.shiftKey && items.length) {
      e.preventDefault(); e.stopPropagation();
      selectCommand(items[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      hideMenu();
    }
  }, true);

  document.addEventListener('pointerdown', e => {
    if (!menu?.classList.contains('show')) return;
    const path = e.composedPath?.() || [];
    if (path.includes(host) || path.includes(menu)) return;
    if (!isEditor(e.target)) hideMenu();
  }, true);

  window.addEventListener('resize', positionMenu);
  window.addEventListener('scroll', positionMenu, true);

  syncLibrary().then(() => {
    if (menu?.classList.contains('show')) render(currentQuery);
  });
})();
