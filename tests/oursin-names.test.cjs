const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const original = {
  componentes: [
    {id:50,nome:'oursin 2D argent',referencia:'FCL035-ARGENT'},
    {id:51,nome:'oursin 2D or',referencia:'FCL035-OR'},
    {id:31,nome:'oursin argent',referencia:'FCL080A'},
    {id:30,nome:'oursin 3d or',referencia:'FCL080G',semCor:true},
    {id:52,nome:'petit oursin argent',referencia:'FL930A-E'},
    {id:53,nome:'petit oursin or',referencia:'FL930G-E'},
    {id:11,nome:'bioprint'}
  ],
  cores: [{id:1,nome:'blanc chaud'},{id:2,nome:'blanc pur'},
    {id:53,nome:'led blanc pur + flash blanc pur'},
    {id:54,nome:'led blanc chaud + flash blanc pur'}],
  combinacoes: [
    {id:306,componenteId:50,corId:2,unidade:'units',referencia:'FCL035-ARGENT'},
    {id:307,componenteId:51,corId:1,unidade:'units',referencia:'OURSIN 2D - OR'},
    {id:197,componenteId:31,corId:53,unidade:'units',referencia:'FCL080A'},
    {id:196,componenteId:30,corId:54,unidade:'units',referencia:'FCL080G'},
    {id:308,componenteId:52,corId:53,unidade:'units',referencia:'FL930A-E'},
    {id:309,componenteId:53,corId:54,unidade:'units',referencia:'FL930G-E'}
  ]
};
let contents = JSON.stringify(original);
const ctx = {$:{global:{}}, File:function(){return {exists:true,open(){},read(){return contents;},close(){}};}};
vm.createContext(ctx);
for (const path of ['core/funcoes.jsx','core/database.jsx','modules/funcoesLegenda.jsx']) {
  vm.runInContext(fs.readFileSync(path,'utf8'),ctx);
  Object.assign(ctx,ctx.$.global);
}
const loaded = ctx.lerArquivoJSON('database.json');
assert.deepEqual(Array.from(loaded.componentes,c=>c.nome),['oursin 2d','oursin 3d','petit oursin','bioprint']);
assert.deepEqual(JSON.parse(JSON.stringify(loaded.combinacoes)),original.combinacoes.map(c=>({...c,componenteId:({51:50,30:31,53:52})[c.componenteId]||c.componenteId})));
contents=JSON.stringify(loaded);
assert.equal(JSON.stringify(ctx.lerArquivoJSON('database.json')),contents,'loading must be idempotent');
for(const [name,colors] of [
  ['oursin 2d',['blanc pur','blanc chaud']],
  ['oursin 3d',['led blanc pur + flash blanc pur','led blanc chaud + flash blanc pur']],
  ['petit oursin',['led blanc pur + flash blanc pur','led blanc chaud + flash blanc pur']]
]) {
  const dropdown={items:[],removeAll(){this.items=[];},add(_,name){this.items.push(name);}};
  ctx.atualizarCores({selection:{index:1,text:name}},dropdown,{},loaded,k=>k);
  assert.deepEqual(dropdown.items,['selecioneCor',...colors]);
  assert.equal(dropdown.selection,0,'multiple colors must require selection');
}
function phrase(names){return ctx.gerarFrasePrincipal({campoNomeTipo:'Test',componentesTexto:names});}
const legacy=phrase(['oursin argent','oursin or','oursin 2d argent']);
assert.equal(phrase(['oursin 3d argent','oursin 3d or','oursin 2d argent']),legacy);
const grouped=phrase(['oursin 2d blanc pur','oursin 3d led blanc pur','petit oursin argent','petit oursin or']);
assert.ok(grouped.includes('oursin 2d led blanc pur'),grouped);
assert.ok(grouped.includes('oursin 3d led blanc pur'),grouped);
assert.ok(grouped.includes('petit oursin argent et or'),grouped);
assert.ok(!phrase(['oursin 3d']).includes('3d 3d'));
console.log('Oursin checks passed: three families, color dropdowns, references, idempotence and legends.');

// Exercise the actual pipeline: items are grouped before the main phrase is built.
const items = [
  'oursin 2d blanc chaud', 'oursin 2d blanc pur',
  'oursin 3d led blanc chaud + flash blanc pur',
  'petit oursin led blanc pur + flash blanc pur',
  'oursin 2d led blanc pur'
].map((nome,i)=>({tipo:'componente',nome,referencia:'REF'+i,unidade:'units',quantidade:1}));
const processed = ctx.processarComponentes(items);
assert.equal(processed.componentesTexto.length,3);
assert.equal(processed.componentesReferencias.length,5);
const finalPhrase = phrase(processed.componentesTexto);
for (const family of ['oursin 2d','oursin 3d','petit oursin']) {
  assert.equal(finalPhrase.split(family).length-1,1,finalPhrase);
}
assert.ok(finalPhrase.includes('oursin 2d led blanc chaud et led blanc pur'),finalPhrase);
assert.ok(!finalPhrase.includes('led led'),finalPhrase);
const oldItems = ['oursin 3d or led blanc chaud + flash blanc pur',
  'oursin 2D argent blanc pur + flash blanc pur'].map((nome,i)=>({
    tipo:'componente',nome,referencia:'OLD'+i,unidade:'units',quantidade:1
  }));
const oldPhrase = phrase(ctx.processarComponentes(oldItems).componentesTexto);
assert.ok(oldPhrase.includes('oursin 3d or led blanc chaud + flash blanc pur'),oldPhrase);
assert.ok(oldPhrase.includes('oursin 2d argent led blanc pur + flash blanc pur'),oldPhrase);
console.log('Full description pipeline passed: separate families, combined colors, LED prefix and legacy finishes.');

for (const [input, expected] of [
  ['oursin 2d blanc pur', 'led blanc pur'],
  ['oursin 2d blanc chaud', 'led blanc chaud'],
  ['oursin 2d argent blanc pur', 'argent led blanc pur'],
  ['oursin 2d or blanc chaud', 'or led blanc chaud'],
  ['oursin 2d led blanc pur', 'led blanc pur']
]) {
  assert.equal(ctx.obterDescricaoOursin(input).cor, expected);
}
console.log('LED replacement passed: missing finish never becomes undefined.');
