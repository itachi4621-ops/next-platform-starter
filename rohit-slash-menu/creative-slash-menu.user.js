// ==UserScript==
// @name         Virag Creative OS
// @namespace    https://github.com/itachi4621-ops/next-platform-starter
// @version      7.7.0
// @description  Virag Creative OS: 3D Studio, exact ratio lock, product geometry lock, anti-repeat, 2K/4K and multi-product quantity controls.
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

(()=>{
  const VERSION='7.7.0';
  const CORE='https://raw.githubusercontent.com/itachi4621-ops/next-platform-starter/d1dd4774900ef6facf2cd0cf5042b2a8b1587500/rohit-slash-menu/creative-slash-menu.user.js';
  const KP='virag.products', KC='virag.perProduct';
  let guard=false;

  const getStr=(k,d)=>{try{return String(GM_getValue(k,d)||d)}catch{return d}};
  const setStr=(k,v)=>{try{GM_setValue(k,String(v))}catch{}};
  const reqText=u=>new Promise((ok,no)=>GM_xmlhttpRequest({method:'GET',url:u+'?loader='+Date.now(),timeout:15000,onload:r=>r.status>=200&&r.status<300?ok(r.responseText):no(new Error('HTTP '+r.status)),onerror:no,ontimeout:no}));

  function editorOf(e){return e?.tagName==='TEXTAREA'?e:(e?.isContentEditable?e:e?.closest?.('[contenteditable="true"]'))}
  function readEditor(e){return e?.tagName==='TEXTAREA'?e.value:(e?.innerText||'')}
  function writeEditor(e,t){
    if(!e)return;
    if(e.tagName==='TEXTAREA'){
      const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')?.set;
      s?s.call(e,t):e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));return;
    }
    e.focus();const r=document.createRange(),g=getSelection();r.selectNodeContents(e);g.removeAllRanges();g.addRange(r);
    let done=false;try{done=document.execCommand('insertText',false,t)}catch{}
    if(!done){e.textContent=t;e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:t}))}
  }

  function quantityRule(){
    const products=getStr(KP,'Auto'), per=Math.max(1,Math.min(5,parseInt(getStr(KC,'2'),10)||2));
    if(products==='Auto') return `OUTPUT QUANTITY — VIRAG HARD LOCK: auto-detect DISTINCT products from the uploaded references and brief. Different angles/views of the same SKU count as ONE product. Create EXACTLY ${per} separate standalone creative${per===1?'':'s'} PER distinct product. If only one product is present, create ${per} genuinely different creative variation${per===1?'':'s'} of that SAME locked product. If multiple products are present, give each product exactly ${per} own creative${per===1?'':'s'} and never mix product identities. Every output must be a separate image — no collage, grid, contact sheet or multi-panel overview. Maximum target is 10 images per batch; if the total exceeds 10, split into logical batches of up to 10.`;
    const pc=Math.max(1,Math.min(5,parseInt(products,10)||1)), total=pc*per;
    const same=pc===1&&per>1?`All ${per} outputs must use the SAME product with its geometry/label locked, but each creative must have a visibly different design concept.`:`Each of the ${pc} distinct products must receive exactly ${per} creative${per===1?'':'s'}; do not combine different products into one creative unless explicitly requested.`;
    return `OUTPUT QUANTITY — VIRAG HARD LOCK: ${pc} distinct product${pc===1?'':'s'} × ${per} creative${per===1?'':'s'} per product = EXACTLY ${total} separate standalone output image${total===1?'':'s'}. ${same} Different angles/views of one SKU are references, not extra products. Never make a collage/grid/contact sheet. ${total>10?'The requested total exceeds 10, so split into batches of maximum 10 separate images.':''}`;
  }

  function ratioRule(){
    const f=getStr('virag.format','Auto');
    const map={
      '4:5':'EXACT 4:5 final canvas — 1080×1350 or exact multiple such as 2160×2700. Reject 2:3, 3:4, 9:16, 1024×1536 and any taller/narrower portrait.',
      '1:1':'EXACT 1:1 square final canvas.',
      '9:16':'EXACT 9:16 vertical final canvas.',
      '16:9':'EXACT 16:9 wide final canvas.'
    };
    if(!map[f])return'';
    return `FORMAT LOCK — VIRAG HIGHEST PRIORITY: ${map[f]} This is a hard output constraint, not a style hint. If the generator initially returns a different ratio, reframe, crop, extend or regenerate the SURROUNDING composition and deliver only the corrected exact-ratio final. Never stretch, squash, resize or reshape the product/face to make it fit.`;
  }

  function enhancePrompt(e){
    if(guard)return;const ed=editorOf(e.target);if(!ed)return;const t=readEditor(ed);
    if(!t.includes('PRESET:')||t.includes('OUTPUT QUANTITY — VIRAG HARD LOCK'))return;
    guard=true;writeEditor(ed,`${t}\n\n${quantityRule()} ${ratioRule()}`);guard=false;
  }

  function findRoot(){
    for(const el of document.querySelectorAll('div')){
      const r=el.shadowRoot;if(r?.querySelector('.shell')&&r.querySelector('.title')?.textContent?.includes('Virag'))return r;
    }
    return null;
  }

  function chip(root,parent,vals,current,key){
    parent.innerHTML='';
    vals.forEach(v=>{const b=document.createElement('button');b.className='chip'+(current===v?' on':'');b.textContent=v;b.onclick=()=>{setStr(key,v);inject(root)};parent.appendChild(b)});
  }

  function inject(root){
    if(!root)return;
    let st=root.querySelector('#virag770style');
    if(!st){st=document.createElement('style');st.id='virag770style';st.textContent='.viragQtySummary{padding:7px 14px 9px;border-bottom:1px solid #e7e7e7;background:#fff;font-size:9.5px;font-weight:850;color:#5e48c9}.viragQtySummary.warn{background:#fffaf0;color:#b45309}';root.appendChild(st)}
    const controls=root.querySelector('.controls');if(!controls)return;
    controls.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';
    let p=root.querySelector('.viragProducts');
    if(!p){p=document.createElement('div');p.className='viragProducts';p.innerHTML='<div class="controlLabel">PRODUCTS</div><div class="chips pchips"></div>';controls.appendChild(p)}
    let c=root.querySelector('.viragPerProduct');
    if(!c){c=document.createElement('div');c.className='viragPerProduct';c.innerHTML='<div class="controlLabel">CREATIVES / PRODUCT</div><div class="chips cchips"></div>';controls.appendChild(c)}
    chip(root,p.querySelector('.pchips'),['Auto','1','2','3','4','5'],getStr(KP,'Auto'),KP);
    chip(root,c.querySelector('.cchips'),['1','2','3','4','5'],getStr(KC,'2'),KC);
    let s=root.querySelector('.viragQtySummary');
    if(!s){s=document.createElement('div');s.className='viragQtySummary';controls.insertAdjacentElement('afterend',s)}
    const pv=getStr(KP,'Auto'),cv=parseInt(getStr(KC,'2'),10)||2;
    if(pv==='Auto'){s.classList.remove('warn');s.textContent=`Auto-detect products × ${cv} creative${cv===1?'':'s'} each • separate images • max 10 per batch`}
    else{const n=parseInt(pv,10)||1,total=n*cv;s.classList.toggle('warn',total>10);s.textContent=`${n} product${n===1?'':'s'} × ${cv} creative${cv===1?'':'s'} each = ${total} separate output${total===1?'':'s'}${total>10?' • split into max-10 batches':''}`}
    const status=root.querySelector('.status');if(status&&status.textContent.startsWith('v7.6.0'))status.textContent=status.textContent.replace('v7.6.0',`v${VERSION}`);
    const footer=root.querySelector('.footer>span');if(footer)footer.textContent=`Virag • v${VERSION} • exact ratio • quantity aware • runtime auto-sync`;
    const locks=root.querySelector('.locks');if(locks&&!root.querySelector('.viragQtyLock')){const q=document.createElement('span');q.className='lock viragQtyLock';q.innerHTML='<span class="ok"></span>QUANTITY AWARE';locks.appendChild(q)}
  }

  async function boot(){
    try{
      const core=await reqText(CORE);
      eval(core);
      document.addEventListener('input',enhancePrompt,true);
      const timer=setInterval(()=>{const r=findRoot();if(r)inject(r)},500);
      setTimeout(()=>clearInterval(timer),120000);
    }catch(e){console.error('[Virag] core load failed',e)}
  }
  boot();
})();