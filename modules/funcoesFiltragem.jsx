#target illustrator
#targetengine maintarget

/**
 * funcoesFiltragem.jsx
 * Domínio: Funcionalidades de filtragem e seleção de dados
 * Responsabilidades:
 *   - Filtrar componentes por termo de pesquisa
 *   - Obter componentes disponíveis com combinações
 *   - Obter cores disponíveis para bolas
 *   - Preencher cores específicas do bioprint
 *   - Obter números de texturas
 *   - Processar e organizar dados para dropdowns
 */

// Função auxiliar para logs protegidos
function logProtegidoFiltragem(mensagem, tipo) {
    if (typeof logs !== 'undefined' && logs.adicionarLog && logs.TIPOS_LOG) {
        logs.adicionarLog(mensagem, tipo);
    }
}

/**
 * Filtra componentes baseado em termo de pesquisa
 */
function filtrarComponentes(termo, componentesNomes, listaComponentes, listaCores, listaUnidades, dados, t, funcoes, funcoesComponentes) {
    logProtegidoFiltragem("Iniciando filtro de componentes - termo: '" + (termo || "") + "'", logs.TIPOS_LOG.FUNCTION);
    try {
        if (!termo || typeof termo !== 'string') {
            termo = "";
        }
        
        var componentesFiltrados = [t("selecioneComponente")];
        
        if (termo.length > 0) {
            for (var i = 1; i < componentesNomes.length; i++) {
                if (componentesNomes[i].toLowerCase().indexOf(termo.toLowerCase()) !== -1) {
                    componentesFiltrados.push(componentesNomes[i]);
                }
            }
        } else {
            componentesFiltrados = [t("selecioneComponente")].concat(componentesNomes.slice(1));
        }

        // Salvar a seleção atual
        var selecaoAtual = listaComponentes.selection;

        // Limpar e repopular a lista
        listaComponentes.removeAll();
        for (var i = 0; i < componentesFiltrados.length; i++) {
            listaComponentes.add("item", componentesFiltrados[i]);
        }

        // Sempre selecionar o primeiro item filtrado se houver resultados
        if (componentesFiltrados.length > 1) {
            listaComponentes.selection = 1; // Seleciona o primeiro componente filtrado
            logProtegidoFiltragem("Filtro aplicado: " + (componentesFiltrados.length - 1) + " componentes encontrados", logs.TIPOS_LOG.INFO);
        } else {
            listaComponentes.selection = 0; // Seleciona "Selecione um componente" se não houver resultados
            logProtegidoFiltragem("Nenhum componente encontrado para o termo: '" + termo + "'", logs.TIPOS_LOG.WARNING);
        }

        // Atualizar cores e unidades
        funcoes.atualizarCores(listaComponentes, listaCores, listaUnidades, dados, t, function() {
            if (funcoesComponentes && funcoesComponentes.verificarCMYK) {
                funcoesComponentes.verificarCMYK(listaComponentes, listaCores, listaUnidades, dados, funcoes.encontrarIndicePorNome);
            }
        });

        logProtegidoFiltragem("Filtro de componentes concluído com sucesso", logs.TIPOS_LOG.INFO);

    } catch (erro) {
        logProtegidoFiltragem("Erro ao filtrar componentes: " + erro.message, logs.TIPOS_LOG.ERROR);
        // Em caso de erro, restaurar lista completa
        listaComponentes.removeAll();
        for (var i = 0; i < componentesNomes.length; i++) {
            listaComponentes.add("item", componentesNomes[i]);
        }
        listaComponentes.selection = 0;
    }
}

/**
 * Obtém componentes que possuem combinações disponíveis
 */
function getComponentesComCombinacoes(dados, t, arrayContains, encontrarPorId) {
    logProtegidoFiltragem("Obtendo componentes com combinações disponíveis", logs.TIPOS_LOG.FUNCTION);
    try {
        // Validação de entrada
        if (!dados || !dados.combinacoes || !dados.componentes) {
            logProtegidoFiltragem("Dados inválidos para obter componentes com combinações", logs.TIPOS_LOG.WARNING);
            return [t("selecioneComponente")];
        }
        
        var componentesDisponiveis = [t("selecioneComponente")];
        var componentesIds = [];
        
        for (var i = 0; i < dados.combinacoes.length; i++) {
            var componenteId = dados.combinacoes[i].componenteId;
            if (!arrayContains(componentesIds, componenteId)) {
                var componente = encontrarPorId(dados.componentes, componenteId);
                if (componente) {
                    componentesDisponiveis.push(componente.nome);
                    componentesIds.push(componenteId);
                }
            }
        }
        
        logProtegidoFiltragem("Componentes com combinações obtidos: " + (componentesDisponiveis.length - 1) + " componentes", logs.TIPOS_LOG.INFO);
        return componentesDisponiveis;
        
    } catch (erro) {
        logProtegidoFiltragem("Erro ao obter componentes com combinações: " + erro.message, logs.TIPOS_LOG.ERROR);
        return [t("selecioneComponente")];
    }
}

