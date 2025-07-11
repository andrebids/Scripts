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

/**
 * Filtra componentes baseado em termo de pesquisa
 */
function filtrarComponentes(termo, componentesNomes, listaComponentes, listaCores, listaUnidades, dados, t, funcoes, funcoesComponentes) {
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
        } else {
            listaComponentes.selection = 0; // Seleciona "Selecione um componente" se não houver resultados
        }

        // Atualizar cores e unidades
        funcoes.atualizarCores(listaComponentes, listaCores, listaUnidades, dados, t, function() {
            if (funcoesComponentes && funcoesComponentes.verificarCMYK) {
                funcoesComponentes.verificarCMYK(listaComponentes, listaCores, listaUnidades, dados, funcoes.encontrarIndicePorNome);
            }
        });

    } catch (erro) {
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
    try {
        // Validação de entrada
        if (!dados || !dados.combinacoes || !dados.componentes) {
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
        
        return componentesDisponiveis;
        
    } catch (erro) {
        return [t("selecioneComponente")];
    }
}

/**
 * Obtém cores disponíveis para bolas
 */
function getCoresDisponiveisBolas(dados, t, arrayContains, encontrarPorId) {
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