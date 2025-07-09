// funcoes.jsx
// Função lerArquivoJSON movida para database.jsx
// Função para analisar JSON
function parseJSON(str) {
    if (!str || typeof str !== 'string') {
        return {};  // Retorna objeto vazio em vez de lançar erro
    }
    
    try {
        var resultado = eval('(' + str + ')');
        return resultado || {};  // Se resultado for null/undefined, retorna objeto vazio
    } catch (e) {
        $.writeln("Erro ao analisar JSON: " + e.message);
        return {};  // Retorna objeto vazio em caso de erro
    }
}
function apenasNumerosEVirgula(campo) {
    campo.addEventListener('keydown', function(e) {
        var charCode = e.keyCode;
        if (charCode != 188 && charCode != 190 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            e.preventDefault();
        }
    });
}
// Função para serializar JSON
function stringifyJSON(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        if (t == "string") obj = '"' + obj.replace(/"/g, '\\"') + '"';
        return String(obj);
    } else {
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (t == "string") v = '"' + v.replace(/"/g, '\\"') + '"';
            else if (t == "object" && v !== null) v = stringifyJSON(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}
    // Função para selecionar o arquivo da base de dados
    function selecionarArquivo() {
        var arquivo = File.openDialog("Selecione o arquivo da base de dados", "*.json");
        if (arquivo) {
            return arquivo.fsName.replace(/\\/g, '/'); // Substitui \ por /
        }
        return null;
    }

    // Função para obter o caminho da pasta Documentos
    function getPastaDocumentos() {
        return Folder.myDocuments.fsName;
    }
 // Função arquivoExiste movida para database.jsx

// Função escreverArquivoJSON movida para database.jsx

// Funo para verificar se um objeto é um array
function isArray(obj) {
    return obj && typeof obj === 'object' && obj.constructor === Array;
}

// Função para extrair nomes de um array de objetos
function extrairNomes(array) {
    var nomes = [];
    for (var i = 0; i < array.length; i++) {
        nomes.push(array[i].nome);
    }
    return nomes;
}

// Funço auxiliar para encontrar um item em um array por id
function encontrarPorId(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id === id) {
            return array[i];
        }
    }
    return null;
}

// Funo auxiliar para verificar se um elemento está em um array
function arrayContains(array, element) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === element) {
            return true;
        }
    }
    return false;
}

// Função para encontrar o índice de um item em um array de objetos por nome
function encontrarIndicePorNome(array, nome) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].nome === nome) {
            return i;
        }
    }
    return -1;
}

// Função para remover duplicatas de um array
function removerDuplicatas(array) {
    var resultado = [];
    var jaVisto = {};
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        if (!jaVisto[item]) {
            resultado.push(item);
            jaVisto[item] = true;
        }
    }
    return resultado;
}

// Função para formatar unidades
function formatarUnidade(unidade) {
    if (unidade === "m2") {
        return "m²";
    }
    return unidade;
}

// Função para arredondar para décima
function arredondarParaDecima(valor) {
    return Math.ceil(valor * 10) / 10;
}

// Função para arredondar componente baseado no tipo
function arredondarComponente(valor, unidade, nome) {
    var nomeLowerCase = nome.toLowerCase();
    if (nomeLowerCase.indexOf("fil lumière") !== -1 || 
        nomeLowerCase.indexOf("fil lumiére") !== -1 || 
        nomeLowerCase.indexOf("fil comète") !== -1 || 
        nomeLowerCase.indexOf("fil cométe") !== -1) {
        // Arredondar para o próximo metro inteiro
        return Math.ceil(valor);
    } else if (unidade === "ml" || unidade === "m2") {
        // Arredondar para o próximo 0,05
        return Math.ceil(valor * 20) / 20;
    }
    // Para outras unidades, retornar o valor original
    return valor;
}

