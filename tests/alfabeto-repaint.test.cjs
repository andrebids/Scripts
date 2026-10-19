const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function run(visible, failure) {
  const events = [];
  const window = { visible, hide() { events.push('hide'); this.visible = false; },
    show() { events.push('show'); this.visible = true; },
    layout: { layout() { assert.equal(window.visible, false, 'GX relayout must happen while hidden'); events.push('layout'); },
      resize() { assert.equal(window.visible, false); events.push('resize'); } } };
  const ctx = { $: { global: {} }, logs: {}, funcoes: {}, funcoesFiltragem: {},
    alfabeto: {
      criarInterfaceAlfabeto() {
        assert.equal(window.visible, false, 'hide before builder relayout/update');
        events.push('create');
        if (failure === 'create') throw Error('create failed');
        return { group: true };
      },
      removerInterfaceAlfabeto() {
        assert.equal(window.visible, false, 'hide before removing controls');
        events.push('remove');
        if (failure === 'remove') throw Error('remove failed');
      }
    } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync('ui/eventosUI.jsx', 'utf8').replace(/^#.*$/gm, ''), ctx);
  const config = { janela: window, checkboxMostrarAlfabeto: { value: true } };
  ctx.$.global.eventosUI.configurarEventosCheckboxes(config);
  if (failure === 'create') assert.throws(() => config.checkboxMostrarAlfabeto.onClick(), /create failed/);
  else {
    config.checkboxMostrarAlfabeto.onClick();
    assert.ok(config.componentesAlfabeto);
    config.checkboxMostrarAlfabeto.value = false;
    if (failure) assert.throws(() => config.checkboxMostrarAlfabeto.onClick(), /remove failed/);
    else { config.checkboxMostrarAlfabeto.onClick(); assert.equal(config.componentesAlfabeto, null); }
  }
  assert.equal(window.visible, visible, 'restore visibility even on failure');
  if (!visible) assert.ok(!events.includes('show'), 'do not show an originally hidden palette');
  return events;
}
assert.deepEqual(run(true), ['hide','create','layout','resize','show','hide','remove','layout','resize','show']);
run(false);
run(true, 'create');
run(true, 'remove');
console.log('GX repaint ordering passed: hidden mutations/layout, visibility restoration and failure paths.');
