// funcoes.jsx
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

// Função para verificar se um objeto é um array
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
    var arquivoVersao = new File(File($.fileName).path + "/assets/version.json");
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

// Função para sanitizar observações usando encode hexadecimal e decodeURI
// Corrigida para garantir que caracteres especiais apareçam corretamente na legenda
function sanitizarObservacao(texto) {
    if (!texto || typeof texto !== 'string') {
        return "";
    }
    try {
        var textoSanitizado = "";
        for (var i = 0; i < texto.length; i++) {
            var c = texto.charAt(i);
            if (c === '\r') {
                textoSanitizado += "%0d";
            } else if (c === '\n') {
                textoSanitizado += "%0a";
            } else if (c === '\t') {
                textoSanitizado += "%09";
            } else if (c === '"') {
                textoSanitizado += "%22";
            } else if (c === "'") {
                textoSanitizado += "%27";
            } else if (c === '\\') {
                textoSanitizado += "%5c";
            } else if (c === '<') {
                textoSanitizado += "%3c";
            } else if (c === '>') {
                textoSanitizado += "%3e";
            } else if (c === '&') {
                textoSanitizado += "%26";
            } else if (c === '%') {
                textoSanitizado += "%25";
            } else {
                textoSanitizado += c;
            }
        }
        return decodeURI(textoSanitizado);
    } catch (e) {
        return texto.replace(/[\r\n\t"\\<>%]/g, '');
    }
}

// Função para escapar aspas duplas e barras invertidas para uso seguro em scripts
function escaparParaScript(texto) {
    if (!texto || typeof texto !== 'string') {
        return "";
    }
    // Primeiro, sanitiza normalmente
    var limpo = sanitizarObservacao(texto);
    // Agora, escapa barra invertida e aspas duplas
    limpo = limpo.replace(/\\/g, "\\\\"); // barra invertida
    limpo = limpo.replace(/"/g, "\\\"");  // aspas duplas
    return limpo;
}

// Função para garantir string segura para uso em scripts (usando JSON.stringify do json2.js)
function stringSeguraParaScript(texto) {
    if (!texto || typeof texto !== 'string') {
        return '""';
    }
    return JSON.stringify(texto);
}

// Função para codificar observações em formato seguro (%xx para caracteres especiais)
function encodeObservacao(texto) {
    if (!texto || typeof texto !== 'string') {
        return "";
    }
    var resultado = "";
    for (var i = 0; i < texto.length; i++) {
        var c = texto.charAt(i);
        var code = texto.charCodeAt(i);
        // Codifica tudo que não for letra, número ou espaço
        if (
            (code >= 48 && code <= 57) || // 0-9
            (code >= 65 && code <= 90) || // A-Z
            (code >= 97 && code <= 122) || // a-z
            c === " "
        ) {
            resultado += c;
        } else {
            var hex = code.toString(16).toUpperCase();
            if (hex.length < 2) hex = "0" + hex;
            resultado += "%" + hex;
        }
    }
    return resultado;
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
    escapeString: escapeString,
    criarTextoComponente: criarTextoComponente,
    criarLinhaReferencia: criarLinhaReferencia,
    selecionarUnidadeMetrica: selecionarUnidadeMetrica,
    atualizarCores: atualizarCores,
    sanitizarObservacao: sanitizarObservacao,
    escaparParaScript: escaparParaScript,
    stringSeguraParaScript: stringSeguraParaScript,
    encodeObservacao: encodeObservacao
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

function contarBolasNaArtboard() {
    try {
        var caminhoBaseDadosHardcoded = "//192.168.2.22/Olimpo/DS/_BASE DE DADOS/07. TOOLS/ILLUSTRATOR/basededados/database2.json";
        function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
        var dados = database.carregarDadosBase(caminhoBaseDadosHardcoded);
        if (!dados || !isArray(dados.cores)) {
            throw 'Os dados da base de cores não são um array ou a propriedade "cores" está ausente.';
        }
        var dadosCores = dados.cores;
        if (app.documents.length === 0) {
            throw "Nenhum documento aberto. Por favor, abra um documento no Illustrator.";
        }
        var doc = app.activeDocument;
        if (!doc) {
            throw "Não foi possível acessar o documento ativo.";
        }
        var selecao = doc.selection;
        if (!selecao || selecao.length === 0) {
            return "contagem:0|combinacoes:Nenhum objeto selecionado";
        }
        var contagem = 0;
        var combinacoes = {};
        for (var i = 0; i < selecao.length; i++) {
            var item = selecao[i];
            if (item.typename === "PathItem" && item.closed && item.filled) {
                contagem++;
                var cor = item.fillColor;
                var corKey = "";
                if (cor.typename === "CMYKColor") {
                    var cmykArray = [
                        Math.round(cor.cyan),
                        Math.round(cor.magenta),
                        Math.round(cor.yellow),
                        Math.round(cor.black)
                    ];
                    var nomeCor = database.getNomeCor(cmykArray, dadosCores);
                    if (nomeCor) {
                        corKey = nomeCor;
                    } else {
                        corKey = "CMYK:" + database.cmykToString(cor);
                    }
                } else if (cor.typename === "SpotColor") {
                    var spotColor = cor.spot.color;
                    if (spotColor.typename === "CMYKColor") {
                        var spotCmykArray = [
                            Math.round(spotColor.cyan),
                            Math.round(spotColor.magenta),
                            Math.round(spotColor.yellow),
                            Math.round(spotColor.black)
                        ];
                        var nomeSpotCor = database.getNomeCor(spotCmykArray, dadosCores);
                        if (nomeSpotCor) {
                            corKey = nomeSpotCor;
                        } else {
                            corKey = "Spot CMYK:" + database.cmykToString(spotColor);
                        }
                    } else {
                        corKey = "Spot:" + cor.spot.name;
                    }
                } else {
                    corKey = cor.typename;
                }
                var tamanhoPx = Math.round(item.width);
                var tamanhoM = tamanhoPx * 0.009285714285714286;
                var tamanhoMKey = tamanhoM.toFixed(3);
                var combinacaoKey = corKey + "|" + tamanhoMKey;
                if (!combinacoes[combinacaoKey]) {
                    combinacoes[combinacaoKey] = {
                        cor: corKey,
                        tamanho: tamanhoMKey,
                        quantidade: 1
                    };
                } else {
                    combinacoes[combinacaoKey].quantidade++;
                }
            }
        }
        var resultado = "contagem:" + contagem + "|";
        resultado += "combinacoes:";
        var combinacoesArray = [];
        var textoBoule = contagem === 1 ? "boule" : "boules";
        combinacoesArray.push("Total de " + contagem + " " + textoBoule + " :");
        for (var key in combinacoes) {
            if (combinacoes.hasOwnProperty(key)) {
                var comb = combinacoes[key];
                combinacoesArray.push(encodeURIComponent(comb.cor) + "=" + comb.tamanho + "=" + comb.quantidade);
            }
        }
        resultado += combinacoesArray.join(",");
        return resultado;
    } catch (e) {
        return "contagem:0|combinacoes:Erro: " + (e.message || "Erro desconhecido");
    }
}

// Função para criar o texto do componente (migrada de script.jsx)
function criarTextoComponente(nome, referencia, unidade, quantidade, multiplicador) {
    var texto = nome;
    if (referencia) {
        texto += " (Ref: " + referencia + ")";
    }
    texto += " (" + funcoes.formatarUnidade(unidade) + ")";
    
    quantidade = funcoes.arredondarComponente(quantidade, unidade, nome);
    
    var quantidadeFormatada = quantidade.toFixed(2).replace('.', ',');
    if (multiplicador > 1) {
        texto += " " + quantidadeFormatada + "x" + multiplicador + ": ";
        var quantidadeTotal = quantidade * multiplicador;
        texto += quantidadeTotal.toFixed(2).replace('.', ',');
    } else {
        texto += ": " + quantidadeFormatada;
    }
    
    return texto;
}

// Função para criar a linha de referência (migrada de script.jsx)
function criarLinhaReferencia(item) {
    var linha = item.referencia ? item.referencia : item.nome;
    if (item.unidade) {
        linha += " (" + funcoes.formatarUnidade(item.unidade) + ")";
    }
    
    var quantidade = funcoes.arredondarComponente(item.quantidade, item.unidade, item.nome);
    
    var quantidadeFormatada;
    if (item.unidade === "units") {
        quantidadeFormatada = Math.round(quantidade).toString();
    } else {
        quantidadeFormatada = quantidade.toFixed(2).replace('.', ',');
    }
    
    if (item.multiplicador && item.multiplicador > 1) {
        linha += " " + quantidadeFormatada + "x" + item.multiplicador + ": ";
        var quantidadeTotal = quantidade * item.multiplicador;
        var quantidadeTotalFormatada;
        if (item.unidade === "units") {
            quantidadeTotalFormatada = Math.round(quantidadeTotal).toString();
        } else {
            quantidadeTotalFormatada = quantidadeTotal.toFixed(2).replace('.', ',');
        }
        linha += quantidadeTotalFormatada;
    } else {
        linha += ": " + quantidadeFormatada;
    }
    
    if (item.composta) {
        linha += " (composta)";
    }
    return linha;
}

// Função para selecionar unidade métrica (migrada de script.jsx)
function selecionarUnidadeMetrica(unidades) {
    var prioridade = ["m2", "ml", "unit"];
    if (unidades.length === 2 && unidades[1] === "unit") {
        return "unit";
    }
    for (var i = 0; i < prioridade.length; i++) {
        if (arrayContains(unidades, prioridade[i])) {
            return prioridade[i];
        }
    }
    return null;
}

// Função para atualizar cores (migrada de script.jsx)
function atualizarCores(listaComponentes, listaCores, listaUnidades, dados, t, verificarCMYK) {
    listaCores.removeAll();
    
    if (listaComponentes.selection && listaComponentes.selection.index > 0) {
        var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
        var coresDisponiveis = [t("selecioneCor")];
        var coresIds = [];

        for (var i = 0; i < dados.combinacoes.length; i++) {
            if (dados.combinacoes[i].componenteId === componenteSelecionado.id) {
                var cor = encontrarPorId(dados.cores, dados.combinacoes[i].corId);
                if (cor && !arrayContains(coresIds, cor.id)) {
                    coresDisponiveis.push(cor.nome);
                    coresIds.push(cor.id);
                }
            }
        }

        for (var i = 0; i < coresDisponiveis.length; i++) {
            listaCores.add("item", coresDisponiveis[i]);
        }
        listaCores.selection = 0;

        // Pré-selecionar a cor se houver apenas uma opção
        if (coresDisponiveis.length === 2) {
            listaCores.selection = 1;
        } else {
            listaCores.selection = 0;
        }

    } else {
        listaCores.add("item", t("selecioneCor"));
        listaCores.selection = 0;
    }
    
    // Chamar atualizarUnidades() para atualizar as unidades com base na cor selecionada
    if (typeof funcoesComponentes !== 'undefined' && funcoesComponentes && funcoesComponentes.atualizarUnidades) {
        funcoesComponentes.atualizarUnidades(listaComponentes, listaCores, listaUnidades, dados, selecionarUnidadeMetrica, arrayContains);
    }
    
    // Verificar o CMYK da combinação selecionada (sem exibir alerta)
    if (verificarCMYK && typeof verificarCMYK === 'function') {
        verificarCMYK();
    }
}