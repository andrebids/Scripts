// funcoes.jsx
// Função para ler o arquivo JSON
function lerArquivoJSON(caminho) {
    var arquivo = new File(caminho);
    if (!arquivo.exists) {
        throw new Error("O arquivo não existe: " + caminho);
    }
    arquivo.open('r');
    var conteudo = arquivo.read();
    arquivo.close();
    try {
        return funcoes.parseJSON(conteudo);
    } catch (e) {
        throw new Error("Erro ao analisar o JSON: " + e.message);
    }
}
// Função para analisar JSON
function parseJSON(str) {
    try {
        return eval('(' + str + ')');
    } catch (e) {
        throw new Error("Erro ao analisar o JSON: " + e.message);
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
 // Função para verificar se o arquivo existe
 function arquivoExiste(caminho) {
    return new File(caminho).exists;
}

// Função para escrever no arquivo JSON
function escreverArquivoJSON(caminho, dados) {
    var arquivo = new File(caminho);
    arquivo.open('w');
    arquivo.write(stringifyJSON(dados));
    arquivo.close();
}

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
    lerArquivoJSON: lerArquivoJSON,
    selecionarArquivo: selecionarArquivo,
    getPastaDocumentos: getPastaDocumentos,
    arquivoExiste: arquivoExiste,
    escreverArquivoJSON: escreverArquivoJSON,
    isArray: isArray,
    extrairNomes: extrairNomes,
    encontrarPorId: encontrarPorId,
    arrayContains: arrayContains,
    encontrarIndicePorNome: encontrarIndicePorNome,
    lerVersao: lerVersao,
  
};


// Adicione estas funções no arquivo funcoes.jsx
function testeRequisicao() {
    var url = "https://raw.githubusercontent.com/andrebids/Scripts/main/version.json";
    var request = new XMLHttpRequest();
    
    alert("Iniciando teste de requisição para: " + url);
    
    try {
        request.open("GET", url, false);
        request.setRequestHeader("User-Agent", "ScriptUpdateAgent");
        
        alert("Enviando requisição de teste...");
        request.send();
        
        alert("Requisição de teste enviada. Status: " + request.status + "\nResposta: " + request.responseText);
        
        if (request.status === 200) {
            var conteudo = JSON.parse(request.responseText);
            alert("Versão obtida: " + conteudo.version + "\nURL de download: " + conteudo.downloadUrl);
        } else {
            alert("Erro na requisição. Status: " + request.status);
        }
    } catch (e) {
        alert("Erro no teste de requisição: " + e.message + "\nTipo de erro: " + e.name);
    }
}

$.global.funcoes.testeRequisicao = testeRequisicao;