/**
 * Obtém cores disponíveis para bolas
 */
function getCoresDisponiveisBolas(dados, t, arrayContains, encontrarPorId) {
    logProtegidoFiltragem("Obtendo cores disponíveis para bolas", logs.TIPOS_LOG.FUNCTION);
    try {
        // Validação de entrada
        if (!dados || !dados.bolas || !dados.cores) {
            return [t("selecioneCor")];
        }
        
        var coresDisponiveis = [t("selecioneCor")];
        var coresIds = [];
        
        for (var i = 0; i < dados.bolas.length; i++) {
            var corId = dados.bolas[i].corId;
            if (!arrayContains(coresIds, corId)) {
                var cor = encontrarPorId(dados.cores, corId);
                if (cor) {
                    coresDisponiveis.push(cor.nome);
                    coresIds.push(corId);
                }
            }
        }
        
        return coresDisponiveis;
        
    } catch (erro) {
        return [t("selecioneCor")];
    }
}

/**
 * Preenche dropdown com cores disponíveis para bioprint
 */
function preencherCoresBioprint(dropdownCorBioprint, dados, arrayContains, encontrarPorId) {
    try {
        // Validação de entrada
        if (!dropdownCorBioprint) {
            return;
        }
        
        if (!dados || !dados.componentes || !dados.combinacoes || !dados.cores) {
            return;
        }
        
        dropdownCorBioprint.removeAll();
        
        var componenteBioprint = null;
        for (var i = 0; i < dados.componentes.length; i++) {
            if (dados.componentes[i].nome.toLowerCase() === "bioprint") {
                componenteBioprint = dados.componentes[i];
                break;
            }
        }
        
        if (componenteBioprint) {
            var coresBioprint = [];
            var indexOr = -1;
            
            for (var i = 0; i < dados.combinacoes.length; i++) {
                if (dados.combinacoes[i].componenteId === componenteBioprint.id) {
                    var cor = encontrarPorId(dados.cores, dados.combinacoes[i].corId);
                    if (cor && !arrayContains(coresBioprint, cor)) {
                        coresBioprint.push(cor);
                        if (cor.nome.toLowerCase() === "or") {
                            indexOr = coresBioprint.length - 1;
                        }
                    }
                }
            }
        
            for (var i = 0; i < coresBioprint.length; i++) {
                dropdownCorBioprint.add("item", coresBioprint[i].nome);
            }
        
            // Pré-selecionar "or" se existir, caso contrário, selecionar o primeiro item
            if (indexOr !== -1) {
                dropdownCorBioprint.selection = indexOr;
            } else if (coresBioprint.length > 0) {
                dropdownCorBioprint.selection = 0;
            }
        }
        
        // Se não houver cores disponíveis, adicionar um item padrão
        if (dropdownCorBioprint.items.length === 0) {
            dropdownCorBioprint.add("item", "Sem cores disponíveis");
            dropdownCorBioprint.selection = 0;
        }
        
    } catch (erro) {
        // Em caso de erro, adicionar item padrão
        if (dropdownCorBioprint) {
            dropdownCorBioprint.removeAll();
            dropdownCorBioprint.add("item", "Erro ao carregar cores");
            dropdownCorBioprint.selection = 0;
        }
    }
}

/**
 * Obtém número da textura baseado no nome
 */
function obterNumeroTextura(texturaNome) {
    try {
        // Validação de entrada
        if (!texturaNome || typeof texturaNome !== 'string') {
            return 1;
        }
        
        var numero;
        
        if (texturaNome.indexOf("Texture") === 0) {
            numero = parseInt(texturaNome.replace("Texture ", ""));
        } else {
            // Para texturas Flexi, manter a numeração original
            switch(texturaNome) {
                case "Flexi Triangle": numero = 17; break;
                case "Flexi Boucle": numero = 18; break;
                case "Flexi Losange": numero = 19; break;
                case "Flexi Meli Melo": numero = 20; break;
                default: numero = 1; break;
            }
        }
        
        return numero;
        
    } catch (erro) {
        return 1;
    }
}

// Export global
$.global.funcoesFiltragem = {
    filtrarComponentes: filtrarComponentes,
    getComponentesComCombinacoes: getComponentesComCombinacoes,
    getCoresDisponiveisBolas: getCoresDisponiveisBolas,
    preencherCoresBioprint: preencherCoresBioprint,
    obterNumeroTextura: obterNumeroTextura
}; 