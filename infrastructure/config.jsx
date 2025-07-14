/**
 * Arquivo: config.jsx
 * Domínio: Configuração inicial e gestão de preferências
 * 
 * Este arquivo contém todas as funções relacionadas à configuração inicial
 * do usuário, incluindo nome do designer, idioma e persistência das configurações.
 * 
 * Funções principais:
 * - mostrarJanelaConfigInicial(): Interface para primeira configuração
 * - carregarConfiguracaoUsuario(): Carrega configurações salvas
 * - salvarConfiguracaoUsuario(): Salva configurações no arquivo
 * - inicializarConfiguracao(): Inicializa o sistema de configuração
 * - alterarIdioma(): Altera idioma e salva configuração
 */

// Função auxiliar para logs protegidos
function logProtegido(mensagem, tipo) {
    if (typeof logs !== 'undefined' && logs.adicionarLog) {
        logs.adicionarLog(mensagem, tipo);
    }
}

// Função para mostrar janela de configuração inicial
function mostrarJanelaConfigInicial() {
    logProtegido("Exibindo janela de configuração inicial", "function");
    
    var janelaConfig = new Window("dialog", "Configuração Inicial / Configuration Initiale");
    janelaConfig.orientation = "column";
    janelaConfig.alignChildren = "center";
    
    // Grupo para nome
    var grupoNome = janelaConfig.add("group");
    grupoNome.add("statictext", undefined, "Nome do Designer / Nom du Designer:");
    var campoNome = grupoNome.add("edittext", undefined, "");
    campoNome.characters = 30;
    
    // Grupo para idioma
    var grupoIdioma = janelaConfig.add("group");
    grupoIdioma.add("statictext", undefined, "Idioma / Langue:");
    var listaIdiomas = grupoIdioma.add("dropdownlist", undefined, ["Português", "Français"]);
    listaIdiomas.selection = 0;
    
    // Botão OK
    var botaoOK = janelaConfig.add("button", undefined, "OK");
    
    botaoOK.onClick = function() {
        if (campoNome.text.length > 0) {
            logProtegido("Salvando configuração inicial - Nome: " + campoNome.text + ", Idioma: " + listaIdiomas.selection.text, "info");
            
            nomeDesigner = campoNome.text;
            idiomaUsuario = listaIdiomas.selection.text;
            IDIOMA_ATUAL = idiomaUsuario;
            
            var config = {
                nomeDesigner: nomeDesigner,
                idioma: idiomaUsuario
            };
            
            try {
                database.escreverArquivoJSON(caminhoConfig, config);
                logProtegido("Configuração inicial salva com sucesso", "info");
                janelaConfig.close();
            } catch(e) {
                logProtegido("Erro ao salvar configuração inicial: " + e.message, "error");
                alert("Erro ao salvar configuração / Erreur lors de l'enregistrement de la configuration: " + e.message);
            }
        } else {
            logProtegido("Erro: Nome vazio na configuração inicial", "warning");
            alert("Por favor, insira seu nome / S'il vous plaît, entrez votre nom");
        }
    };
    
    logProtegido("Janela de configuração inicial criada", "info");
    janelaConfig.show();
}

// Função para carregar configuração do usuário
function carregarConfiguracaoUsuario() {
    logProtegido("Carregando configuração do usuário", "function");
    
    try {
        if (database.arquivoExiste(caminhoConfig)) {
            var config = database.lerArquivoJSON(caminhoConfig);
            if (config && config.nomeDesigner && config.idioma) {
                nomeDesigner = config.nomeDesigner;
                idiomaUsuario = config.idioma;
                IDIOMA_ATUAL = config.idioma;
                
                logProtegido("Configuração carregada - Designer: " + nomeDesigner + ", Idioma: " + idiomaUsuario, "info");
                return true;
            } else {
                logProtegido("Configuração incompleta encontrada, exibindo janela inicial", "warning");
                mostrarJanelaConfigInicial();
                return false;
            }
        } else {
            logProtegido("Arquivo de configuração não encontrado, exibindo janela inicial", "info");
            mostrarJanelaConfigInicial();
            return false;
        }
    } catch(e) {
        logProtegido("Erro ao carregar configuração: " + e.message, "error");
        mostrarJanelaConfigInicial();
        return false;
    }
}

// Função para salvar configuração do usuário
function salvarConfiguracaoUsuario(nome, idioma) {
    logProtegido("Salvando configuração - Nome: " + nome + ", Idioma: " + idioma, "function");
    
    try {
        var config = {
            nomeDesigner: nome,
            idioma: idioma
        };
        
        database.escreverArquivoJSON(caminhoConfig, config);
        logProtegido("Configuração salva com sucesso", "info");
        return true;
    } catch(e) {
        logProtegido("Erro ao salvar configuração: " + e.message, "error");
        return false;
    }
}

// Função para alterar idioma e salvar
function alterarIdioma(novoIdioma) {
    logProtegido("Alterando idioma para: " + novoIdioma, "function");
    
    try {
        // Carregar configuração atual
        var config = database.lerArquivoJSON(caminhoConfig);
        config.idioma = novoIdioma;
        
        // Salvar nova configuração
        database.escreverArquivoJSON(caminhoConfig, config);
        
        // Atualizar variáveis globais
        idiomaUsuario = novoIdioma;
        IDIOMA_ATUAL = novoIdioma;
        
        logProtegido("Idioma alterado e salvo com sucesso", "info");
        return true;
    } catch(e) {
        logProtegido("Erro ao alterar idioma: " + e.message, "error");
        return false;
    }
}

// Função para inicializar sistema de configuração
function inicializarConfiguracao() {
    logProtegido("Inicializando sistema de configuração", "function");
    
    // Verificar se existe arquivo de configuração
    var configuracaoCarregada = carregarConfiguracaoUsuario();
    
    if (configuracaoCarregada) {
        logProtegido("Sistema de configuração inicializado com sucesso", "info");
    } else {
        logProtegido("Sistema de configuração inicializado - aguardando entrada do usuário", "info");
    }
    
    return configuracaoCarregada;
}

// Função para obter configuração atual
function obterConfiguracaoAtual() {
    return {
        nomeDesigner: nomeDesigner,
        idioma: idiomaUsuario,
        caminhoConfig: caminhoConfig
    };
}

// Função para verificar se configuração está válida
function validarConfiguracao(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }
    
    if (!config.nomeDesigner || typeof config.nomeDesigner !== 'string' || config.nomeDesigner.length === 0) {
        return false;
    }
    
    if (!config.idioma || typeof config.idioma !== 'string') {
        return false;
    }
    
    var idiomasSuportados = ["Português", "Français"];
    if (idiomasSuportados.indexOf(config.idioma) === -1) {
        return false;
    }
    
    return true;
}

// Exportar funções para o escopo global
$.global.config = {
    mostrarJanelaConfigInicial: mostrarJanelaConfigInicial,
    carregarConfiguracaoUsuario: carregarConfiguracaoUsuario,
    salvarConfiguracaoUsuario: salvarConfiguracaoUsuario,
    alterarIdioma: alterarIdioma,
    inicializarConfiguracao: inicializarConfiguracao,
    obterConfiguracaoAtual: obterConfiguracaoAtual,
    validarConfiguracao: validarConfiguracao
};

logProtegido("Módulo config.jsx carregado com sucesso", "info"); 