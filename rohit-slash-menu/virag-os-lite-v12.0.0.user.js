// ==UserScript==
// @name         Virag OS Lite
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      12.0.0
// @description  Lean slash-menu for ChatGPT image creatives. Short prompts, instant cached presets, keyboard-first, no auto-update.
// @author       Rohit
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @noframes
// ==/UserScript==
(() => {
'use strict';

/* ---------- data sources (same preset JSONs as before) ---------- */
const R = 'https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/main/rohit-slash-menu/';
const TABS = {
  'Creative': [['Creative', R + 'creative-presets.json']],
  'Flyer': [['Flyer', R + 'flyer-presets.json']],
  '3D': [['Signature CGI', R + '3d-signature.json'], ['FOOH', R + '3d-fooh.json'], ['Transform', R + '3d-transform.json'], ['Materials', R + '3d-materials.json'], ['Environments', R + '3d-environments.json']],
  'Packaging': [['Packaging', R + 'packaging-presets.json']],
  'UGC': [['UGC', R + 'ugc-presets.json']],
  'Video': [['Video', R + 'video-presets.json']],
  'AI Tools': [['AI Tools', R + 'ai-tools.json']]
};
const TTL = 12 * 3600e3; // refresh presets at most twice a day, in the background

/* ---------- tiny helpers ---------- */
const gv = (k, d) => { try { return typeof GM_getValue === 'function' ? GM_getValue(k, d) : (JSON.parse(localStorage.getItem('vl.' + k)) ?? d); } catch { return d; } };
const sv = (k, v) => { try { typeof GM_setValue === 'function' ? GM_setValue(k, v) : localStorage.setItem('vl.' + k, JSON.stringify(v)); } catch {} };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const vis = e => { const r = e?.getBoundingClientRect?.(); return !!(e && e.isConnected && r && r.width > 20 && r.height > 10); };
const getJSON = u => new Promise((ok, no) => {
  const url = u + '?t=' + Date.now();
  if (typeof GM_xmlhttpRequest === 'function')
    GM_xmlhttpRequest({ method: 'GET', url, timeout: 15000, onload: r => { try { if (r.status >= 300) throw 0; ok(JSON.parse(r.responseText)); } catch { no(); } }, onerror: no, ontimeout: no });
  else fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject()).then(ok, no);
});

/* ---------- state ---------- */
const S = { tab: 'Creative', q: '', sel: 0, list: [], data: {}, slash: false,
  set: Object.assign({ pc: 1, cc: 2, arr: 'separate', fmt: 'instagram', ty: 'auto', cp: 'bal', auto: 1 }, gv('set', {})) };

async function load(tab, force) {
  const key = 'c.' + tab, c = gv(key, null);
  if (c?.rows && !S.data[tab]) { S.data[tab] = c.rows; render(); }
  if (!force && c && Date.now() - c.t < TTL) return;
  const parts = await Promise.allSettled(TABS[tab].map(([g, u]) => getJSON(u).then(j => [g, j])));
  const rows = [];
  for (const p of parts) if (p.status === 'fulfilled') {
    const [g, j] = p.value;
    for (const r of j.commands || []) if (r.cmd)
      rows.push({ tab, g, id: +r.id || 0, cmd: (r.cmd[0] === '/' ? '' : '/') + r.cmd, label: String(r.label || r.cmd), desc: String(r.desc || ''), ins: String(r.instruction || r.prompt || r.desc || r.label || '') });
  }
  if (rows.length) { S.data[tab] = rows; sv(key, { t: Date.now(), rows }); }
  render();
}

/* ---------- prompt compiler: ~300 words instead of thousands ---------- */
const FMT = {
  instagram: ['Instagram post, 4:5 (1080x1350)', 'a social-native feed post built on one clear idea'],
  ad: ['Paid ad, 4:5 (1080x1350)', 'a conversion-first ad: hook, product, supplied proof or offer, supplied CTA'],
  infographic: ['Infographic, 4:5 (1080x1350)', 'information-led: facts, icons and labels carry the layout'],
  native: ['Native output', "the selected tool's own deliverable, no social wrapper"]
};
const TYPE = {
  auto: 'real, category-appropriate fonts; vary the style between outputs',
  serif: 'refined high-contrast serif with a neutral sans',
  sans: 'clean modern grotesk sans-serif',
  bold: 'bold condensed display headlines with a simple sans',
  playful: 'rounded, expressive display type with a readable sans'
};
const COPY = { min: 'one short hook and one fact', bal: 'one hook and two or three facts', rich: 'one hook and four to six facts' };
const NOTE = {
  Flyer: 'Structure it as a flyer: dominant headline, grouped details, clear footer/action zone.',
  '3D': 'Use CGI as the campaign mechanism with a specific camera idea; typography stays flat, crisp 2D.',
  Packaging: 'Present the pack as the designed object: shelf, material or launch context, restrained callouts.',
  UGC: 'Phone-native creator content: believable person or hands, natural light, real place, five natural fingers, no studio gloss, no fake app UI, no invented reviews.',
  Video: 'Time-based: hook in the first second, three beats, readable title cards. Not one static poster.'
};
const FAMILIES = ['editorial asymmetric layout', 'conceptual product metaphor', 'product-as-architecture mini world', 'tactile cut-paper or mixed media', 'benefit icon story', 'material and texture study', 'believable human-use micro-story (only if it fits the category)', 'bold type interaction'];

function brief() {
  const e = ed(); if (!e) return '';
  const known = new Set(Object.values(S.data).flat().map(r => r.cmd.toLowerCase()));
  return read(e).replace(/(?:^|\s)\/[\w-]*$/, ' ').replace(/\/[\w-]+/g, m => known.has(m.toLowerCase()) ? '' : m).replace(/\s{2,}/g, ' ').trim();
}

function compile(x) {
  const s = S.set, together = s.arr === 'together', total = together ? s.cc : s.pc * s.cc;
  const f = x.tab === 'Video' ? ['Vertical video, 9:16', 'a paced social video'] : FMT[x.tab === 'UGC' ? 'native' : s.fmt];
  const start = gv('rot', 0); sv('rot', start + total);
  const fam = Array.from({ length: Math.min(total, 8) }, (_, i) => FAMILIES[(start + i) % FAMILIES.length]).join('; ');
  const b = brief();
  return [
    "Generate the image now with ChatGPT's built-in image generation. Do not reply with a prompt, plan or description.",
    'BRIEF: ' + (b || 'Use the current uploads and the selected tool.') + ' Use only this turn\'s text and uploads. Ignore earlier campaigns, and never use earlier generated images as references (include 0 recent images) unless I ask to edit one.',
    `OUTPUTS: ${total} separate full-frame image${total > 1 ? 's' : ''}, never a collage or grid. ` + (together
      ? `Every image shows all ${s.pc} product${s.pc > 1 ? 's' : ''} together; ${s.cc} variation${s.cc > 1 ? 's' : ''}.`
      : `${s.pc} product${s.pc > 1 ? 's' : ''} x ${s.cc} variation${s.cc > 1 ? 's' : ''}; each image shows only its own product, in upload order.`)
      + ' Each variation needs a different concept: change at least six of idea, camera/crop, product position, headline position, font style, info layout, graphic devices.',
    `TECHNIQUE: ${x.label}. ${x.ins}`,
    `FORMAT: ${f[0]}, ${f[1]}. ${NOTE[x.tab] || ''}`.trim(),
    'PRODUCT: Keep the uploaded product exactly as it is: same shape, proportions, colors, label, logo and printed text. Do not redraw or alter it. Build the scene around it with matching light and natural contact shadows. Show the whole product unless I ask for a crop.',
    `TYPE: ${TYPE[s.ty]}. Copy: ${COPY[s.cp]}, using only my exact wording or text visible on the pack. Never invent claims, prices, offers or reviews. Typeset flat 2D and proofread every letter.`,
    `CONCEPT FAMILIES (one per output, in order): ${fam}.`,
    'QUALITY: Art-directed by an experienced human design team: clear hierarchy, asymmetric composition, real depth, believable light, bright commercial look unless I ask for dark. Avoid generic glossy 3D, neon glow, floating particles, centered pedestal shots, gym or flower clichés and pseudo-fonts. If it looks AI-made or like a product with text pasted on, rebuild it.',
    'My explicit request overrides these defaults.'
  ].join('\n\n');
}

/* ---------- ChatGPT composer ---------- */
function ed() {
  for (const q of ['#prompt-textarea', '[data-testid="composer-input"]', 'div.ProseMirror[contenteditable="true"]', '[contenteditable="true"][role="textbox"]', 'form textarea'])
    for (const e of document.querySelectorAll(q)) if (vis(e)) return e;
  return null;
}
const read = e => e?.tagName === 'TEXTAREA' ? e.value : (e?.innerText || '');
function write(e, t) {
  e.focus({ preventScroll: true });
  if (e.tagName === 'TEXTAREA') {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(e, t);
    e.dispatchEvent(new Event('input', { bubbles: true })); return true;
  }
  const sel = getSelection(), r = document.createRange();
  r.selectNodeContents(e); sel.removeAllRanges(); sel.addRange(r);
  let ok = false; try { ok = document.execCommand(t ? 'insertText' : 'delete', false, t || ''); } catch {}
  sel.removeAllRanges();
  if (!ok) { e.textContent = t; e.dispatchEvent(new Event('input', { bubbles: true })); }
  return true;
}
const sendBtn = e => [...(e.closest('form') || document).querySelectorAll('button[data-testid="send-button"],button[data-testid="composer-send-button"],button[aria-label="Send prompt"],button[aria-label="Send message"]')].find(b => vis(b) && !b.disabled);

async function run(x) {
  const e = ed(); if (!e) return toast('Composer not found. Click the chat box first.');
  if (x.tab === 'AI Tools') {
    const t = read(e), rx = /(^|\s)\/[\w-]*$/;
    write(e, rx.test(t) ? t.replace(rx, '$1' + x.cmd + ' ') : (t.trim() ? t.trimEnd() + ' ' : '') + x.cmd + ' ');
    return close();
  }
  const p = compile(x); close(); write(e, p);
  if (!S.set.auto) return;
  for (let i = 0; i < 40; i++) { await wait(80); const b = sendBtn(e); if (b) return b.click(); }
  toast('Prompt inserted. Press Send.');
}

/* ---------- UI (built once, on first open) ---------- */
let host, root, P, LS, Q, T;
const CSS = `:host{all:initial}*{box-sizing:border-box}
.w{--bg:#fff;--fg:#14171f;--mu:#667085;--bd:#e3e7ee;--sf:#f6f8fb;--ac:#4f46e5;font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--fg)}
@media(prefers-color-scheme:dark){.w{--bg:#15171d;--fg:#e9ecf3;--mu:#8b93a5;--bd:#2a2e39;--sf:#1c1f27;--ac:#9aa5ff}}
button,select,input{font:inherit;color:inherit}
.p{position:fixed;z-index:2147483647;right:16px;top:64px;bottom:76px;width:min(900px,calc(100vw - 32px));display:none;flex-direction:column;background:var(--bg);border:1px solid var(--bd);border-radius:14px;box-shadow:0 18px 50px #0003;overflow:hidden}
.p.on{display:flex}
.hd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--bd)}
.hd b{font-size:14px}.hd small{margin-right:auto;color:var(--mu)}
.ib{width:30px;height:30px;border:1px solid var(--bd);background:var(--sf);border-radius:8px;cursor:pointer}
.ib:hover{border-color:var(--ac)}
.tabs{display:flex;gap:6px;padding:8px 12px;overflow:auto;flex:none}
.t{border:1px solid var(--bd);background:var(--sf);color:var(--mu);border-radius:8px;padding:5px 12px;font-weight:600;cursor:pointer;white-space:nowrap}
.t.on{background:var(--ac);border-color:var(--ac);color:#fff}
@media(prefers-color-scheme:dark){.t.on{color:#10131a}}
.pl{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:8px;padding:0 12px 8px}
.pl label{display:grid;gap:3px;color:var(--mu);font-size:11px;font-weight:600}
.pl select{height:30px;padding:0 6px;border:1px solid var(--bd);border-radius:8px;background:var(--sf)}
.q{margin:0 12px 8px;height:36px;border:1px solid var(--bd);border-radius:10px;background:var(--sf);padding:0 12px;outline:none}
.q:focus{border-color:var(--ac)}
.ls{flex:1;overflow:auto;padding:0 12px 12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;align-content:start}
.c{border:1px solid var(--bd);background:var(--sf);border-radius:10px;padding:9px 10px;cursor:pointer;content-visibility:auto;contain-intrinsic-size:auto 84px}
.c:hover,.c.sel{border-color:var(--ac)}
.c code{font:11px ui-monospace,monospace;color:var(--ac)}
.c h4{margin:3px 0 2px;font-size:13px}
.c p{margin:0;color:var(--mu);font-size:11px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.e{grid-column:1/-1;padding:28px;text-align:center;color:var(--mu)}
.ft{padding:6px 12px;border-top:1px solid var(--bd);color:var(--mu);font-size:11px}
.l{position:fixed;z-index:2147483647;right:16px;bottom:80px;height:40px;padding:0 16px;border:0;border-radius:12px;background:var(--ac);color:#fff;font-weight:700;cursor:pointer;box-shadow:0 6px 20px #0003}
@media(prefers-color-scheme:dark){.l{color:#10131a}}
.p.on~.l{display:none}
.ts{position:fixed;z-index:2147483647;right:16px;bottom:130px;max-width:360px;padding:8px 12px;border-radius:8px;background:#111827;color:#fff;font-size:12px;display:none}
.ts.on{display:block}
@media(prefers-reduced-motion:no-preference){.c,.t,.ib{transition:border-color .12s}}`;

function build() {
  if (host) return;
  host = document.createElement('div');
  root = host.attachShadow({ mode: 'open' });
  const s = S.set, num = n => Array.from({ length: n }, (_, i) => [i + 1, i + 1]);
  const sel = (k, label, opts) => `<label>${label}<select data-k="${k}">${opts.map(([v, t]) => `<option value="${v}"${String(s[k]) === String(v) ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
  root.innerHTML = `<style>${CSS}</style><div class="w">
<div class="p">
 <div class="hd"><b>Virag OS Lite</b><small>v12.0.0 · Alt+V</small><button class="ib" data-a="sync" title="Reload presets">↻</button><button class="ib" data-a="close" title="Close">✕</button></div>
 <div class="tabs">${Object.keys(TABS).map(t => `<button class="t" data-t="${t}">${t}</button>`).join('')}</div>
 <div class="pl">${sel('pc', 'Products', num(20))}${sel('cc', 'Variations', num(10))}${sel('arr', 'Layout', [['separate', 'Separate'], ['together', 'Together']])}${sel('fmt', 'Format', [['instagram', 'Instagram post'], ['ad', 'Paid ad'], ['infographic', 'Infographic'], ['native', 'Native']])}${sel('ty', 'Type', [['auto', 'Auto'], ['serif', 'Serif'], ['sans', 'Modern sans'], ['bold', 'Bold condensed'], ['playful', 'Playful']])}${sel('cp', 'Copy', [['min', 'Minimal'], ['bal', 'Balanced'], ['rich', 'Rich']])}${sel('auto', 'Send', [[1, 'Auto'], [0, 'Manual']])}</div>
 <input class="q" placeholder="Search presets…" autocomplete="off" spellcheck="false">
 <div class="ls"></div>
 <div class="ft">↑ ↓ choose · Enter run · Esc close · type / in the chat box to search</div>
</div>
<button class="l">✦ Virag</button><div class="ts"></div></div>`;
  P = root.querySelector('.p'); LS = root.querySelector('.ls'); Q = root.querySelector('.q'); T = root.querySelector('.ts');
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'), c = e.target.closest('[data-i]'), a = e.target.closest('[data-a]')?.dataset.a;
    if (t) { S.tab = t.dataset.t; S.sel = 0; S.slash = false; load(S.tab); render(); }
    else if (c) { const x = S.list[+c.dataset.i]; if (x) run(x); }
    else if (a === 'close') close();
    else if (a === 'sync') { load(S.tab, true); toast('Reloading ' + S.tab); }
    else if (e.target.closest('.l')) open();
  });
  root.addEventListener('change', e => {
    const k = e.target.dataset?.k; if (!k) return;
    S.set[k] = ['pc', 'cc', 'auto'].includes(k) ? +e.target.value : e.target.value; sv('set', S.set);
  });
  Q.addEventListener('input', () => { S.q = Q.value; S.sel = 0; render(); });
  document.documentElement.appendChild(host);
}

