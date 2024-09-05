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

// Função para escrever no arquivo JSON
function escreverArquivoJSON(caminho, dados) {
    var arquivo = new File(caminho);
    arquivo.open('w');
    arquivo.write(stringifyJSON(dados));
    arquivo.close();
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

// Make functions available globally
$.global.database = {
    lerArquivoJSON: lerArquivoJSON,
    escreverArquivoJSON: escreverArquivoJSON,
    carregarJSON: carregarJSON,
    salvarJSON: salvarJSON
};