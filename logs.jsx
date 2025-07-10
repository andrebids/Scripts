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

// Função para adicionar log
function adicionarLog(mensagem, tipo) {
    if (!tipo) {
        tipo = TIPOS_LOG.INFO;
    }
    
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
    if (typeof atualizarInterfaceLogs === 'function') {
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
    if (typeof areaLogs !== 'undefined' && areaLogs) {
        var textoLogs = obterLogsFormatados();
        areaLogs.text = textoLogs;
        
        // Auto-scroll se estiver ativado
        if (typeof checkAutoScroll !== 'undefined' && checkAutoScroll && checkAutoScroll.value) {
            // Mover para o final do texto
            areaLogs.active = true;
            areaLogs.selection = areaLogs.text.length;
        }
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

// Função para inicializar o sistema de logs
function inicializarSistemaLogs() {
    adicionarLog("Sistema de logs inicializado", TIPOS_LOG.INFO);
    configurarEventosLogs();
    atualizarInterfaceLogs();
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
    obterLogsFormatados: obterLogsFormatados,
    atualizarInterfaceLogs: atualizarInterfaceLogs,
    configurarEventosLogs: configurarEventosLogs,
    inicializarSistemaLogs: inicializarSistemaLogs,
    obterEstatisticasLogs: obterEstatisticasLogs,
    filtrarLogsPorTipo: filtrarLogsPorTipo,
    buscarLogs: buscarLogs,
    TIPOS_LOG: TIPOS_LOG
};

// Log inicial
adicionarLog("Módulo de logs carregado", TIPOS_LOG.INFO); 