// Função auxiliar para extrair informações do componente
function extrairInfoComponente(texto) {
    var info = {
        componente: '',
        cor: '',
        unidade: ''
    };
    
    // Extrair componente base (ex: flexiprint)
    var pos = texto.indexOf(' ');
    info.componente = pos === -1 ? texto : texto.substring(0, pos).toLowerCase();
    
    // Extrair cor (ex: or PANTONE 131C, blanc RAL 9010)
    var matches = texto.match(/(or|blanc|noir|rouge|bleu|vert|jaune|PANTONE|RAL)\s+[^\(]+/i);
    info.cor = matches ? matches[0].toLowerCase() : '';
    
    // Extrair unidade (m², ml, units)
    matches = texto.match(/\((m2|ml|units)\)/i);
    info.unidade = matches ? matches[1].toLowerCase() : '';
    
    return info;
}

// Função para encontrar índice no array
function encontrarIndice(array, valor) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === valor) {
            return i;
        }
    }
    return -1;
}

// Função para ler a versão do arquivo version.json
function lerVersao() {
    var arquivoVersao = new File(File($.fileName).path + "/version.json");
    if (arquivoVersao.exists) {
        arquivoVersao.open('r');
        var conteudo = arquivoVersao.read();
        arquivoVersao.close();
        try {
            var dadosVersao = parseJSON(conteudo);
            return dadosVersao.version;
        } catch (e) {
            alert("Erro ao ler o arquivo de versão: " + e.message);
        }
    }
    return "0.0.0"; // Versão padrão se não for possível ler o arquivo
}

        // Função para formatar as dimensões com duas casas decimais
        function formatarDimensao(valor) {
            if (valor === "") return "";
            var numero = parseFloat(valor.replace(',', '.'));
            if (isNaN(numero)) return "";
    return numero.toFixed(2).replace('.', ',') + " m";
}

            // Função para escapar strings
            function escapeString(str) {
                return str.replace(/\\/g, '\\\\')
                          .replace(/'/g, "\\'")
                          .replace(/\n/g, '\\n')
                          .replace(/\r/g, '\\r');
            }

// Certifique-se de que esta linha está presente no final do arquivo funcoes.jsx
$.global.funcoes = $.global.funcoes || {};
$.global.funcoes.lerVersao = lerVersao;
$.global.funcoes.parseJSON = parseJSON;

// Exportar as funções para uso em outros scripts
$.global.funcoes = {
    parseJSON: parseJSON,
    stringifyJSON: stringifyJSON,
    selecionarArquivo: selecionarArquivo,
    getPastaDocumentos: getPastaDocumentos,
    isArray: isArray,
    extrairNomes: extrairNomes,
    encontrarPorId: encontrarPorId,
    arrayContains: arrayContains,
    encontrarIndicePorNome: encontrarIndicePorNome,
    removerDuplicatas: removerDuplicatas,
    formatarUnidade: formatarUnidade,
    arredondarParaDecima: arredondarParaDecima,
    arredondarComponente: arredondarComponente,
    extrairInfoComponente: extrairInfoComponente,
    encontrarIndice: encontrarIndice,
    lerVersao: lerVersao,
    apenasNumerosEVirgula: apenasNumerosEVirgula,
    formatarDimensao: formatarDimensao,
    escapeString: escapeString
};

// Adicione estas funções no arquivo funcoes.jsx
function testeRequisicao() {
    var url = "https://raw.githubusercontent.com/andrebids/Scripts/main/version.json";
    var request = new XMLHttpRequest();
    
    try {
        request.open("GET", url, false);
        request.send();
        
        if (request.status === 200) {
            var response = parseJSON(request.responseText);
            return response.version;
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

// Função para limpar recursos
function limparRecursos() {
    // Limpar variáveis globais se necessário
    if (typeof itensLegenda !== 'undefined') {
        itensLegenda = [];
    }
}

// Função para criar interface extra
function criarInterfaceExtra(janela) {
    // Implementação da interface extra
    var grupoExtra = janela.add("panel", undefined, "Extra");
    grupoExtra.orientation = "column";
    grupoExtra.alignChildren = ["fill", "top"];
    grupoExtra.spacing = 5;
    
    return grupoExtra;
}