function render() {
  if (!P) return;
  root.querySelectorAll('.t').forEach(b => b.classList.toggle('on', b.dataset.t === S.tab));
  const q = S.q.toLowerCase().replace(/^\//, '');
  const pool = (S.slash && q) ? Object.values(S.data).flat() : (S.data[S.tab] || []);
  const all = pool.slice().sort((a, b) => a.id - b.id);
  S.list = (q ? all.filter(r => (r.cmd + ' ' + r.label + ' ' + r.desc + ' ' + r.g).toLowerCase().includes(q)) : all).slice(0, 150);
  S.sel = Math.min(S.sel, Math.max(0, S.list.length - 1));
  LS.innerHTML = S.list.length
    ? S.list.map((r, i) => `<div class="c${i === S.sel ? ' sel' : ''}" data-i="${i}"><code>${esc(r.cmd)}</code><h4>${esc(r.label)}</h4><p>${esc(r.desc)}</p></div>`).join('')
    : `<div class="e">${S.data[S.tab] || (S.slash && q) ? 'No presets match.' : 'Loading presets…'}</div>`;
}
function mark() {
  LS.querySelectorAll('.c').forEach((c, i) => c.classList.toggle('sel', i === S.sel));
  LS.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
}
function open(slash) {
  build(); S.slash = !!slash; P.classList.add('on'); load(S.tab); render();
  if (!slash) setTimeout(() => Q.focus(), 0);
}
function close() { if (!P) return; P.classList.remove('on'); S.slash = false; S.q = ''; Q.value = ''; }
let tt; function toast(m) { build(); T.textContent = m; T.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => T.classList.remove('on'), 2600); }

