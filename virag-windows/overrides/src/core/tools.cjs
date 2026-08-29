const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const { execFile, exec } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);
const { shell, clipboard, dialog, Notification, desktopCapturer, app } = require('electron');
const OpenAI = require('openai');

function safePath(p) { return path.resolve(String(p || '').replace(/^~(?=$|\/|\\)/, os.homedir())); }
function decodeHtml(s=''){ return String(s).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
async function freeWebSearch(query){
  const q=encodeURIComponent(String(query||'')),url=`https://html.duckduckgo.com/html/?q=${q}`;
  const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 Virag/2.0'}}); if(!r.ok) throw new Error(`Free web search failed (${r.status})`);
  const html=await r.text(),out=[];
  const rx=/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:class="result__snippet"[^>]*>([\s\S]*?)<\/a>|class="result__snippet"[^>]*>([\s\S]*?)<\/div>)/gi;
  let m; while((m=rx.exec(html))&&out.length<8)out.push({title:decodeHtml(m[2]),url:decodeHtml(m[1]),snippet:decodeHtml(m[3]||m[4]||'')});
  if(!out.length){const simple=[...html.matchAll(/class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].slice(0,8);for(const x of simple)out.push({title:decodeHtml(x[2]),url:decodeHtml(x[1]),snippet:''})}
  return{query:String(query),results:out,engine:'DuckDuckGo public HTML'};
}

const toolDefinitions = [
  {type:'function',name:'get_system_info',description:'Get local computer platform, home directory, hostname and time.',parameters:{type:'object',properties:{},additionalProperties:false}},
  {type:'function',name:'open_app',description:'Open a desktop application by name, e.g. Chrome, Premiere Pro, Calculator, Notepad.',parameters:{type:'object',properties:{name:{type:'string'}},required:['name'],additionalProperties:false}},
  {type:'function',name:'open_url',description:'Open a URL in the user default browser.',parameters:{type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false}},
  {type:'function',name:'open_path',description:'Open a local file or folder in the operating system.',parameters:{type:'object',properties:{path:{type:'string'}},required:['path'],additionalProperties:false}},
  {type:'function',name:'list_directory',description:'List files and folders in a local directory.',parameters:{type:'object',properties:{path:{type:'string'}},required:['path'],additionalProperties:false}},
  {type:'function',name:'find_files',description:'Find files/folders below a directory whose names contain a query.',parameters:{type:'object',properties:{root:{type:'string'},query:{type:'string'},limit:{type:'integer'}},required:['root','query'],additionalProperties:false}},
  {type:'function',name:'read_text_file',description:'Read a local text/code/json/csv file. Avoid huge binary files.',parameters:{type:'object',properties:{path:{type:'string'},maxChars:{type:'integer'}},required:['path'],additionalProperties:false}},
  {type:'function',name:'write_text_file',description:'Create or replace a local text file with content.',parameters:{type:'object',properties:{path:{type:'string'},content:{type:'string'}},required:['path','content'],additionalProperties:false}},
  {type:'function',name:'create_folder',description:'Create a folder including parents.',parameters:{type:'object',properties:{path:{type:'string'}},required:['path'],additionalProperties:false}},
  {type:'function',name:'rename_path',description:'Rename a file or folder.',parameters:{type:'object',properties:{from:{type:'string'},to:{type:'string'}},required:['from','to'],additionalProperties:false}},
  {type:'function',name:'move_path',description:'Move a file or folder.',parameters:{type:'object',properties:{from:{type:'string'},to:{type:'string'}},required:['from','to'],additionalProperties:false}},
  {type:'function',name:'copy_path',description:'Copy a file or folder recursively.',parameters:{type:'object',properties:{from:{type:'string'},to:{type:'string'}},required:['from','to'],additionalProperties:false}},
  {type:'function',name:'trash_path',description:'Move a file or folder to system Recycle Bin. This is destructive and requires approval.',parameters:{type:'object',properties:{path:{type:'string'}},required:['path'],additionalProperties:false}},
  {type:'function',name:'clipboard_read',description:'Read text from clipboard.',parameters:{type:'object',properties:{},additionalProperties:false}},
  {type:'function',name:'clipboard_write',description:'Write text to clipboard.',parameters:{type:'object',properties:{text:{type:'string'}},required:['text'],additionalProperties:false}},
  {type:'function',name:'notify',description:'Show a desktop notification.',parameters:{type:'object',properties:{title:{type:'string'},body:{type:'string'}},required:['title','body'],additionalProperties:false}},
  {type:'function',name:'remember',description:'Save durable user information or a preference into Virag memory when explicitly asked or clearly useful later.',parameters:{type:'object',properties:{text:{type:'string'},tags:{type:'array',items:{type:'string'}},importance:{type:'number'}},required:['text'],additionalProperties:false}},
  {type:'function',name:'recall_memory',description:'Search Virag long-term memory for relevant user facts, preferences, project decisions, or prior instructions.',parameters:{type:'object',properties:{query:{type:'string'},limit:{type:'integer'}},required:['query'],additionalProperties:false}},
  {type:'function',name:'web_search',description:'Search the live web and return free public search results in local mode.',parameters:{type:'object',properties:{query:{type:'string'}},required:['query'],additionalProperties:false}},
  {type:'function',name:'analyze_screen',description:'Capture the primary screen and visually analyze what is currently visible.',parameters:{type:'object',properties:{question:{type:'string'}},required:['question'],additionalProperties:false}},
  {type:'function',name:'browser_navigate',description:'Open/control Virag automated browser and navigate to a URL.',parameters:{type:'object',properties:{url:{type:'string'}},required:['url'],additionalProperties:false}},
  {type:'function',name:'browser_snapshot',description:'Inspect the current automated browser page.',parameters:{type:'object',properties:{},additionalProperties:false}},
  {type:'function',name:'browser_click',description:'Click an element in the automated browser by visible text, CSS selector, or control index.',parameters:{type:'object',properties:{text:{type:'string'},selector:{type:'string'},index:{type:'integer'}},additionalProperties:false}},
  {type:'function',name:'browser_fill',description:'Fill a form field in the automated browser.',parameters:{type:'object',properties:{selector:{type:'string'},label:{type:'string'},placeholder:{type:'string'},value:{type:'string'}},required:['value'],additionalProperties:false}},
  {type:'function',name:'browser_press',description:'Press a keyboard key/combo in automated browser.',parameters:{type:'object',properties:{key:{type:'string'}},required:['key'],additionalProperties:false}},
  {type:'function',name:'browser_close',description:'Close Virag automated browser.',parameters:{type:'object',properties:{},additionalProperties:false}},
  {type:'function',name:'run_shell_command',description:'Run a local shell command only when truly necessary. Always requires user approval.',parameters:{type:'object',properties:{command:{type:'string'}},required:['command'],additionalProperties:false}},
  {type:'function',name:'windows_ui_script',description:'On Windows, run an approved PowerShell UI automation script when direct app/browser tools are insufficient.',parameters:{type:'object',properties:{script:{type:'string'}},required:['script'],additionalProperties:false}},
  {type:'function',name:'mac_ui_script',description:'On macOS, run an approved AppleScript UI automation command.',parameters:{type:'object',properties:{script:{type:'string'}},required:['script'],additionalProperties:false}}
];

class ToolExecutor {
  constructor({config,memory,browser,getWindow}){this.config=config;this.memory=memory;this.browser=browser;this.getWindow=getWindow;this.localAI=null}
  setLocalAI(localAI){this.localAI=localAI}
  async confirm(title,detail){const r=await dialog.showMessageBox(this.getWindow(),{type:'warning',buttons:['Cancel','Allow once'],defaultId:0,cancelId:0,title,message:title,detail:String(detail).slice(0,4000)});return r.response===1}
  async findFiles(root,query,limit=40){root=safePath(root);query=String(query).toLowerCase();const out=[],stack=[root];while(stack.length&&out.length<limit){const dir=stack.pop();let ents=[];try{ents=await fsp.readdir(dir,{withFileTypes:true})}catch{continue}for(const e of ents){const p=path.join(dir,e.name);if(e.name.toLowerCase().includes(query))out.push(p);if(e.isDirectory()&&!e.name.startsWith('.')&&stack.length<5000)stack.push(p);if(out.length>=limit)break}}return out}
  async capturePrimary(){const sources=await desktopCapturer.getSources({types:['screen'],thumbnailSize:{width:1920,height:1080}});if(!sources[0])throw new Error('No screen source available');return sources[0].thumbnail.toPNG()}
  async openAI(){const key=this.config.getApiKey();if(!key)throw new Error('OpenAI API key is not configured in Virag Settings.');return new OpenAI({apiKey:key})}

  async execute(name,args={}){
    switch(name){
      case 'get_system_info':return{platform:process.platform,arch:process.arch,hostname:os.hostname(),home:os.homedir(),time:new Date().toString(),appVersion:app.getVersion()};
      case 'open_url':await shell.openExternal(args.url);return{ok:true};
      case 'open_path':{const e=await shell.openPath(safePath(args.path));return e?{ok:false,error:e}:{ok:true}}
      case 'open_app':{
        const n=String(args.name);
        if(process.platform==='darwin')await execFileAsync('open',['-a',n]);
        else if(process.platform==='win32'){
          const safe=n.replace(/'/g,"''");const ps=`$n='${safe}'; $m=Get-StartApps | Where-Object { $_.Name -like ('*'+$n+'*') } | Select-Object -First 1; if($m){ Start-Process ('shell:AppsFolder\\'+$m.AppID) } else { Start-Process $n }`;const enc=Buffer.from(ps,'utf16le').toString('base64');
          await execFileAsync('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',enc],{timeout:15000,windowsHide:true});
        }else await execAsync(`${n.replace(/[^\w.-]/g,'')} >/dev/null 2>&1 &`);
        return{ok:true,name:n};
      }
      case 'list_directory':{const p=safePath(args.path),ents=await fsp.readdir(p,{withFileTypes:true});return ents.slice(0,300).map(e=>({name:e.name,type:e.isDirectory()?'folder':'file',path:path.join(p,e.name)}))}
      case 'find_files':return await this.findFiles(args.root,args.query,args.limit||40);
      case 'read_text_file':{const p=safePath(args.path),max=Math.min(1000000,Math.max(1000,args.maxChars||80000)),b=await fsp.readFile(p);if(b.length>10000000)throw new Error('File too large');return b.toString('utf8',0,max)}
      case 'write_text_file':{const p=safePath(args.path);await fsp.mkdir(path.dirname(p),{recursive:true});await fsp.writeFile(p,String(args.content),'utf8');return{ok:true,path:p}}
      case 'create_folder':{const p=safePath(args.path);await fsp.mkdir(p,{recursive:true});return{ok:true,path:p}}
      case 'rename_path':case 'move_path':{const a=safePath(args.from),b=safePath(args.to);await fsp.mkdir(path.dirname(b),{recursive:true});await fsp.rename(a,b);return{ok:true,from:a,to:b}}
      case 'copy_path':{const a=safePath(args.from),b=safePath(args.to);await fsp.cp(a,b,{recursive:true});return{ok:true,from:a,to:b}}
      case 'trash_path':{const p=safePath(args.path);if(!await this.confirm('Move item to Recycle Bin?',p))return{ok:false,cancelled:true};await shell.trashItem(p);return{ok:true}}
      case 'clipboard_read':return{text:clipboard.readText()};
      case 'clipboard_write':clipboard.writeText(String(args.text));return{ok:true};
      case 'notify':if(Notification.isSupported())new Notification({title:String(args.title),body:String(args.body)}).show();return{ok:true};
      case 'remember':return this.memory.remember(args.text,args.tags||[],args.importance??0.5);
      case 'recall_memory':return this.memory.search(args.query,args.limit||8);
      case 'web_search':{
        if(this.config.data.aiProvider==='local')return await freeWebSearch(args.query);const client=await this.openAI();const r=await client.responses.create({model:this.config.data.reasoningModel,tools:[{type:'web_search'}],input:String(args.query)});return{answer:r.output_text};
      }
      case 'analyze_screen':{
        const png=await this.capturePrimary();if(this.config.data.aiProvider==='local'){if(!this.localAI)throw new Error('Local vision engine is unavailable.');return await this.localAI.vision(args.question,png)}const client=await this.openAI();const r=await client.responses.create({model:this.config.data.reasoningModel,input:[{role:'user',content:[{type:'input_text',text:`You are Virag's screen vision. Answer this request about the current screen: ${args.question}`},{type:'input_image',image_url:`data:image/png;base64,${png.toString('base64')}`}]}]});return{answer:r.output_text};
      }
      case 'browser_navigate':return await this.browser.navigate(args.url);
      case 'browser_snapshot':return await this.browser.snapshot();
      case 'browser_click':return await this.browser.click(args);
      case 'browser_fill':return await this.browser.fill(args);
      case 'browser_press':return await this.browser.press(args.key);
      case 'browser_close':return await this.browser.close();
      case 'run_shell_command':{
        if(!this.config.data.allowShellTools)return{ok:false,error:'Shell tools are disabled in Settings.'};if(!await this.confirm('Allow Virag to run this command?',args.command))return{ok:false,cancelled:true};const{stdout,stderr}=await execAsync(args.command,{timeout:30000,maxBuffer:1024*1024});return{ok:true,stdout:String(stdout||'').slice(0,30000),stderr:String(stderr||'').slice(0,10000)};
      }
      case 'windows_ui_script':{
        if(process.platform!=='win32')return{ok:false,error:'windows_ui_script is only available on Windows.'};if(!this.config.data.allowUiAutomation)return{ok:false,error:'UI automation is disabled in Settings.'};if(!await this.confirm('Allow Virag to control the Windows UI?',args.script))return{ok:false,cancelled:true};const enc=Buffer.from(String(args.script||''),'utf16le').toString('base64');const{stdout,stderr}=await execFileAsync('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',enc],{timeout:30000,maxBuffer:1024*1024,windowsHide:true});return{ok:true,stdout:String(stdout||'').slice(0,30000),stderr:String(stderr||'').slice(0,10000)};
      }
      case 'mac_ui_script':{
        if(process.platform!=='darwin')return{ok:false,error:'mac_ui_script is only available on macOS.'};if(!this.config.data.allowUiAutomation)return{ok:false,error:'UI automation is disabled in Settings.'};if(!await this.confirm('Allow Virag to control the Mac UI?',args.script))return{ok:false,cancelled:true};const{stdout,stderr}=await execFileAsync('osascript',['-e',args.script],{timeout:30000});return{ok:true,stdout,stderr};
      }
      default:throw new Error(`Unknown tool: ${name}`);
    }
  }
}
module.exports={ToolExecutor,toolDefinitions};
