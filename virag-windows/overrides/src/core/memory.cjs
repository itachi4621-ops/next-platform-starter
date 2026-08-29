const fs = require('fs');
const path = require('path');
const { app } = require('electron');
function tokens(s){return new Set(String(s||'').toLowerCase().match(/[a-z0-9]{2,}/g)||[])}
class MemoryStore{
  constructor(){this.file=path.join(app.getPath('userData'),'virag-memory.json');this.items=[];this.load()}
  load(){try{if(fs.existsSync(this.file))this.items=JSON.parse(fs.readFileSync(this.file,'utf8'))}catch{this.items=[]}}
  save(){fs.mkdirSync(path.dirname(this.file),{recursive:true});fs.writeFileSync(this.file,JSON.stringify(this.items,null,2))}
  remember(text,tags=[],importance=.5){const item={id:`mem_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,text:String(text).slice(0,6000),tags:Array.isArray(tags)?tags.slice(0,20):[],importance:Math.max(0,Math.min(1,Number(importance)||.5)),createdAt:new Date().toISOString(),lastUsedAt:null};this.items.unshift(item);this.items=this.items.slice(0,5000);this.save();return item}
  search(query,limit=8){const q=tokens(query),now=Date.now();const ranked=this.items.map(m=>{const mt=tokens(`${m.text} ${(m.tags||[]).join(' ')}`);let overlap=0;for(const t of q)if(mt.has(t))overlap++;const lexical=q.size?overlap/q.size:0,ageDays=Math.max(0,(now-Date.parse(m.createdAt||now))/86400000),recency=1/(1+ageDays/30);return{m,score:lexical*.72+(m.importance||.5)*.18+recency*.10}}).filter(x=>x.score>.05).sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.min(30,limit)));for(const x of ranked)x.m.lastUsedAt=new Date().toISOString();if(ranked.length)this.save();return ranked.map(x=>({...x.m,score:Number(x.score.toFixed(3))}))}
  recent(limit=10){return this.items.slice(0,Math.max(1,Math.min(50,limit)))}
  forget(id){const before=this.items.length;this.items=this.items.filter(x=>x.id!==id);this.save();return before!==this.items.length}
  clear(){this.items=[];this.save()}
}
module.exports={MemoryStore};
