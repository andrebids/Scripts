#target illustrator
// Run via Illustrator DoJavaScriptFile, then read %TEMP%/legenda-bridge-native-result.json.
// Uses a disposable document and the real BridgeTalk transport, preserving open documents.
(function() {
    var base = File($.fileName).parent.parent.fsName + "/";
    function read(path) {
        var f = new File(base + path); f.encoding = "UTF-8";
        if (!f.open("r")) throw Error("Cannot read " + path);
        var text = f.read(); f.close(); return text;
    }
    $.evalFile(new File(base + "assets/json2.js"));
    var NativeBridgeTalk = $.global.BridgeTalk, originalBridge = $.global.bridge;
    var message, alerts = [];
    var logs = {TIPOS_LOG: {}, adicionarLog: function() {}};
    var ui = {mostrarAlertaPersonalizado: function(text) { alerts.push(text); }};
    var BridgeTalk = function() { this.send = function() { message = this.body; }; };
    var designer = "André Garcia";
    var text = 'Logo L1: décor "teste", posé au sol, 2D en bioprint orange.\nComposants: São José, œ € — 1.25\nObs: %20 %E7 \\ "aspas"';
    try {
        eval(read("infrastructure/bridge.jsx"));
        adicionarLegendaViaBridge(designer, text, "", "", "", function() {}, null, base, function() {});
    } finally { $.global.bridge = originalBridge; }
    if (!message || alerts.length) throw Error("Cannot prepare native transport test: " + alerts.join("; "));
    var resultFile = new File(Folder.temp.fsName + "/legenda-bridge-native-result.json");
    if (resultFile.exists) resultFile.remove();
    function writeResult(value) {
        resultFile.encoding = "UTF-8";
        if (!resultFile.open("w")) throw Error("Cannot write native test result");
        resultFile.write(value); resultFile.close();
        $.global.codexLegendaNativeTransport = null;
    }
    // ASCII wrapper has no backslash escapes. The production body travels unmodified.
    var payload = "(function(){var before=app.documents.length?app.activeDocument:null,doc=app.documents.add();try{var result=" + message +
        "var contents=doc.textFrames[0].contents;var codes=[];for(var i=0;i<contents.length;i++)codes.push(contents.charCodeAt(i));" +
        "return codes.join(',');}finally{doc.close(SaveOptions.DONOTSAVECHANGES);if(before)before.activate();}})();";
    var bt = new NativeBridgeTalk();
    $.global.codexLegendaNativeTransport = bt;
    bt.target = "illustrator";
    bt.body = payload;
    bt.onResult = function(result) {
        var codes = result.body.split(","), contents = "";
        for (var i = 0; i < codes.length; i++) contents += String.fromCharCode(Number(codes[i]));
        // Illustrator paragraph breaks are CR; compare the actual saved text.
        var normalized = contents.replace(/\r\n?/g, "\n");
        var expected = "Bids - " + designer + "\n" + text;
        var ok = normalized === expected || normalized === expected + "\n";
        writeResult(JSON.stringify({ok: ok, illustrator: app.version, actual: normalized, expected: expected}));
    };
    bt.onError = function(error) { writeResult(JSON.stringify({ok: false, error: error.body})); };
    if (!bt.send()) throw Error("BridgeTalk refused the native transport test");
    return "Queued native transport test: " + resultFile.fsName;
})();
