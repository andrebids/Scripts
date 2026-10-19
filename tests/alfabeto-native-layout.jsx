#target illustrator
#targetengine codexGXNativeCheck
// Run with Illustrator's DoJavaScript/$.evalFile. Windows are constructed but never shown;
// the check neither creates nor changes an Illustrator document.
(function() {
    var base = File($.fileName).parent.parent.fsName + "/";
    $.evalFile(new File(base + "assets/json2.js"));
    $.evalFile(new File(base + "core/funcoes.jsx"));
    $.evalFile(new File(base + "modules/funcoesFiltragem.jsx"));
    $.evalFile(new File(base + "assets/translations.js"));
    function read(path) {
        var f = new File(base + path); f.encoding = "UTF-8";
        if (!f.open("r")) throw Error("Cannot read " + path);
        var text = f.read(); f.close(); return text;
    }
    function assert(ok, message) { if (!ok) throw Error(message); }
    var dados = JSON.parse(read("assets/database2.json"));
    var NativeWindow = $.global.Window, dialogs = [], nextDialog;
    var Window = function(type, title) {
        var dlg = new NativeWindow(type, title);
        dialogs.push(dlg);
        var show = function() { dlg.layout.layout(true); return nextDialog(dlg); };
        dlg.show = show;
        assert(dlg.show === show, "Cannot safely intercept the test dialog");
        return dlg;
    };
    // Direct eval keeps the test Window factory local to this isolated check.
    eval(read("modules/alfabeto.jsx"));
    function descendants(control) {
        var result = [];
        for (var i = 0; i < control.children.length; i++) {
            result.push(control.children[i]); result = result.concat(descendants(control.children[i]));
        }
        return result;
    }
    var tr = function(key) { return TRANSLATIONS["Português"][key] || key; };
    var win = new NativeWindow("palette", "GX native check");
    win.orientation = "column"; win.alignChildren = ["fill", "top"];
    var items = [], view, modalSize;
    try {
        view = criarInterfaceAlfabeto(win, dados, win, tr, $.global.funcoesFiltragem, $.global.funcoes,
            items, function(){}, {text:""}, {children:[]});
        var initial = view.grupoAlfabeto.size.height;
        var windowHeight = win.size.height, windowWidth = win.size.width;
        assert(initial <= 136, "Main panel exceeds the previous 136 px height: " + initial);
        assert(view.grupoAlfabeto.children.length === 2, "Main panel must only have two rows");
        function find(controls, type, text) {
            for (var i = 0; i < controls.length; i++) if (controls[i].type === type && controls[i].text === text) return controls[i];
            throw Error("Missing control: " + text);
        }
        function letter(controls, index) {
            for (var i = 0; i < controls.length; i++) if (controls[i].type === "button" && controls[i].posicao === index) return controls[i];
            throw Error("Missing occurrence: " + index);
        }
        function toggle(controls, color) {
            var check = find(controls, "checkbox", color);
            assert(check.enabled, "Color must be enabled: " + color);
            check.value = !check.value; check.onClick();
        }
        function fits(root) {
            if (!root.children) return;
            for (var i = 0; i < root.children.length; i++) {
                var child = root.children[i];
                if (!child.bounds) continue; // ListItems have no control bounds.
                assert(child.bounds.right <= root.size.width + 1, "Control overflows parent: " + child.text);
                assert(child.bounds.bottom <= root.size.height + 1, "Control exceeds height: " + child.text);
                fits(child);
            }
        }
        fits(view.grupoAlfabeto);
        view.campoPalavraChave.text = "AA NATAL EM NATAL AAAAAAAAAAAAAAAA";
        view.campoPalavraChave.onChanging();
        nextDialog = function(dlg) {
            modalSize = [dlg.size.width, dlg.size.height];
            fits(dlg);
            var controls = descendants(dlg);
            toggle(controls, "rouge");
            letter(controls, 1).onClick();
            assert(!find(controls, "checkbox", "rouge").value, "Second A changed with first A");
            toggle(controls, "bleu foncé");
            find(controls, "button", "›").onClick();
            assert(letter(controls, 6).enabled, "Pagination did not update the occurrences");
            return 1;
        };
        view.botaoPersonalizar.onClick();
        nextDialog = function(dlg) {
            var controls = descendants(dlg);
            toggle(controls, "noir"); letter(controls, 1).onClick(); toggle(controls, "jaune");
            return 0;
        };
        view.botaoPersonalizar.onClick();
        function choose(text) {
            for (var i = 0; i < view.dropdownCorGeral.items.length; i++) {
                if (view.dropdownCorGeral.items[i].text === text) {
                    view.dropdownCorGeral.selection = i; view.dropdownCorGeral.onChange(); return;
                }
            }
            throw Error("Missing general color: " + text);
        }
        nextDialog = function(dlg) { toggle(descendants(dlg), "vert foncé"); return 1; };
        choose(tr("alfabetoVariasCores"));
        assert(view.dropdownCorGeral.selection.text === "or + blanc + vert foncé", "General combination not applied");
        nextDialog = function(dlg) { toggle(descendants(dlg), "noir"); return 0; };
        choose(tr("alfabetoVariasCores"));
        assert(view.dropdownCorGeral.selection.text === "or + blanc + vert foncé", "Cancel did not restore general dropdown");
        choose("rouge");
        view.botaoAdicionarPalavraChave.onClick();
        assert(items[0].coresPorPosicao[0].join("|") === "or|blanc|rouge", "First A colors not saved or cancel leaked");
        assert(items[0].coresPorPosicao[1].join("|") === "or|blanc|bleu foncé", "Second A colors not saved or cancel leaked");
        assert(items[0].materialAlfabeto === "flexiprint", "Wrong 3D material");
        assert(items[0].coresPorPosicao[2].join("|") === "rouge", "Direct general color not applied");
        assert(view.grupoAlfabeto.size.height === initial, "Color dialog changed panel height");
        assert(win.size.height === windowHeight && win.size.width === windowWidth, "Main window size changed during editing");
        return JSON.stringify({illustrator:app.version, panelSize:[view.grupoAlfabeto.size.width, initial], rows:view.grupoAlfabeto.children.length,
            modalSize:modalSize, repeatedLettersIndependent:true, cancelDiscardsAll:true, generalColorsPreserveOverrides:true, stableMainWindow:true, controlsFit:true});
    } catch (failure) {
        return "FAIL: " + failure.message + " at " + failure.line + " / " + failure.stack;
    } finally {
        for (var i = 0; i < dialogs.length; i++) { try { dialogs[i].close(); } catch (cleanupDialog) {} }
        try { if (win) win.close(); } catch (cleanupWindow) {}
    }
})();
