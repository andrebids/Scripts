const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('infrastructure/update.jsx', 'utf8');
function control() {
  return {enabled:true, visible:true, maximumSize:{}, preferredSize:{}, children:[],
    add(){const c=control();this.children.push(c);return c;}};
}
function run(states, pending=false) {
  let time=0, launches=0, polls=0;
  const window=control();window.layout={layout(){}};window.update=()=>{};
  window.onClose=()=>true;
  const button=control();const header=window.add();header.children.push(button);
  const ctx={console, JSON, Date:class {getTime(){return time;}},
    $:{global:{janelaScript:window},sleep(){time+=250;}},File:function(p){return {fsName:p,exists:true};}};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  const view=ctx.criarInterfaceUpdate(window,button,k=>k);
  const content=window.add();
  ctx.obterDiretorioProjeto=()=>'/project';ctx.obterPastaUpdater=()=>({fsName:'/temp'});
  ctx.criarRunId=()=> 'test';ctx.criarLauncherUpdate=()=>({execute(){launches++;return true;}});
  ctx.lerConteudoArquivo=()=>JSON.stringify(states[Math.min(polls++,states.length-1)]);
  ctx.mensagemEstadoUpdate=s=>({mensagem:s.state});
  if(pending){view.pending=true;view.statusFile={};view.logFile={fsName:'/log'};}
  ctx.executarUpdate(k=>k);
  return {ctx,view,window,button,content,launches,polls};
}
let r=run([{state:'DOWNLOADING',filesDownloaded:40,filesTotal:156},...Array(85).fill({state:'DOWNLOADING',filesDownloaded:41,filesTotal:156}),{state:'UPDATED'}]);
assert.ok(r.polls>80,'monitor must continue beyond 20 seconds');
assert.equal(r.view.texto.text,'updateConcluido');assert.equal(r.view.barra.value,100);
assert.equal(r.button.enabled,false);assert.equal(r.view.pending,false);assert.equal(r.window.onClose(),true);
r=run([{state:'COPY_FAILED'}]);assert.equal(r.view.texto.text,'updateErro');assert.equal(r.button.enabled,true);
r=run([{state:'ALREADY_CURRENT'}]);assert.equal(r.view.texto.text,'scriptAtualizado');
r=run([{state:'RUNNING'}]);assert.equal(r.view.pending,true);assert.equal(r.window.onClose(),false);
assert.equal(r.view.acao.text,'updateAcompanhar');assert.equal(r.launches,1);
r.ctx.lerConteudoArquivo=()=>JSON.stringify({state:'UPDATED'});r.view.acao.onClick();
assert.equal(r.view.pending,false);assert.equal(r.content.enabled,true);assert.equal(r.window.onClose(),true);
r=run([{state:'UPDATED'}],true);assert.equal(r.launches,0,'resuming must not launch a second worker');
const p=r.ctx.apresentarProgressoUpdate({state:'COPYING',filesCopied:2,filesDownloaded:100,filesTotal:100},k=>k);
assert.equal(p.percent,2);assert.equal(p.texto,'updateInstalar — 2/100');
for(const path of ['script.jsx','assets/translations.js']) new vm.Script(fs.readFileSync(path,'utf8').replace(/^#.*$/gm,''));
console.log('Updater checks passed: progress beyond 20s, completion, errors, current version, stalled/resumed worker, close guard, phase counts and syntax.');
