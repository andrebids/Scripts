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

    // Função para verificar atualizações
    function verificarAtualizacoes() {
        alert("Iniciando verificação de atualizações...");
        var versaoAtual = lerVersao();
        alert("Versão atual: " + versaoAtual);
        var versaoGitHub = obterVersaoGitHub();
        alert("Versão do GitHub: " + versaoGitHub);

        if (!versaoGitHub) {
            alert("Não foi possível obter a versão do GitHub. Por favor, verifique sua conexão com a internet.");
            return false;
        }

        if (versaoGitHub !== versaoAtual) {
            var resposta = confirm("Nova versão disponível: " + versaoGitHub + ". Versão atual: " + versaoAtual + "\nDeseja atualizar agora?");
            if (resposta) {
                alert("Iniciando atualização dos arquivos...");
                if (atualizarArquivos()) {
                    alert("Atualização concluída. O script será fechado. Por favor, execute-o novamente.");
                    return true; // Indica que uma atualização foi realizada
                } else {
                    alert("Ocorreu um erro durante a atualização. O script continuará usando a versão atual.");
                }
            }
        } else {
            alert("O script já está na versão mais recente (" + versaoAtual + ").");
        }
        return false; // Indica que nenhuma atualização foi realizada
}

// Função para ler a versão do arquivo version.json
function lerVersao() {
    var caminhoVersao = File($.fileName).path + "/version.json";
    if (arquivoExiste(caminhoVersao)) {
        try {
            var dadosVersao = lerArquivoJSON(caminhoVersao);
            return dadosVersao.version || "Versão desconhecida";
        } catch (e) {
            alert("Erro ao ler o arquivo de versão: " + e.message);
            return "Erro na leitura";
        }
    } else {
        alert("Arquivo de versão não encontrado.");
        return "Arquivo não encontrado";
    }
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

// Adicione esta função à exportação global
$.global.funcoes.lerVersao = lerVersao;

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
    lerVersao: lerVersao
};

// Adicione estas funções no arquivo funcoes.jsx

// Função para obter a versão mais recente do GitHub
function obterVersaoGitHub() {
    var url = "https://raw.githubusercontent.com/andrebids/Scripts/main/version.json";
    var arquivo = new File(url);
    
    try {
        arquivo.open('r');
        var conteudo = arquivo.read();
        arquivo.close();
        
        var dadosVersao = JSON.parse(conteudo);
        return dadosVersao.version;
    } catch (e) {
        if (e instanceof SocketError) {
            alert("Erro de conexão ao verificar a versão: " + e.message + "\nVerifique sua conexão com a internet.");
        } else if (e instanceof Error) {
            alert("Erro ao obter a versão do GitHub: " + e.message);
        } else {
            alert("Erro desconhecido ao obter a versão do GitHub.");
        }
        return null;
    }
}

// Função para baixar um arquivo do GitHub
function baixarArquivoGitHub(nomeArquivo) {
    var url = "https://raw.githubusercontent.com/andrebids/Scripts/main/" + nomeArquivo;
    alert("Tentando baixar arquivo: " + url);
    var arquivo = new File(url);
    
    try {
        arquivo.open('r');
        var conteudo = arquivo.read();
        arquivo.close();
        alert("Arquivo baixado com sucesso: " + nomeArquivo);
        return conteudo;
    } catch (e) {
        if (e instanceof SocketError) {
            alert("Erro de conexão ao baixar o arquivo " + nomeArquivo + ": " + e.message + "\nVerifique sua conexão com a internet.");
        } else if (e instanceof Error) {
            alert("Erro ao baixar o arquivo " + nomeArquivo + ": " + e.message);
        } else {
            alert("Erro desconhecido ao baixar o arquivo " + nomeArquivo);
        }
        return null;
    }
}

// Função para atualizar os arquivos
function atualizarArquivos() {
    var arquivosParaAtualizar = ["script.jsx", "regras.jsx", "funcoes.jsx", "version.json"];
    var pastaScript = File($.fileName).path;

    for (var i = 0; i < arquivosParaAtualizar.length; i++) {
        var nomeArquivo = arquivosParaAtualizar[i];
        var conteudoNovo = baixarArquivoGitHub(nomeArquivo);
        
        if (conteudoNovo) {
            try {
                var arquivoLocal = new File(pastaScript + "/" + nomeArquivo);
                arquivoLocal.open('w');
                arquivoLocal.write(conteudoNovo);
                arquivoLocal.close();
            } catch (e) {
                if (e.name === "PermissionError") {
                    alert("Erro de permissão ao atualizar o arquivo " + nomeArquivo + ". Verifique se você tem permissões de escrita na pasta do script.");
                } else {
                    alert("Erro ao atualizar o arquivo " + nomeArquivo + ": " + e.message);
                }
                return false;
            }
        } else {
            return false;
        }
    }
    return true;
}

// Função para verificar e realizar a atualização
function verificarAtualizacoes() {
    alert("Iniciando verificação de atualizações...");
    var versaoAtual = lerVersao();
    alert("Versão atual: " + versaoAtual);
    var versaoGitHub = obterVersaoGitHub();
    alert("Versão do GitHub: " + versaoGitHub);

    if (!versaoGitHub) {
        alert("Não foi possível obter a versão do GitHub. Por favor, verifique sua conexão com a internet.");
        return false;
    }

    if (versaoGitHub !== versaoAtual) {
        var resposta = confirm("Nova versão disponível: " + versaoGitHub + ". Versão atual: " + versaoAtual + "\nDeseja atualizar agora?");
        if (resposta) {
            alert("Iniciando atualização dos arquivos...");
            if (atualizarArquivos()) {
                alert("Atualização concluída. O script será fechado. Por favor, execute-o novamente.");
                return true; // Indica que uma atualização foi realizada
            } else {
                alert("Ocorreu um erro durante a atualização. O script continuará usando a versão atual.");
            }
        }
    } else {
        alert("O script já está na versão mais recente (" + versaoAtual + ").");
    }
    return false; // Indica que nenhuma atualização foi realizada
}

// Atualize a exportação global
$.global.funcoes.verificarAtualizacoes = verificarAtualizacoes;