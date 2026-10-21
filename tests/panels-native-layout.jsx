#target illustrator
#targetengine maintarget
// Run with DoJavaScriptFile. Rebuilds the main palette and closes it after testing;
// never creates or changes an Illustrator document or saved preferences.
(function() {
    var base = File($.fileName).parent.parent.fsName + "/";
    $.evalFile(new File(base + "script.jsx"));
    var w = $.global.janelaScript, nativeLayout = w.layout, results = [];
    var documentsBefore = app.documents.length, relayouts = 0;
    function assert(ok, message) { if (!ok) throw Error(message); }
    function controls(root) {
        var result = [];
        if (root.children) for (var i = 0; i < root.children.length; i++) {
            result.push(root.children[i]); result = result.concat(controls(root.children[i]));
        }
        return result;
    }
    function checkbox(key) {
        var list = controls(w), text = key === "gp" ? "Adicionar GP" : t(key);
        for (var i = 0; i < list.length; i++) if (list[i].type === "checkbox" && list[i].text === text) return list[i];
        throw Error("Missing checkbox: " + text);
    }
    try {
        w.layout = {
            layout: function(recalculate) {
                assert(!w.visible, "Visible-window relayout"); relayouts++;
                nativeLayout.layout(recalculate);
            },
            resize: function() { assert(!w.visible, "Visible-window resize"); nativeLayout.resize(); }
        };
        var initialSize = String(w.size), initialControls = controls(w).length;
        var keys = ["adicionarBolas", "adicionarObservacoes", "adicionarTexturas", "mostrarContarElementos",
            "adicionarComponenteExtra", "adicionarPVC", "gp", "criarGX"];
        for (var k = 0; k < keys.length; k++) {
            var c = checkbox(keys[k]), sizes = [];
            for (var cycle = 0; cycle < 3; cycle++) {
                c.value = true; c.onClick();
                assert(w.visible, keys[k] + ": visibility lost on add");
                assert(controls(w).length > initialControls, keys[k] + ": controls missing");
                if (keys[k] === "adicionarTexturas") {
                    var all = controls(w), textures;
                    for (var i = 0; i < all.length; i++) if (all[i].type === "listbox" && all[i].items.length > 1) textures = all[i];
                    var preview = textures.parent.parent.children[1];
                    for (var s = 1; s <= 2; s++) {
                        textures.selection = s; textures.onChange();
                        assert(w.visible && preview.children.length === 1 && preview.children[0].type === "image", "Texture preview missing");
                    }
                    textures.selection = 0; textures.onChange();
                    assert(preview.children.length === 0, "Texture preview did not clear");
                }
                sizes.push(String(w.size));
                c.value = false; c.onClick();
                assert(w.visible, keys[k] + ": visibility lost on remove");
                assert(controls(w).length === initialControls, keys[k] + ": controls leaked");
                assert(String(w.size) === initialSize, keys[k] + ": size drift " + String(w.size));
            }
            assert(sizes[0] === sizes[1] && sizes[1] === sizes[2], keys[k] + ": growing panel");
            results.push({panel: keys[k], cycles: 3, size: sizes[0]});
        }
        assert(app.documents.length === documentsBefore, "Documents changed");
        return JSON.stringify({illustrator: app.version, panels: results, hiddenRelayouts: relayouts,
            texturePreview: true, initialSize: initialSize, stableSize: true, noLeakedControls: true, documentsUnchanged: true});
    } catch (failure) {
        return "FAIL: " + failure.message + " at " + failure.line;
    } finally {
        w.layout = nativeLayout;
        w.close();
    }
})();
