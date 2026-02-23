#target illustrator;
#targetengine maintarget;

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
            for (var i = 0; i < componentesNomes.length; i++) { // Começa do 0!
                if (componentesNomes[i].toLowerCase().indexOf(termo.toLowerCase()) !== -1) {
                    componentesFiltrados.push(componentesNomes[i]);
                }
            }
        } else {
            componentesFiltrados = [t("selecioneComponente")].concat(componentesNomes);
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
            return {
                componentesPrint: [],
                componentesLeds: [],
                componentesNormais: [],
                componentesOrdenados: []
            };
        }
        var componentesIds = [];
        var especiais = [
            "BIOPRINT",
            "RECYPRINT",
            "IMPRESSION IGNIFUGE",
            "FLEXIPRINT",
            "FLEXIPRINT IGNIFUGE",
            "PRINT IGNIFUGE"
        ];
        var componentesNormais = [];
        var componentesEspeciais = [];
        var componentesLeds = [];
        for (var i = 0; i < dados.combinacoes.length; i++) {
            var componenteId = dados.combinacoes[i].componenteId;
            if (!arrayContains(componentesIds, componenteId)) {
                var componente = encontrarPorId(dados.componentes, componenteId);
                if (componente) {
                    var ehEspecial = false;
                    var ehLed = false;
                    var nomeComp = componente.nome.toLowerCase();
                    for (var j = 0; j < especiais.length; j++) {
                        if (componente.nome.toUpperCase() === especiais[j]) {
                            ehEspecial = true;
                            break;
                        }
                    }
                    // Incluir combinações flexi+ (com ou sem espaço: "flexi+" ou "flexi +") no dropdown PRINT
                    if (!ehEspecial && (nomeComp.indexOf("flexi+") !== -1 || nomeComp.indexOf("flexi +") !== -1)) {
                        ehEspecial = true;
                    }
                    // ALTERAÇÃO: Aceitar variações de 'stalactite' para LEDS
                    if (!ehEspecial) {
                        if (
                            nomeComp === "lucioles" ||
                            nomeComp === "rideaux" ||
                            nomeComp.indexOf("stalactit") === 0 // pega stalactits, stalactite, stalactites
                        ) {
                            ehLed = true;
                        }
                    }
                    if (ehEspecial) {
                        componentesEspeciais.push(componente.nome);
                    } else if (ehLed) {
                        componentesLeds.push(componente.nome);
                    } else {
                        componentesNormais.push(componente.nome);
                    }
                    componentesIds.push(componenteId);
                }
            }
        }
        // Unir todos os componentes em uma lista única
        var todosComponentes = [];
        for (var i = 0; i < componentesEspeciais.length; i++) {
            todosComponentes.push(componentesEspeciais[i]);
        }
        for (var i = 0; i < componentesLeds.length; i++) {
            todosComponentes.push(componentesLeds[i]);
        }
        for (var i = 0; i < componentesNormais.length; i++) {
            todosComponentes.push(componentesNormais[i]);
        }
        // Bubble sort tradicional para ordenar alfabeticamente
        for (var i = 0; i < todosComponentes.length - 1; i++) {
            for (var j = 0; j < todosComponentes.length - i - 1; j++) {
                if (todosComponentes[j].toLowerCase() > todosComponentes[j + 1].toLowerCase()) {
                    var temp = todosComponentes[j];
                    todosComponentes[j] = todosComponentes[j + 1];
                    todosComponentes[j + 1] = temp;
                }
            }
        }
        logProtegidoFiltragem(
            "Componentes separados: PRINT=" + componentesEspeciais.length +
            ", LEDS=" + componentesLeds.length + ", COMPONENTS=" + componentesNormais.length +
            ", ORDENADOS=" + todosComponentes.length,
            logs.TIPOS_LOG.INFO
        );
        return {
            componentesPrint: componentesEspeciais,
            componentesLeds: componentesLeds,
            componentesNormais: componentesNormais,
            componentesOrdenados: todosComponentes
        };
    } catch (erro) {
        logProtegidoFiltragem("Erro ao obter componentes com combinações: " + erro.message, logs.TIPOS_LOG.ERROR);
        return {
            componentesPrint: [],
            componentesLeds: [],
            componentesNormais: [],
            componentesOrdenados: []
        };
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
        
        // Mapeamento dos novos nomes das texturas para números
        switch(texturaNome) {
            // LINHAS
            case "Alpha": numero = 1; break;
            case "LetteringLine": numero = 2; break;
            case "OrigamiLine": numero = 3; break;
            case "GMline": numero = 4; break;
            case "PMline": numero = 5; break;
            
            // LINHAS CRUZADAS
            case "GMcrossedline": numero = 6; break;
            case "PMcrossedline": numero = 7; break;
            
            // FORMAS GEOMÉTRICAS
            case "Round": numero = 8; break;
            case "Square": numero = 9; break;
            case "Square_rectangle": numero = 10; break;
            case "Heart": numero = 11; break;
            
            // PADRÕES ORGÂNICOS
            case "Beehive": numero = 12; break;
            case "GMfoliage": numero = 13; break;
            case "PMfoliage": numero = 14; break;
            case "Gingerbread": numero = 15; break;
            
            // PADRÕES COMPLEXOS
            case "Boucle": numero = 16; break;
            case "MeliMelo": numero = 17; break;
            case "Wave": numero = 18; break;
            
            // CALISSONS
            case "GMcalisson": numero = 19; break;
            case "PMcalisson": numero = 20; break;
            
            // SPAGHETTI
            case "GMSpaghetti": numero = 21; break;
            case "MMSpaghetti": numero = 22; break;
            case "PMSpaghetti": numero = 23; break;
            
            // ESTRELAS
            case "etoileGM": numero = 24; break;
            case "etoilePM": numero = 25; break;
            
            // Fallback para texturas antigas (retrocompatibilidade)
            default:
                if (texturaNome.indexOf("Texture") === 0) {
                    numero = parseInt(texturaNome.replace("Texture ", ""));
                } else {
                    numero = 1;
                }
                break;
        }
        
        return numero;
        
    } catch (erro) {
        return 1;
    }
}

