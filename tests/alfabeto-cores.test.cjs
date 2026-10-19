const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ctx = { $: { global: {} }, logs: { adicionarLog(message) {
  if (message.indexOf('Erro ao criar interface') === 0) throw Error(message);
} }, ui: {
  mostrarAlertaPersonalizado(message) { throw Error(message); }
} };
vm.createContext(ctx);
for (const path of ['core/funcoes.jsx', 'modules/funcoesFiltragem.jsx',
  'modules/alfabeto.jsx', 'modules/funcoesLegenda.jsx', 'assets/translations.js']) {
  vm.runInContext(fs.readFileSync(path, 'utf8').replace(/^#.*$/gm, ''), ctx);
  Object.assign(ctx, ctx.$.global);
}

// ScriptUI selections return ListItem objects, including when set by index.
function control(type, text) {
  let selected = null;
  const c = { type, text, children: [], items: [], enabled: true, value: false,
    preferredSize: {}, graphics: { BrushType: {}, newBrush() {} },
    add(type, bounds, text) {
      if (type === 'item' && text === undefined) text = bounds;
      const child = control(type, text);
      child.parent = this;
      this.children.push(child);
      if (type === 'item') { child.index = this.items.length; this.items.push(child); }
      if (Array.isArray(text)) text.forEach(label => child.add('item', null, label));
      return child;
    },
    removeAll() { this.items = []; selected = null; }
  };
  Object.defineProperty(c, 'selection', {
    get() { return selected; },
    set(value) { selected = typeof value === 'number' ? c.items[value] : value; }
  });
  return c;
}

const data = JSON.parse(fs.readFileSync('assets/database2.json', 'utf8'));
let dialogAction;
ctx.Window = function(type) {
  assert.equal(type, 'dialog');
  const dialog = control(type);
  dialog.close = result => { dialog.result = result; };
  dialog.show = () => {
    assert.ok(dialogAction, 'opening a dialog must be covered by the check');
    const action = dialogAction; dialogAction = null; action(dialog);
    return dialog.result || 0;
  };
  return dialog;
};
const descendants = root => root.children.flatMap(child => [child, ...descendants(child)]);
for (const language of ['Português', 'Français']) {
  const t = key => ctx.TRANSLATIONS[language][key] || key;
  for (const key of ['alfabetoPersonalizar', 'alfabetoVariasCores', 'alfabetoTodasGerais',
    'alfabetoPersonalizadas', 'alfabetoAplicar', 'alfabetoUsarCoresGerais', 'cancelar']) assert.notEqual(t(key), key);
  const height = { type: 'edittext', text: '' };
  const dimensions = { children: [{ type: 'statictext', text: 'H:' }, height] };
  const items = [], name = { text: '' };
  let updates = 0, layouts = 0;
  const parent = control('panel');
  const window = { layout: { layout() { layouts++; } }, preferredSize: { height: 500 } };
  const view = ctx.criarInterfaceAlfabeto(parent, data, window, t,
    ctx.funcoesFiltragem, ctx.funcoes, items, () => updates++, name, dimensions);
  assert.equal(view.grupoAlfabeto.children.length, 2, 'main panel has only two rows');
  assert.ok(!descendants(view.grupoAlfabeto).some(c => c.posicao !== undefined), 'letters are only in the dialog');
  assert.equal(view.modeloAlfabeto.selection.index, 1);
  assert.equal(view.dropdownCorGeral.selection.text, 'or + blanc');
  assert.equal(view.botaoAdicionarPalavraChave.enabled, false);
  assert.equal(view.botaoPersonalizar.enabled, false);
  assert.deepEqual(view.tamanhoAlfabeto.items.map(item => item.text), ['1,40 m', '2,00 m']);
  const type = text => { view.campoPalavraChave.text = text; view.campoPalavraChave.onChanging(); };
  const choose = text => {
    const option = view.dropdownCorGeral.items.find(item => item.text === text);
    assert.ok(option, text); view.dropdownCorGeral.selection = option; view.dropdownCorGeral.onChange();
  };
  const edit = (action, general = false, cancel = false) => {
    dialogAction = dialog => {
      const controls = descendants(dialog);
      const check = color => {
        const c = controls.find(c => c.type === 'checkbox' && c.text === color);
        assert.ok(c, color); return c;
      };
      action({ controls, check, select(index) {
        const letters = controls.filter(c => c.type === 'button' && c.posicao !== undefined);
        while (index < letters[0].posicao) controls.find(c => c.text === '‹').onClick();
        while (index >= letters[0].posicao + 6) controls.find(c => c.text === '›').onClick();
        assert.equal(letters[index % 6].enabled, true);
        letters[index % 6].onClick();
      }, toggle(color) {
        const c = check(color); assert.equal(c.enabled, true, color);
        c.value = !c.value; c.onClick();
      }, inherit() { controls.find(c => c.text === t('alfabetoUsarCoresGerais')).onClick(); } });
      if (cancel) dialog.close(0);
      else controls.find(c => c.text === t('alfabetoAplicar')).onClick();
    };
    if (general) choose(t('alfabetoVariasCores'));
    else view.botaoPersonalizar.onClick();
    assert.equal(dialogAction, null, 'exactly one dialog opens');
  };
  const add = material => {
    const word = view.campoPalavraChave.text;
    view.botaoAdicionarPalavraChave.onClick();
    const item = items.at(-1);
    assert.equal(item.materialAlfabeto, material);
    assert.equal(name.text, word);
    assert.equal(height.text, item.tamanhoAlfabeto.replace(' m', '').replace(',', '.'));
    assert.equal(view.campoPalavraChave.text, '');
    assert.equal(view.botaoPersonalizar.enabled, false);
    assert.equal(view.botaoAdicionarPalavraChave.enabled, false);
    assert.ok(ctx.atualizarPreview({ itensLegenda: [item] }).texto.includes(`en ${material} ${item.corBioprint}`));
    return item;
  };

  // Ordinary flow: direct color selection, no dialog required.
  type('AA'); choose('rouge');
  assert.equal(view.dropdownCorGeral.selection.text, 'rouge');
  assert.equal(add('flexiprint').texto, 'GX214LW (A) flexiprint rouge 1,40 m: 2');
  choose('or + blanc');
  type('AAAB<3#ABCDEFGH');
  edit(({check,toggle,select,controls}) => {
    assert.ok(check('marron'), 'uses flexiprint catalog');
    assert.ok(!controls.some(c => c.text === 'gris'), 'excludes bioprint-only color');
    assert.equal(check('or').value, true); assert.equal(check('blanc').value, true);
    toggle('rouge'); select(1);
    assert.equal(check('rouge').value, false, 'second A independent');
    toggle('bleu foncé'); select(0); assert.equal(check('rouge').value, true);
    select(13); assert.equal(controls.find(c => c.text === '›').enabled, false);
    assert.equal(controls.filter(c => c.type === 'button' && c.posicao !== undefined)[2].enabled, false);
    select(0);
  });
  assert.equal(view.resumoCores.text, `2 ${t('alfabetoPersonalizadas')}`);
  // Cancel must discard every occurrence changed in the window.
  edit(({toggle,select}) => { toggle('or'); select(1); toggle('jaune'); }, false, true);
  edit(({check,select}) => { assert.equal(check('or').value, true); select(1); assert.equal(check('jaune').value, false); });
  // General color updates keep exceptions, including custom combinations.
  choose('vert foncé');
  edit(({check,select}) => { assert.equal(check('rouge').value, true); select(2); assert.equal(check('vert foncé').value, true); });
  edit(({toggle}) => toggle('jaune'), true);
  assert.equal(view.dropdownCorGeral.selection.text, 'vert foncé + jaune');
  edit(({toggle}) => toggle('noir'), true, true);
  assert.equal(view.dropdownCorGeral.selection.text, 'vert foncé + jaune', 'cancel restores dropdown');
  const saved = add('flexiprint');
  assert.deepEqual(Array.from(saved.coresPorPosicao[0]), ['or', 'blanc', 'rouge']);
  assert.deepEqual(Array.from(saved.coresPorPosicao[1]), ['or', 'blanc', 'bleu foncé']);
  assert.deepEqual(Array.from(saved.coresPorPosicao[2]), ['vert foncé', 'jaune']);

  // Text edits keep only the unchanged prefix; spaces do not shift occurrences.
  type('ABA');
  edit(({toggle}) => toggle('marron'));
  type('A B A C');
  edit(({check,inherit,select,toggle}) => {
    assert.equal(check('marron').value, true); inherit();
    assert.equal(check('marron').value, false); select(2); toggle('marron');
  });
  type('ABBC');
  edit(({check,select}) => { select(2); assert.equal(check('marron').value, false); });
  // 2D keeps its own material, palette and defaults.
  view.modeloAlfabeto.selection = 0; view.modeloAlfabeto.onChange();
  assert.equal(view.dropdownCorGeral.selection.text, 'or');
  edit(({check,toggle,select}) => {
    assert.ok(check('gris')); assert.equal(check('or').enabled, false, 'last color cannot be removed');
    toggle('rouge'); toggle('or'); select(1); assert.equal(check('rouge').value, false);
  });
  view.tamanhoAlfabeto.selection = 1;
  const twoD = add('bioprint');
  assert.ok(twoD.texto.includes('GX214LW (A) bioprint rouge 2,00 m: 1'));
  assert.ok(twoD.texto.includes('GX215LW (B) bioprint or 2,00 m: 2'));
  assert.equal(saved.coresPorPosicao[0][2], 'rouge', 'saved colors survive subsequent edits');
  assert.equal(updates, 3);
  type('123 !'); assert.equal(view.botaoAdicionarPalavraChave.enabled, false);
  assert.equal(layouts, 1, 'typing and dialogs never relayout the main window');
  assert.equal(window.preferredSize.height, 500, 'no manual height changes');

  // Legacy callers still accept a single color without a configuration.
  ctx.adicionarPalavraChaveAlfabeto({ text: 'B' }, { selection: { text: 'rouge' } }, view.tamanhoAlfabeto,
    dimensions, items, () => {}, name, t);
  assert.equal(items.at(-1).corBioprint, 'rouge');
  parent.remove = child => { parent.children.splice(parent.children.indexOf(child), 1); };
  ctx.removerInterfaceAlfabeto(view, window);
}

const special = ctx.processarAlfabeto('aa<3#', 'or et blanc', '2,00 m', {
  0: ['rouge', 'vert foncé', 'bleu foncé'], 1: ['bleu foncé', 'rouge', 'vert foncé'],
  2: ['rouge'], 3: ['noir'], 4: ['unused']
});
assert.equal(special.corBioprint, 'rouge et vert foncé et bleu foncé et noir');
assert.ok(special.referenciasTexto.includes('GX214LW (A) bioprint rouge et vert foncé et bleu foncé 2,00 m: 2'));
assert.ok(special.referenciasTexto.includes('GX240LW (<3) bioprint rouge 2,00 m: 1'));
assert.ok(special.referenciasTexto.includes('GX241LW (#) bioprint noir 2,00 m: 1'));
assert.equal(special.referenciasTexto.length, 3, 'same color sets aggregate even in a different order');
const repeatedHearts = ctx.processarAlfabeto('<3 A <3 # #', 'or', '1,40 m', {
  0: ['rouge'], 2: ['blanc'], 3: ['noir'], 4: ['bleu foncé']
});
assert.equal(repeatedHearts.referenciasTexto.length, 5);
assert.ok(repeatedHearts.referenciasTexto.includes('GX240LW (<3) bioprint rouge 1,40 m: 1'));
assert.ok(repeatedHearts.referenciasTexto.includes('GX240LW (<3) bioprint blanc 1,40 m: 1'));
assert.equal(ctx.processarAlfabeto('123 !', 'or', '1,40 m').referenciasTexto.length, 0);
const singleColor3D = ctx.processarAlfabeto('AA', 'or', '1,40 m', null, 'flexiprint');
assert.deepEqual(Array.from(singleColor3D.referenciasTexto), ['GX214LW (A) flexiprint or 1,40 m: 2']);
assert.equal(singleColor3D.materialAlfabeto, 'flexiprint', 'material is preserved even for a single color');
console.log('GX colors passed: independent repeated occurrences, quantity grouping, editing, inheritance, reset, preview and legacy calls.');
