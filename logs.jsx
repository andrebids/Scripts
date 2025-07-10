// Sistema de Logs para o Script Legenda
// Arquivo: logs.jsx

// Variável global para armazenar logs em memória
var logsArray = [];
var maxLogs = 1000; // Limite máximo de logs em memória

// Tipos de log disponíveis
var TIPOS_LOG = {
    INFO: 'info',
    WARNING: 'warning', 
    ERROR: 'error',
    CLICK: 'click',
    FUNCTION: 'function'
};

// Níveis de verbosidade
var NIVEIS_LOG = {
    BASIC: 1,      // Apenas clicks, erros e warnings
    DETAILED: 2,   // + functions importantes
    DEBUG: 3       // Todos os logs incluindo operações de arquivo
};

// Configuração atual de verbosidade
var nivelAtual = NIVEIS_LOG.BASIC;

// Cache para evitar logs repetitivos
var cacheOperacoes = {};
var limiteCacheOperacao = 3; // Máximo de vezes que a mesma operação é logada

// Função para verificar se deve registrar o log baseado no nível
function deveRegistrarLog(tipo, mensagem) {
    // Sempre registrar erros e warnings
    if (tipo === TIPOS_LOG.ERROR || tipo === TIPOS_LOG.WARNING) {
        return true;
    }
    
    // Sempre registrar clicks no nível BASIC ou superior
    if (tipo === TIPOS_LOG.CLICK && nivelAtual >= NIVEIS_LOG.BASIC) {
        return true;
    }
    
    // Registrar functions no nível DETAILED ou superior
    if (tipo === TIPOS_LOG.FUNCTION && nivelAtual >= NIVEIS_LOG.DETAILED) {
        return true;
    }
    
    // Registrar alguns logs INFO importantes mesmo no nível BASIC
    if (tipo === TIPOS_LOG.INFO) {
        // Logs de inicialização e operações importantes sempre aparecem
        if (mensagem.indexOf("inicializado") !== -1 || 
            mensagem.indexOf("Sistema de logs") !== -1 ||
            mensagem.indexOf("Módulo de logs") !== -1 ||
            mensagem.indexOf("Nível de log alterado") !== -1 ||
            mensagem.indexOf("Cache de operações limpo") !== -1 ||
            mensagem.indexOf("Logs limpos") !== -1 ||
            mensagem.indexOf("Auto-scroll") !== -1 ||
            mensagem.indexOf("adicionado") !== -1 ||
            mensagem.indexOf("removido") !== -1 ||
            mensagem.indexOf("atualizado") !== -1) {
            return true;
        }
        
        // Outros logs INFO apenas no nível DEBUG
        if (nivelAtual >= NIVEIS_LOG.DEBUG) {
            return true;
        }
    }
    
    return false;
}

// Função para verificar se a operação já foi logada muitas vezes
function verificarCacheOperacao(mensagem) {
    // Criar chave simplificada da operação
    var chave = mensagem.substring(0, 50); // Primeiros 50 caracteres
    
    if (!cacheOperacoes[chave]) {
        cacheOperacoes[chave] = 0;
    }
    
    cacheOperacoes[chave]++;
    
    // Se excedeu o limite, adicionar sufixo
    if (cacheOperacoes[chave] > limiteCacheOperacao) {
        return "(" + cacheOperacoes[chave] + "x) " + mensagem;
    }
    
    return mensagem;
}

// Função para adicionar log
function adicionarLog(mensagem, tipo, nivel) {
    if (!tipo) {
        tipo = TIPOS_LOG.INFO;
    }
    
    // Verificar se deve registrar baseado no nível
    if (!deveRegistrarLog(tipo, mensagem)) {
        return null;
    }
    
    // Verificar cache para operações repetitivas
    mensagem = verificarCacheOperacao(mensagem);
    
    var timestamp = new Date();
    var logEntry = {
        timestamp: timestamp,
        tipo: tipo,
        mensagem: mensagem,
        data: timestamp.toLocaleDateString(),
        hora: timestamp.toLocaleTimeString()
    };
    
    logsArray.push(logEntry);
    
    // Limitar o número de logs em memória
    if (logsArray.length > maxLogs) {
        logsArray.shift(); // Remove o log mais antigo
    }
    
    // Atualizar interface se existir 
    // Nos primeiros 20 logs ou em logs importantes, atualizar sempre
    var deveAtualizarSempre = logsArray.length <= 20 || 
                              tipo === TIPOS_LOG.ERROR || 
                              tipo === TIPOS_LOG.WARNING ||
                              mensagem.indexOf("inicializado") !== -1;
    
    if ((deveAtualizarSempre || logsArray.length % 5 === 0) && typeof atualizarInterfaceLogs === 'function') {
        atualizarInterfaceLogs();
    }
    
    return logEntry;
}