/**
 * Obtém o nome do arquivo .ai baseado no nome da textura
 */
function obterNomeArquivoTextura(texturaNome) {
    try {
        // Validação de entrada
        if (!texturaNome || typeof texturaNome !== 'string') {
            return "Alpha.ai";
        }
        
        // Mapeamento direto dos nomes das texturas para arquivos .ai
        switch(texturaNome) {
            // LINHAS
            case "Alpha": return "Alpha.ai";
            case "LetteringLine": return "LetteringLine.ai";
            case "OrigamiLine": return "OrigamiLine.ai";
            case "GMline": return "GMline.ai";
            case "PMline": return "PMline.ai";
            
            // LINHAS CRUZADAS
            case "GMcrossedline": return "GMcrossedline.ai";
            case "PMcrossedline": return "PMcrossedline.ai";
            
            // FORMAS GEOMÉTRICAS
            case "Round": return "Round.ai";
            case "Square": return "Square.ai";
            case "Square_rectangle": return "Square_rectangle.ai";
            case "Heart": return "Heart.ai";
            
            // PADRÕES ORGÂNICOS
            case "Beehive": return "Beehive.ai";
            case "GMfoliage": return "GMfoliage.ai";
            case "PMfoliage": return "PMfoliage.ai";
            case "Gingerbread": return "Gingerbread.ai";
            
            // PADRÕES COMPLEXOS
            case "Boucle": return "Boucle.ai";
            case "MeliMelo": return "MeliMelo.ai";
            case "Wave": return "Wave.ai";
            
            // CALISSONS
            case "GMcalisson": return "GMcalisson.ai";
            case "PMcalisson": return "PMcalisson.ai";
            
            // SPAGHETTI
            case "GMSpaghetti": return "GMSpaghetti.ai";
            case "MMSpaghetti": return "MMSpaghetti.ai";
            case "PMSpaghetti": return "PMSpaghetti.ai";
            
            // ESTRELAS
            case "etoileGM": return "etoileGM.ai";
            case "etoilePM": return "etoilePM.ai";
            
            // Fallback para texturas antigas
            default:
                if (texturaNome.indexOf("Texture") === 0) {
                    var numero = parseInt(texturaNome.replace("Texture ", ""));
                    return "texture" + numero + ".ai";
                } else {
                    return "Alpha.ai";
                }
        }
        
    } catch (erro) {
        return "Alpha.ai";
    }
}

