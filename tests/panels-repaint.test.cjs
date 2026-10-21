const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

function fixture(visible = true) {
  const ctx = { $: { global: {} }, t: key => key, logs: { TIPOS_LOG: {},
    adicionarLog(message) { if (/^Erro/.test(message)) throw Error(message); }
  } };
  vm.createContext(ctx);
  for (const path of ['core/funcoes.jsx', 'modules/funcoesFiltragem.jsx', 'modules/funcoesGP.jsx',
    'modules/alfabeto.jsx', 'ui/ui.jsx', 'ui/eventosUI.jsx']) {
    vm.runInContext(fs.readFileSync(path, 'utf8').replace(/^#.*$/gm, ''), ctx);
    Object.assign(ctx, ctx.$.global);
  }
  const window = { visible, preferredSize: { height: 890 },
    hide() { this.visible = false; }, show() { this.visible = true; },
    update() {}, layout: { layout() { assert.equal(window.visible, false, 'relayout while visible corrupts ScriptUI painting'); },
      resize() { assert.equal(window.visible, false); } } };
  function control(type, text) {
    let selected = null;
    const c = { type, text, items: [], children: [], preferredSize: {},
      graphics: { BrushType: {}, newBrush() {} }, layout: window.layout,
      add(type, bounds, text, options) {
        assert.equal(window.visible, false, 'hide before changing native controls');
        if (type === 'item' && text === undefined) text = bounds;
        const child = control(type, text); child.parent = this;
        if (type === 'item') { child.index = this.items.length; this.items.push(child); }
        else this.children.push(child);
        const items = Array.isArray(text) ? text : options?.items;
        if (items) items.forEach(label => child.add('item', undefined, label));
        return child;
      },
      remove(child) { assert.equal(window.visible, false); this.children.splice(this.children.indexOf(child), 1); },
      removeAll() { this.items = []; selected = null; }, addEventListener() {}
    };
    Object.defineProperty(c, 'selection', { get: () => selected,
      set: value => { selected = typeof value === 'number' ? c.items[value] : value; } });
    return c;
  }
  const config = { janela: window, t: ctx.t, dados: JSON.parse(fs.readFileSync('assets/database2.json', 'utf8')),
    itensLegenda: [], atualizarListaItens() {}, campoNomeTipo: { text: '' }, grupoDimensoes: { children: [] } };
  for (const key of ['grupoExtra', 'abaGeral', 'grupoTexturas', 'grupoContador']) config[key] = control('group');
  return { ctx, window, config };
}

for (const panel of ['Bolas', 'Obs', 'Texturas', 'Contar', 'ComponenteExtra', 'PVC', 'GP', 'Alfabeto']) {
  for (const visible of [true, false]) test(`${panel}: add/remove controls safely; initial visibility=${visible}`, () => {
    const { ctx, window, config } = fixture(visible);
    const checkbox = config['checkboxMostrar' + panel] = { value: false };
    ctx.eventosUI.configurarEventosCheckboxes(config);
    for (let cycle = 0; cycle < 2; cycle++) for (const value of [true, false]) {
      checkbox.value = value; checkbox.onClick();
      assert.equal(window.visible, visible, 'restore original visibility');
    }
    assert.equal(config.itensLegenda.length, 0, 'toggling panels must not insert items');
  });
}

test('safe repaint keeps callback context, arguments, result and visibility on nested calls/errors', () => {
  const { ctx, window } = fixture();
  const owner = { value: 7 };
  const nested = ctx.ui.protegerRedesenho(window, function(value) {
    assert.equal(window.visible, false); return this.value + value;
  });
  const callback = ctx.ui.protegerRedesenho(window, function(value) {
    const result = nested.call(this, value); assert.equal(window.visible, false); return result;
  });
  assert.equal(callback.call(owner, 3), 10); assert.equal(window.visible, true);
  assert.throws(ctx.ui.protegerRedesenho(window, () => { throw Error('probe'); }), /probe/);
  assert.equal(window.visible, true);
});