// Função para limpar logs
function limparLogs() {
    logsArray = [];
    adicionarLog("Logs limpos pelo usuário", TIPOS_LOG.INFO);
    
    // Atualizar interface se existir
    if (typeof atualizarInterfaceLogs === 'function') {
        atualizarInterfaceLogs();
    }
}

// Função para exportar logs
function exportarLogs() {
    try {
        var pastaDocumentos = Folder.myDocuments;
        var nomeArquivo = "logs_legenda_" + new Date().toISOString().slice(0, 10) + ".txt";
        var arquivoLogs = new File(pastaDocumentos + "/" + nomeArquivo);
        
        arquivoLogs.open('w');
        
        // Cabeçalho do arquivo
        arquivoLogs.write("=== LOGS DO SCRIPT LEGENDA ===\n");
        arquivoLogs.write("Data de exportação: " + new Date().toLocaleString() + "\n");
        arquivoLogs.write("Total de logs: " + logsArray.length + "\n");
        arquivoLogs.write("================================\n\n");
        
        // Escrever cada log
        for (var i = 0; i < logsArray.length; i++) {
            var log = logsArray[i];
            var linha = "[" + log.data + " " + log.hora + "] [" + log.tipo.toUpperCase() + "] " + log.mensagem + "\n";
            arquivoLogs.write(linha);
        }
        
        arquivoLogs.close();
        
        adicionarLog("Logs exportados para: " + arquivoLogs.fsName, TIPOS_LOG.INFO);
        alert("Logs exportados com sucesso para:\n" + arquivoLogs.fsName);
        
        return arquivoLogs.fsName;
    } catch (e) {
        adicionarLog("Erro ao exportar logs: " + e.message, TIPOS_LOG.ERROR);
        alert("Erro ao exportar logs: " + e.message);
        return null;
    }
}

// Função para obter logs formatados para exibição
function obterLogsFormatados() {
    var textoLogs = "";
    
    for (var i = 0; i < logsArray.length; i++) {
        var log = logsArray[i];
        var prefixo = "";
        
        // Adicionar prefixo baseado no tipo
        switch (log.tipo) {
            case TIPOS_LOG.ERROR:
                prefixo = "❌ ";
                break;
            case TIPOS_LOG.WARNING:
                prefixo = "⚠️ ";
                break;
            case TIPOS_LOG.CLICK:
                prefixo = "🖱️ ";
                break;
            case TIPOS_LOG.FUNCTION:
                prefixo = "⚙️ ";
                break;
            default:
                prefixo = "ℹ️ ";
        }
        
        textoLogs += "[" + log.hora + "] " + prefixo + log.mensagem + "\n";
    }
    
    return textoLogs;
}

// Função para registrar eventos de clique
function logEvento(tipo, detalhes) {
    var mensagem = "Evento: " + tipo;
    if (detalhes) {
        mensagem += " - " + detalhes;
    }
    adicionarLog(mensagem, TIPOS_LOG.CLICK);
}

// Função para registrar execução de funções
function logFuncao(nomeFuncao, parametros, resultado) {
    var mensagem = "Função: " + nomeFuncao;
    
    if (parametros) {
        mensagem += " - Parâmetros: " + JSON.stringify(parametros);
    }
    
    if (resultado !== undefined) {
        mensagem += " - Resultado: " + JSON.stringify(resultado);
    }
    
    adicionarLog(mensagem, TIPOS_LOG.FUNCTION);
}

// Função para atualizar a interface de logs
function atualizarInterfaceLogs() {
    try {
        if (typeof areaLogs !== 'undefined' && areaLogs) {
            var textoLogs = obterLogsFormatados();
            areaLogs.text = textoLogs;

            if (typeof checkAutoScroll !== 'undefined' && checkAutoScroll && checkAutoScroll.value) {
                areaLogs.active = true;
                areaLogs.selection = areaLogs.text.length;
            }
        }
    } catch (e) {
        // Se areaLogs estiver inválido, ignora o erro para evitar que o script pare.
    }
}

// Função para configurar eventos dos botões da interface
function configurarEventosLogs() {
    if (typeof botaoLimparLogs !== 'undefined' && botaoLimparLogs) {
        botaoLimparLogs.onClick = function() {
            limparLogs();
        };
    }
    
    if (typeof botaoExportarLogs !== 'undefined' && botaoExportarLogs) {
        botaoExportarLogs.onClick = function() {
            exportarLogs();
        };
    }
    
    if (typeof botaoAtualizarLogs !== 'undefined' && botaoAtualizarLogs) {
        botaoAtualizarLogs.onClick = function() {
            atualizarInterfaceLogs();
        };
    }
    
    if (typeof checkAutoScroll !== 'undefined' && checkAutoScroll) {
        checkAutoScroll.onClick = function() {
            adicionarLog("Auto-scroll " + (this.value ? "ativado" : "desativado"), TIPOS_LOG.INFO);
        };
    }
}