/**
 * Obtém o nome do arquivo PNG para preview baseado no nome da textura
 */
function obterNomeArquivoPNG(texturaNome) {
    try {
        // Validação de entrada
        if (!texturaNome || typeof texturaNome !== 'string') {
            return "Alpha.png";
        }
        
        var resultado;
        
        // Mapeamento atualizado - agora todos os PNGs existem com nomes corretos
        switch(texturaNome) {
            case "Alpha": 
                resultado = "Alpha.png";
                break;
            case "LetteringLine": 
                resultado = "LetteringLine.png";
                break;
            case "OrigamiLine": 
                resultado = "OrigamiLine.png";
                break;
            case "GMline": 
                resultado = "GMline.png";
                break;
            case "PMline": 
                resultado = "PMline.png";
                break;
            case "GMcrossedline": 
                resultado = "GMcrossedline.png";
                break;
            case "PMcrossedline": 
                resultado = "PMcrossedline.png";
                break;
            case "Round": 
                resultado = "Round.png";
                break;
            case "Square": 
                resultado = "Square.png";
                break;
            case "Square_rectangle": 
                resultado = "Square_rectangle.png";
                break;
            case "Heart": 
                resultado = "Heart.png";
                break;
            case "Beehive": 
                resultado = "Beehive.png";
                break;
            case "GMfoliage": 
                resultado = "GMfoliage.png";
                break;
            case "PMfoliage": 
                resultado = "PMfoliage.png";
                break;
            case "Gingerbread": 
                resultado = "Gingerbread.png";
                break;
            case "Boucle": 
                resultado = "Boucle.png";
                break;
            case "MeliMelo": 
                resultado = "MeliMelo.png";
                break;
            case "Wave": 
                resultado = "Wave.png";
                break;
            case "GMcalisson": 
                resultado = "GMcalisson.png";
                break;
            case "PMcalisson": 
                resultado = "PMcalisson.png";
                break;
            case "GMSpaghetti": 
                resultado = "GMSpaghetti.png";
                break;
            case "MMSpaghetti": 
                resultado = "MMSpaghetti.png";
                break;
            case "PMSpaghetti": 
                resultado = "PMSpaghetti.png";
                break;
            case "etoileGM": 
                resultado = "etoileGM.png";
                break;
            case "etoilePM": 
                resultado = "etoilePM.png";
                break;
            
            // Fallback para texturas antigas
            default:
                if (texturaNome.indexOf("Texture") === 0) {
                    var numero = parseInt(texturaNome.replace("Texture ", ""));
                    resultado = "texture" + numero + ".png";
                } else {
                    resultado = "Alpha.png";
                }
                break;
        }
        
        return resultado;
        
    } catch (erro) {
        return "Alpha.png";
    }
}

/**
 * Filtra componentes PRINT conforme o uso selecionado (interior/exterior)
 * @param {string} uso - "interior" ou "exterior"
 * @param {object} dados - Objeto de dados carregado do database2.json
 * @param {function} t - Função de tradução
 * @returns {Array} Lista de nomes de componentes print compatíveis
 */
