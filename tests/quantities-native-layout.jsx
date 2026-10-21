#target illustrator
#targetengine codexQuantitiesNativeCheck
// Real ScriptUI controls and changing events; no Illustrator documents are touched.
(function() {
    var base = File($.fileName).parent.parent.fsName + "/";
    $.evalFile(new File(base + "assets/json2.js"));
    $.evalFile(new File(base + "core/funcoes.jsx"));
    $.evalFile(new File(base + "ui/ui.jsx"));
    function assert(ok, message) { if (!ok) throw Error(message); }
    function read(path) { var f = new File(base + path); f.encoding = "UTF-8"; f.open("r"); var s = f.read(); f.close(); return s; }
    function descendants(root) {
        var out = [];
        if (root.children) for (var i = 0; i < root.children.length; i++) { out.push(root.children[i]); out = out.concat(descendants(root.children[i])); }
        return out;
    }
    function find(root, type, text) {
        var all = descendants(root);
        for (var i = 0; i < all.length; i++) if (all[i].type === type && (text === undefined || all[i].text === text)) return all[i];
        throw Error("Missing control " + type + ": " + text);
    }
    var NativeWindow = $.global.Window, windows = [], q, w;
    var Window = function(type, title) { var win = new NativeWindow(type, title); windows.push(win); q = win; return win; };
    eval(read("ui/componentRows.jsx"));
    function guard(win) {
        var nativeLayout = win.layout;
        win.layout = {
            layout: function(recalculate) { assert(!win.visible, "Visible relayout: " + win.text); nativeLayout.layout(recalculate); },
            resize: function() { assert(!win.visible, "Visible resize: " + win.text); nativeLayout.resize(); }
        };
    }
    function enter(field, text) {
        field.text = text;
        var event = ScriptUI.events.createEvent("UIEvent");
        event.initEvent("changing", true, true); field.dispatchEvent(event);
    }
    try {
        w = new NativeWindow("palette", "Quantity repaint check");
        w.orientation = "column";
        var row = criarLinhaGrupoComponentes(w, "LEDS", [], {t: function(key) { return key; }, dados: {cores: []}, janela: w, funcoes: $.global.funcoes});
        w.show(); guard(w);
        find(w, "button", "").onClick(); guard(q);
        var first = find(q, "edittext"); first.active = true;
        enter(first, "1"); enter(first, "12"); enter(first, "123"); enter(first, "1234");
        assert(first.text === "1234", "Input text changed");
        assert(first.active, "Typing lost focus after adding a row");
        assert(find(q, "statictext", "TOTAL: 1234"), "Wrong live total");
        var rows = first.parent.parent;
        assert(rows.children.length === 2, "Missing automatically added blank row");
        enter(rows.children[1].children[0], "6");
        assert(rows.children.length === 3, "Second value did not add a row");
        rows.children[0].children[2].onClick();
        assert(find(q, "statictext", "TOTAL: 6"), "Remove did not update total");
        find(q, "button", "OK").onClick();
        assert(row.camposQuantidade[0].text === "6", "OK did not apply the total");
        find(w, "button", "").onClick(); guard(q);
        enter(find(q, "edittext"), "99");
        find(q, "button", "Cancelar").onClick();
        assert(row.camposQuantidade[0].text === "6", "Cancel changed main quantity");
        return JSON.stringify({illustrator: app.version, nativeChangingEvents: true, stableFocus: true,
            automaticRows: true, liveTotal: true, removal: true, apply: true, cancel: true, hiddenRelayouts: true});
    } catch (failure) {
        return "FAIL: " + failure.message + " at " + failure.line;
    } finally {
        for (var i = 0; i < windows.length; i++) try { windows[i].close(); } catch (ignore) {}
        if (w) w.close();
    }
})();
