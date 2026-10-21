const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ctx = { $: { global: {} } };
vm.createContext(ctx);
for (const file of ['core/funcoes.jsx', 'modules/alfabeto.jsx',
  'modules/funcoesBolas.jsx', 'modules/funcoesLegenda.jsx']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
  Object.assign(ctx, ctx.$.global);
}

const dados = JSON.parse(fs.readFileSync('database2.json', 'utf8'));
const items = [];
const dropdown = text => ({ selection: { index: 1, text } });
function add(reference, quantidade) {
  const bola = dados.bolas.find(b => b.referencia === reference);
  const name = (table, id) => table.find(entry => entry.id === id).nome;
  ctx.adicionarBola(dropdown(name(dados.cores, bola.corId)),
    dropdown(name(dados.acabamentos, bola.acabamentoId)),
    dropdown(name(dados.tamanhos, bola.tamanhoId)),
    { text: String(quantidade) }, dados, items, () => {}, key => key, null, ctx.funcoes);
}
function preview(itensLegenda) {
  return ctx.atualizarPreview({ itensLegenda, campoNomeTipo: { text: 'GX327LW' } }).texto;
}

// Same references and quantities as the reported legend, through the real UI handler.
for (const [ref, count] of [['KB14OS', 4], ['KB08OB', 4], ['KB08OS', 4], ['KB14OB', 5]]) {
  add(ref, count);
}
const text = preview(items);
const phrase = text.split('\n')[0];
assert.ok(phrase.includes('boules or matte, or brillant'), phrase);
assert.equal(phrase.split('or matte').length - 1, 1, phrase);
assert.equal(phrase.split('or brillant').length - 1, 1, phrase);
assert.ok(!phrase.includes('cm'), phrase);
assert.ok(text.includes('Total : 17 boules'), text);
for (const item of items) {
  assert.ok(text.includes(item.referencia + ' (units): ' + item.quantidade), text);
}

// Preserve multiword colors, all finishes, singular and legacy names without a size.
for (const description of ['bleu cobalt matte', 'blanc pur brillant', 'vert foncé glitter']) {
  const output = preview([{ tipo: 'bola', nome: 'boule ' + description + ' 14 cm',
    quantidade: 1, unidade: 'units', referencia: 'TEST' }]);
  assert.ok(output.split('\n')[0].includes(', boule ' + description + ','), output);
}
const legacy = preview([{ tipo: 'bola', nome: 'boules or matte', quantidade: 2, unidade: 'units' }]);
assert.ok(legacy.split('\n')[0].includes('boules or matte,'), legacy);
assert.ok(!preview([]).split('\n')[0].includes('boule'));
console.log('PASS: ball finishes in the main phrase, deduplication, full colors and unchanged counts/references.');
