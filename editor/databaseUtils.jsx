/**
 * Utilitarios de dados usados pelo editor da base.
 */

function parseJSON(str) {
    try {
        return eval('(' + str + ')');
    } catch (e) {
        str = str.replace(/[\u0000-\u001F]+/g, "")
                 .replace(/,\s*}/g, "}")
                 .replace(/,\s*]/g, "]");
        return eval('(' + str + ')');
    }
}

function stringifyJSON(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    } else {
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (t == "string") v = '"' + v + '"';
            else if (t == "object" && v !== null) v = stringifyJSON(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}

function isArray(value) {
    return value && typeof value === 'object' && value.constructor === Array;
}

function filterArray(array, callback) {
    var filteredArray = [];
    for (var i = 0; i < array.length; i++) {
        if (callback(array[i], i, array)) {
            filteredArray.push(array[i]);
        }
    }
    return filteredArray;
}

function getNextId(array) {
    var maxId = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i].id > maxId) {
            maxId = array[i].id;
        }
    }
    return maxId + 1;
}

function findById(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id === id) {
            return array[i];
        }
    }
    return null;
}

function carregarJSON(arquivo) {
    var file = new File(arquivo);
    if (!file.exists) {
        throw new Error("O arquivo não existe: " + arquivo);
    }
    file.encoding = "UTF-8";
    file.open("r");
    var conteudo = file.read();
    file.close();

    if (conteudo === "") {
        throw new Error("O arquivo está vazio: " + arquivo);
    }
    try {
        var dados = parseJSON(conteudo);
        var secoes = ["componentes", "cores", "combinacoes", "acabamentos", "tamanhos", "bolas"];
        for (var i = 0; i < secoes.length; i++) {
            if (!dados.hasOwnProperty(secoes[i]) || !isArray(dados[secoes[i]])) {
                throw new Error("Seção '" + secoes[i] + "' ausente ou inválida");
            }
        }
        return dados;
    } catch (e) {
        throw new Error("Erro ao analisar o JSON: " + e.message);
    }
}

function salvarJSON(arquivo, dados) {
    try {
        var arquivoDados = new File(arquivo);
        arquivoDados.encoding = "UTF-8";
        arquivoDados.open('w');
        var conteudo = stringifyJSON(dados);
        arquivoDados.write(conteudo);
        arquivoDados.close();
        $.writeln("Arquivo salvo com sucesso: " + arquivoDados.fsName);
    } catch (e) {
        alert("Erro ao salvar o arquivo: " + e.toString());
        $.writeln("Erro ao salvar o arquivo: " + e.toString());
    }
}

function normalizarDatabaseEditor(database) {
    if (typeof database !== 'object' || database === null) {
        throw new Error("Estrutura de dados inválida");
    }

    if (!isArray(database.componentes)) database.componentes = [];
    if (!isArray(database.cores)) database.cores = [];
    if (!isArray(database.combinacoes)) database.combinacoes = [];
    if (!isArray(database.acabamentos)) database.acabamentos = [];
    if (!isArray(database.tamanhos)) database.tamanhos = [];
    if (!isArray(database.bolas)) database.bolas = [];

    for (var i = 0; i < database.componentes.length; i++) {
        if (!database.componentes[i].hasOwnProperty('referencia')) {
            database.componentes[i].referencia = "";
        }
    }

    return database;
}
