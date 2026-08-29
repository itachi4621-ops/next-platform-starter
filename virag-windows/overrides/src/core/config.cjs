const fs = require('fs');
const path = require('path');
const { safeStorage, app } = require('electron');

class ConfigStore {
  constructor() {
    this.dir = app.getPath('userData');
    this.file = path.join(this.dir, 'virag-config.json');
    this.data = {
      aiProvider: 'local',
      apiKeyEncrypted: null,
      realtimeModel: 'gpt-realtime-2.1',
      reasoningModel: 'gpt-5.6-terra',
      voice: 'marin',
      localModel: 'auto',
      localVisionModel: 'auto',
      whisperModelPath: '~/.virag/models/ggml-small.bin',
      localVoice: '',
      voiceThreshold: 0.025,
      wakeMode: false,
      wakePhrase: 'hey virag',
      browserHeadless: false,
      allowShellTools: false,
      allowUiAutomation: false,
      userName: '',
      assistantName: 'Virag',
      launchAtLogin: false,
      autoUpdateEnabled: true,
      autoInstallUpdates: true
    };
    this.load();
  }
  load(){try{if(fs.existsSync(this.file))this.data={...this.data,...JSON.parse(fs.readFileSync(this.file,'utf8'))}}catch(e){console.error('Config load failed:',e)}}
  save(){fs.mkdirSync(this.dir,{recursive:true});fs.writeFileSync(this.file,JSON.stringify(this.data,null,2))}
  setApiKey(key){const value=String(key||'').trim();if(!value)this.data.apiKeyEncrypted=null;else if(safeStorage.isEncryptionAvailable())this.data.apiKeyEncrypted=safeStorage.encryptString(value).toString('base64');else{this.data.apiKeyEncrypted=Buffer.from(value,'utf8').toString('base64');this.data.apiKeyWeakStorage=true}this.save()}
  getApiKey(){if(!this.data.apiKeyEncrypted)return process.env.OPENAI_API_KEY||'';try{const buf=Buffer.from(this.data.apiKeyEncrypted,'base64');if(safeStorage.isEncryptionAvailable()&&!this.data.apiKeyWeakStorage)return safeStorage.decryptString(buf);return buf.toString('utf8')}catch{return process.env.OPENAI_API_KEY||''}}
  public(){const{apiKeyEncrypted,apiKeyWeakStorage,...rest}=this.data;return{...rest,hasApiKey:Boolean(this.getApiKey())}}
  update(patch={}){const allowed=['aiProvider','realtimeModel','reasoningModel','voice','localModel','localVisionModel','whisperModelPath','localVoice','voiceThreshold','wakeMode','wakePhrase','browserHeadless','allowShellTools','allowUiAutomation','userName','assistantName','launchAtLogin','autoUpdateEnabled','autoInstallUpdates'];for(const k of allowed)if(Object.prototype.hasOwnProperty.call(patch,k))this.data[k]=patch[k];this.save();return this.public()}
}
module.exports={ConfigStore};
