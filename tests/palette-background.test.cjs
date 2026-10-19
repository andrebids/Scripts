const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let palette;
const ctx = { $: { global: {} }, t: key => key, Window: function(type) {
  assert.equal(type, 'palette');
  palette = { graphics: { BrushType: { SOLID_COLOR: 0 }, newBrush(type, color) { return { type, color }; } } };
  return palette;
} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('core/bootstrap.jsx', 'utf8'), ctx);
ctx.$.global.bootstrap.criarJanelaPrincipal();
const brush = palette.graphics.backgroundColor;
assert.ok(brush, 'main palette needs an explicit background; relying on the native default leaves the outer frame black');
assert.equal(brush.color[3], 1, 'the background must be opaque');
assert.ok(brush.color.slice(0, 3).every(channel => channel > 0), 'the background must not be black');
console.log('Main palette has an explicit opaque gray background.');