// Função para configurar nível de verbosidade
function configurarNivelLog(nivel) {
    if (nivel >= NIVEIS_LOG.BASIC && nivel <= NIVEIS_LOG.DEBUG) {
        nivelAtual = nivel;
        var nivelNome = nivel === NIVEIS_LOG.BASIC ? "BASIC" : 
                       nivel === NIVEIS_LOG.DETAILED ? "DETAILED" : "DEBUG";
        adicionarLog("Nível de log alterado para: " + nivelNome, TIPOS_LOG.INFO);
        return true;
    }
    return false;
}

// Função para obter nível atual
function obterNivelAtual() {
    return nivelAtual;
}

// Função simplificada para logs de arquivo (evita verbosidade excessiva)
function logArquivo(operacao, arquivo, sucesso, detalhes) {
    var mensagem = operacao + ": " + arquivo.split('/').pop(); // Apenas nome do arquivo
    if (sucesso) {
        if (detalhes) {
            mensagem += " (" + detalhes + ")";
        }
        adicionarLog(mensagem + " ✓", TIPOS_LOG.INFO);
    } else {
        adicionarLog(mensagem + " ✗ - " + (detalhes || "erro"), TIPOS_LOG.ERROR);
    }
}

// Função para limpar cache de operações
function limparCacheOperacoes() {
    cacheOperacoes = {};
    adicionarLog("Cache de operações limpo", TIPOS_LOG.INFO);
}

// Função para inicializar o sistema de logs
function inicializarSistemaLogs() {
    adicionarLog("Sistema de logs inicializado (nível: " + 
                (nivelAtual === NIVEIS_LOG.BASIC ? "BASIC" : 
                 nivelAtual === NIVEIS_LOG.DETAILED ? "DETAILED" : "DEBUG") + ")", TIPOS_LOG.INFO);
    configurarEventosLogs();
    atualizarInterfaceLogs();
    
    // Adicionar um log de boas-vindas para o usuário ver que funciona
    adicionarLog("Logs prontos! Use o dropdown 'Nível' para controlar verbosidade", TIPOS_LOG.INFO);
}

// Função para obter estatísticas dos logs
function obterEstatisticasLogs() {
    var estatisticas = {
        total: logsArray.length,
        porTipo: {}
    };
    
    // Contar por tipo
    for (var i = 0; i < logsArray.length; i++) {
        var tipo = logsArray[i].tipo;
        if (!estatisticas.porTipo[tipo]) {
            estatisticas.porTipo[tipo] = 0;
        }
        estatisticas.porTipo[tipo]++;
    }
    
    return estatisticas;
}

// Função para filtrar logs por tipo
function filtrarLogsPorTipo(tipo) {
    var logsFiltrados = [];
    
    for (var i = 0; i < logsArray.length; i++) {
        if (logsArray[i].tipo === tipo) {
            logsFiltrados.push(logsArray[i]);
        }
    }
    
    return logsFiltrados;
}

// Função para buscar logs por texto
function buscarLogs(texto) {
    var logsEncontrados = [];
    var textoBusca = texto.toLowerCase();
    
    for (var i = 0; i < logsArray.length; i++) {
        if (logsArray[i].mensagem.toLowerCase().indexOf(textoBusca) !== -1) {
            logsEncontrados.push(logsArray[i]);
        }
    }
    
    return logsEncontrados;
}

// Exportar funções para o escopo global
$.global.logs = {
    adicionarLog: adicionarLog,
    limparLogs: limparLogs,
    exportarLogs: exportarLogs,
    logEvento: logEvento,
    logFuncao: logFuncao,
    logArquivo: logArquivo,
    obterLogsFormatados: obterLogsFormatados,
    atualizarInterfaceLogs: atualizarInterfaceLogs,
    configurarEventosLogs: configurarEventosLogs,
    inicializarSistemaLogs: inicializarSistemaLogs,
    configurarNivelLog: configurarNivelLog,
    obterNivelAtual: obterNivelAtual,
    limparCacheOperacoes: limparCacheOperacoes,
    obterEstatisticasLogs: obterEstatisticasLogs,
    filtrarLogsPorTipo: filtrarLogsPorTipo,
    buscarLogs: buscarLogs,
    TIPOS_LOG: TIPOS_LOG,
    NIVEIS_LOG: NIVEIS_LOG
};

// Log inicial sempre visível
adicionarLog("Sistema de logs inicializado", TIPOS_LOG.INFO); 