const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ctx = { $: { global: {} } };
vm.createContext(ctx);
for (const file of ['core/funcoes.jsx', 'modules/alfabeto.jsx', 'modules/funcoesLegenda.jsx']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
  Object.assign(ctx, ctx.$.global);
}

const alphabet = ctx.processarAlfabeto('#WENDUINE', 'vert foncé', '1,40 m');
const itemAlphabet = { tipo: 'alfabeto', palavraDigitada: alphabet.palavraDigitada,
  corBioprint: alphabet.corBioprint, texto: alphabet.referenciasTexto.join('\n') };
const lucioles = [
  { tipo: 'componente', nome: 'lucioles led vert', referencia: 'LUCIOLES LED VERT', unidade: 'm2', quantidade: 22.55 },
  { tipo: 'componente', nome: 'lucioles led blanc chaud + flash blanc pur',
    referencia: 'LUCIOLES LED BLANC CHAUD + FLASH BLANC PUR', unidade: 'm2', quantidade: 29 }
];
const expected = 'avec lucioles led blanc chaud + flash blanc pur et led vert';
for (const items of [[itemAlphabet, ...lucioles], lucioles]) {
  const result = ctx.atualizarPreview({ itensLegenda: items,
    campoNomeTipo: { text: '#WENDUINE' }, listaL: { selection: { text: 'L1' } } });
  const phrase = result.texto.split('\n')[0];
  assert.ok(phrase.includes(expected), phrase);
  assert.equal(phrase.split('lucioles').length - 1, 1, phrase);
  assert.ok(result.texto.includes('LUCIOLES LED VERT (m²): 22,55'), result.texto);
  assert.ok(result.texto.includes('LUCIOLES LED BLANC CHAUD + FLASH BLANC PUR (m²): 29,00'), result.texto);
  assert.equal(phrase.includes('en bioprint vert foncé'), items[0] === itemAlphabet, phrase);
}
const alphabetOnly = ctx.atualizarPreview({ itensLegenda: [itemAlphabet] }).texto.split('\n')[0];
assert.ok(alphabetOnly.includes('en bioprint vert foncé, sur structure aluminium.'), alphabetOnly);
assert.ok(!alphabetOnly.includes('avec'), alphabetOnly);
const regularBioprint = ctx.gerarFrasePrincipal({ campoNomeTipo: 'Test',
  componentesTexto: ['bioprint vert foncé', 'lucioles led vert'] });
assert.ok(regularBioprint.includes('en bioprint vert foncé avec lucioles led vert'), regularBioprint);
console.log('PASS: lucioles with and without alphabet, quantities, alphabet alone and regular bioprint.');