function filtrarComponentesPrintPorUso(uso, dados, t) {
    logProtegidoFiltragem("Iniciando filtragem de componentes PRINT por uso: " + uso, logs.TIPOS_LOG.FUNCTION);
    try {
        if (!dados || !dados.componentes) {
            logProtegidoFiltragem("Dados inválidos para filtragem de PRINT por uso", logs.TIPOS_LOG.WARNING);
            return [];
        }

        function normalizarTexto(valor) {
            if (!valor) return "";
            var txt = String(valor).toLowerCase();
            txt = txt.replace(/[áàâãä]/g, "a");
            txt = txt.replace(/[éèêë]/g, "e");
            txt = txt.replace(/[íìîï]/g, "i");
            txt = txt.replace(/[óòôõö]/g, "o");
            txt = txt.replace(/[úùûü]/g, "u");
            txt = txt.replace(/ç/g, "c");
            txt = txt.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
            return txt;
        }

        function ehFlexiPlus(nomeNorm) {
            return nomeNorm.indexOf("flexi+") !== -1 || nomeNorm.indexOf("flexi +") !== -1;
        }

        function ehComponentePrint(nomeNorm) {
            return nomeNorm.indexOf("print") !== -1 || ehFlexiPlus(nomeNorm);
        }

        function ehInterior(nomeNorm) {
            return (
                nomeNorm === "recyprint" ||
                ehFlexiPlus(nomeNorm) ||
                (nomeNorm.indexOf("ignifuge") !== -1 && nomeNorm.indexOf("print") !== -1)
            );
        }

        function ehExterior(nomeNorm) {
            return (
                nomeNorm === "bioprint" ||
                nomeNorm === "recyprint" ||
                nomeNorm === "flexiprint" ||
                ehFlexiPlus(nomeNorm)
            );
        }

        var usoNorm = normalizarTexto(uso || "");
        var isInterior = usoNorm.indexOf("interieur") !== -1 || usoNorm.indexOf("interior") !== -1;
        var isExterior = usoNorm.indexOf("exterieur") !== -1 || usoNorm.indexOf("exterior") !== -1;
        var listaTodosPrint = [];
        var listaFinal = [];

        for (var i = 0; i < dados.componentes.length; i++) {
            var nomeOriginal = dados.componentes[i].nome;
            var nomeNorm = normalizarTexto(nomeOriginal);
            if (!ehComponentePrint(nomeNorm)) {
                continue;
            }

            if (listaTodosPrint.indexOf(nomeOriginal) === -1) {
                listaTodosPrint.push(nomeOriginal);
            }

            if ((!isInterior && !isExterior) ||
                (isInterior && ehInterior(nomeNorm)) ||
                (isExterior && ehExterior(nomeNorm))) {
                if (listaFinal.indexOf(nomeOriginal) === -1) {
                    listaFinal.push(nomeOriginal);
                }
            }
        }

        // Fallback de segurança: nunca deixar dropdown PRINT vazio quando houver prints na base.
        if (listaFinal.length === 0 && listaTodosPrint.length > 0) {
            logProtegidoFiltragem("Filtragem por uso ficou vazia. Aplicando fallback com todos os PRINT.", logs.TIPOS_LOG.WARNING);
            listaFinal = listaTodosPrint;
        }

        logProtegidoFiltragem("Filtragem PRINT por uso concluída: " + listaFinal.length + " encontrados", logs.TIPOS_LOG.INFO);
        return listaFinal;
    } catch (erro) {
        logProtegidoFiltragem("Erro ao filtrar PRINT por uso: " + erro.message, logs.TIPOS_LOG.ERROR);
        return [];
    }
}

// Export global
$.global.funcoesFiltragem = {
    filtrarComponentes: filtrarComponentes,
    getComponentesComCombinacoes: getComponentesComCombinacoes,
    getCoresDisponiveisBolas: getCoresDisponiveisBolas,
    preencherCoresBioprint: preencherCoresBioprint,
    obterNumeroTextura: obterNumeroTextura,
    obterNomeArquivoTextura: obterNomeArquivoTextura,
    obterNomeArquivoPNG: obterNomeArquivoPNG
}; 

// Exportar função no global
if (!$.global.funcoesFiltragem) {
    $.global.funcoesFiltragem = {};
}
$.global.funcoesFiltragem.filtrarComponentesPrintPorUso = filtrarComponentesPrintPorUso; 
