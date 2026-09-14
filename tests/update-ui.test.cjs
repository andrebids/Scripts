const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('infrastructure/update.jsx', 'utf8');
function control() {
  return {enabled:true, visible:true, maximumSize:{}, preferredSize:{}, children:[],
    add(){const c=control();this.children.push(c);return c;}};
}
function run(states, options={}) {
  let time=0;
  const stats={launches:0,polls:0,reloads:0,closed:0,alerts:[],events:[]};
  const window=control();
  window.hide=()=>{window.visible=false;};window.show=()=>{window.visible=true;};
  window.layout={layout(){assert.equal(window.visible,false,'relayout while hidden prevents Illustrator black background');assert.equal(stats.closed,0,'no layout on the closed window');stats.events.push('layout');}};
  window.update=()=>{};
  const button=control();const header=window.add();header.children.push(button);
  const ctx={console, JSON, Date:class {getTime(){return time;}},
    alert(message){stats.alerts.push(message);},
    $:{global:{janelaScript:window},sleep(){time+=250;ctx.$.fileName='/changed/callback.jsx';},
      evalFile(file){
        assert.equal(file.fsName,'/project/script.jsx','use captured path');
        assert.equal(stats.closed,1);assert.equal(view.running,false);assert.equal(view.pending,false);
        assert.equal(stats.events.at(-1),'close');stats.events.push('reload');stats.reloads++;
        if(options.reloadFails) throw Error('reload failed');
        ctx.$.global.janelaScript={newWindow:true};
      }},
    File:function(p){return {fsName:p,exists:!options.missingScript,parent:{fsName:'/project'}};}};
  window.close=()=>{
    if(window.onClose()===false) return false;
    stats.closed++;stats.events.push('close');ctx.$.global.janelaScript=null;return true;
  };
  window.onClose=()=>true;
  vm.createContext(ctx);vm.runInContext(source,ctx);
  ctx.obterDiretorioProjeto=()=>'/project';ctx.obterPastaUpdater=()=>({fsName:'/temp'});
  const view=ctx.criarInterfaceUpdate(window,button,k=>k);
  const content=window.add();
  ctx.criarRunId=()=> 'test';ctx.criarLauncherUpdate=()=>({execute(){stats.launches++;return true;}});
  ctx.lerConteudoArquivo=()=>JSON.stringify(states[Math.min(stats.polls++,states.length-1)]);
  if(options.pending){view.pending=true;view.statusFile={};view.logFile={fsName:'/log'};}
  ctx.executarUpdate(k=>k);
  return {ctx,view,window,button,content,stats};
}
let r=run([{state:'DOWNLOADING',phase:'DOWNLOAD'},...Array(85).fill({state:'DOWNLOADING',phase:'EXTRACTING'}),{state:'UPDATED'}]);
assert.ok(r.stats.polls>80,'monitor must continue beyond 20 seconds');
assert.equal(r.view.texto.text,'updateConcluido');assert.equal(r.view.barra.value,100);
assert.equal(r.button.enabled,false);assert.equal(r.view.pending,false);
assert.equal(r.stats.reloads,1);assert.equal(r.ctx.$.global.janelaScript.newWindow,true);
assert.equal(r.stats.events.at(-2),'close');assert.equal(r.stats.events.at(-1),'reload');
assert.equal(r.stats.alerts.length,0);
for(const state of ['COPY_FAILED','DOWNLOAD_FAILED','INVALID_PACKAGE','ELEVATION_FAILED']) {
  r=run([{state}]);assert.equal(r.view.texto.text,'updateErro');assert.equal(r.button.enabled,true);
  assert.equal(r.stats.reloads,0);assert.equal(r.stats.closed,0);
}
r=run([{state:'ALREADY_CURRENT'}]);assert.equal(r.view.texto.text,'scriptAtualizado');assert.equal(r.stats.reloads,0);
assert.equal(r.view.acao.visible,false);assert.equal(r.view.barra.visible,false);
assert.equal(r.view.acao.maximumSize.width,0);assert.equal(r.view.barra.maximumSize.width,0);
assert.equal(r.view.painel.children[0].orientation,'row');
const details=r.view.painel.children[0].children.at(-1);
details.onClick();assert.equal(r.view.campo.visible,true);assert.equal(details.text,'updateOcultarDetalhes');
details.onClick();assert.equal(r.view.campo.visible,false);assert.equal(r.view.campo.maximumSize.height,0);
r=run([{state:'RUNNING'}]);assert.equal(r.view.pending,true);assert.equal(r.window.onClose(),false);
assert.equal(r.view.acao.text,'updateAcompanhar');assert.equal(r.stats.launches,1);assert.equal(r.stats.reloads,0);
r.ctx.lerConteudoArquivo=()=>JSON.stringify({state:'UPDATED'});r.view.acao.onClick();
assert.equal(r.view.pending,false);assert.equal(r.content.enabled,true);assert.equal(r.stats.reloads,1);assert.equal(r.stats.launches,1);
r=run([{state:'UPDATED'}],{pending:true});assert.equal(r.stats.launches,0);assert.equal(r.stats.reloads,1);
r=run([{state:'UPDATED'}],{reloadFails:true});assert.equal(r.stats.alerts.length,1);
assert.match(r.stats.alerts[0],/updateReinicioManual/);assert.equal(r.view.updated,true);
r.ctx.$.global.janelaScript=r.window;r.ctx.executarUpdate(k=>k);
assert.equal(r.stats.launches,1,'a failed reload must not start another install');
r=run([{state:'UPDATED'}],{missingScript:true,pending:true});assert.equal(r.stats.closed,0);assert.equal(r.stats.reloads,0);assert.equal(r.stats.alerts.length,1);
const p=r.ctx.apresentarProgressoUpdate({state:'COPYING',filesCopied:2,filesDownloaded:100,filesTotal:100},k=>k);
assert.equal(p.percent,2);assert.equal(p.texto,'updateInstalar — 2/100');
for(const [phase,key] of [['DOWNLOAD','updateDownload'],['EXTRACTING','updateDescompactar']]) {
  const p=r.ctx.apresentarProgressoUpdate({state:'DOWNLOADING',phase},k=>k);
  assert.equal(p.texto,key);assert.equal(p.percent,0);assert.equal(r.ctx.estadoUpdateFinalizado('DOWNLOADING'),false);
}
const translations={};vm.createContext(translations);vm.runInContext(fs.readFileSync('assets/translations.js','utf8'),translations);
for(const language of ['Português','Français']) for(const key of ['updateDescompactar','updateReabrir','updateReinicioManual','updateAvisoReinicio']) assert.ok(translations.TRANSLATIONS[language][key]);
for(const path of ['script.jsx','assets/translations.js']) new vm.Script(fs.readFileSync(path,'utf8').replace(/^#.*$/gm,''));
console.log('Updater UI checks passed: phases, errors, current version, stalled/resumed worker, captured path, close-before-reload, single restart and restart failure.');