/* ---------- inputs: slash trigger + keyboard ---------- */
document.addEventListener('input', e => {
  const c = ed(); if (!c || !(c === e.target || c.contains(e.target))) return;
  const m = /(?:^|\s)\/([\w-]*)$/.exec(read(c));
  if (m) {
    if (!S.slash) { build(); Object.keys(TABS).forEach(t => load(t)); }
    S.q = m[1]; S.sel = 0; open(true); render();
  } else if (S.slash) close();
}, true);

document.addEventListener('keydown', e => {
  if (e.altKey && e.code === 'KeyV') { e.preventDefault(); P?.classList.contains('on') ? close() : open(); return; }
  if (!P || !P.classList.contains('on')) return;
  if (e.key === 'Escape') { close(); return; }
  const mine = S.slash || e.composedPath()[0] === Q;
  if (!mine) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault(); e.stopPropagation();
    S.sel = Math.max(0, Math.min(S.list.length - 1, S.sel + (e.key === 'ArrowDown' ? 1 : -1))); mark();
  } else if (e.key === 'Enter' || (e.key === 'Tab' && S.slash)) {
    const x = S.list[S.sel]; if (!x) return;
    e.preventDefault(); e.stopPropagation(); run(x);
  }
}, true);

// launcher button appears once the page is ready; nothing else runs until the user opens it
build();
})();
