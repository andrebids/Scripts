// database.jsx - Módulo de manipulação de dados e banco de dados

// Função para ler o arquivo JSON
function lerArquivoJSON(caminho) {
    var arquivo = new File(caminho);
    if (!arquivo.exists) {
        if (typeof logs !== 'undefined' && logs.logArquivo) {
            logs.logArquivo("Leitura", caminho, false, "arquivo não existe");
        }
        throw new Error("O arquivo não existe: " + caminho);
    }
    
    try {
        arquivo.open('r');
        var conteudo = arquivo.read();
        arquivo.close();
        
        var resultado = funcoes.parseJSON(conteudo);
        if (typeof logs !== 'undefined' && logs.logArquivo) {
            logs.logArquivo("Leitura", caminho, true, conteudo.length + " chars");
        }
        return resultado;
    } catch (e) {
        if (typeof logs !== 'undefined' && logs.logArquivo) {
            logs.logArquivo("Leitura", caminho, false, "erro JSON: " + e.message);
        }
        throw new Error("Erro ao analisar o JSON: " + e.message);
    }
}

// Função para escrever no arquivo JSON
function escreverArquivoJSON(caminho, dados) {
    try {
        var arquivo = new File(caminho);
        arquivo.open('w');
        var jsonString = stringifyJSON(dados);
        arquivo.write(jsonString);
        arquivo.close();
        
        if (typeof logs !== 'undefined' && logs.logArquivo) {
            logs.logArquivo("Escrita", caminho, true, jsonString.length + " chars");
        }
    } catch (e) {
        if (typeof logs !== 'undefined' && logs.logArquivo) {
            logs.logArquivo("Escrita", caminho, false, e.message);
        }
        throw e;
    }
}

// Modifique a função carregarJSON para usar parseJSON em vez de JSON.parse
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
        // Verificar se todas as seções necessárias existem
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

// Função para salvar o arquivo JSON
function salvarJSON(arquivo, dados) {
    try {
        var arquivo = new File(arquivo);
        arquivo.encoding = "UTF-8";
        arquivo.open('w');
        var conteudo = stringifyJSON(dados);
        arquivo.write(conteudo);
        arquivo.close();
        $.writeln("Arquivo salvo com sucesso: " + arquivo.fsName);
    } catch (e) {
        alert("Erro ao salvar o arquivo: " + e.toString());
        $.writeln("Erro ao salvar o arquivo: " + e.toString());
    }
}

// Função para encontrar o nome da cor baseado em CMYK
function getNomeCor(cmykArray, dadosCores) {
    for (var i = 0; i < dadosCores.length; i++) {
        var cor = dadosCores[i];
        if (cor && cor.cmyk && cor.nome) {
            if (
                cor.cmyk[0] === cmykArray[0] &&
                cor.cmyk[1] === cmykArray[1] &&
                cor.cmyk[2] === cmykArray[2] &&
                cor.cmyk[3] === cmykArray[3]
            ) {
                return cor.nome;
            }
        }
    }
    return null;
}

// Função para converter CMYK para string
function cmykToString(cmykColor) {
    return Math.round(cmykColor.cyan) + "," + 
           Math.round(cmykColor.magenta) + "," + 
           Math.round(cmykColor.yellow) + "," + 
           Math.round(cmykColor.black);
}

// Função para carregar dados da base de dados
function carregarDadosBase(caminhoBaseDados) {
    try {
        var dados = lerArquivoJSON(caminhoBaseDados);
        
        // Verificar se a propriedade 'cores' existe e é um array
        if (!dados || !funcoes.isArray(dados.cores)) {
            if (typeof logs !== 'undefined' && logs.adicionarLog) {
                logs.adicionarLog("Base de dados inválida: propriedade cores ausente ou inválida", logs.TIPOS_LOG.ERROR);
            }
            throw new Error('Os dados da base de cores não são um array ou a propriedade "cores" está ausente.');
        }
        
        return dados;
    } catch (e) {
        if (typeof logs !== 'undefined' && logs.adicionarLog) {
            logs.adicionarLog("Erro ao carregar base de dados: " + e.message, logs.TIPOS_LOG.ERROR);
        }
        throw new Error("Erro ao carregar dados da base: " + e.message);
    }
}

// Função para validar estrutura da base de dados
function validarEstruturaBase(dados) {
    var secoesObrigatorias = ["componentes", "cores", "combinacoes", "acabamentos", "tamanhos", "bolas"];
    
    for (var i = 0; i < secoesObrigatorias.length; i++) {
        var secao = secoesObrigatorias[i];
        if (!dados.hasOwnProperty(secao) || !funcoes.isArray(dados[secao])) {
            throw new Error("Seção obrigatória '" + secao + "' ausente ou inválida na base de dados");
        }
    }
    
    return true;
}

// Função para verificar se o arquivo existe
function arquivoExiste(caminho) {
    return new File(caminho).exists;
}

// Make functions available globally
$.global.database = {
    lerArquivoJSON: lerArquivoJSON,
    escreverArquivoJSON: escreverArquivoJSON,
    carregarJSON: carregarJSON,
    salvarJSON: salvarJSON,
    getNomeCor: getNomeCor,
    cmykToString: cmykToString,
    carregarDadosBase: carregarDadosBase,
    validarEstruturaBase: validarEstruturaBase,
    arquivoExiste: arquivoExiste
};