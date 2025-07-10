/**
 * funcoesLegenda.jsx
 * 
 * Arquivo dedicado ao processamento e geração de legendas do sistema Legenda.
 * Contém funções relacionadas à construção, formatação e processamento de legendas.
 * 
 * Dependências:
 * - funcoes.jsx: funções utilitárias (removerDuplicatas, criarLinhaReferencia, etc.)
 * - alfabeto.jsx: funções de processamento de alfabeto
 * - regras.jsx: funções de formatação de regras
 * - translations.js: função de tradução t()
 * - logs.jsx: sistema de logs (opcional)
 * 
 * @author Sistema Legenda
 * @version 1.0
 */

// Verificar se o sistema de logs está disponível
var logsDisponivel = typeof logs !== 'undefined' && logs.adicionarLog;

/**
 * Função para registrar logs se o sistema estiver disponível
 * @param {string} mensagem - Mensagem a ser registrada
 * @param {string} tipo - Tipo do log (info, warning, error, function)
 */
function logLegenda(mensagem, tipo) {
    if (logsDisponivel) {
        logs.adicionarLog(mensagem, tipo);
    }
}

/**
 * Gera a frase principal da legenda
 * @param {Object} parametros - Objeto com parâmetros necessários
 * @param {string} parametros.palavraDigitada - Palavra digitada do alfabeto
 * @param {string} parametros.campoNomeTipo - Texto do campo nome/tipo
 * @param {string} parametros.escolhaNomeTipo - Seleção do tipo (Tipo ou outro)
 * @param {boolean} parametros.alfabetoUsado - Se o alfabeto foi usado
 * @param {string} parametros.corBioprint - Cor do bioprint
 * @param {string} parametros.listaL - Seleção da lista L
 * @param {Array} parametros.componentesTexto - Array com texto dos componentes
 * @param {Object} parametros.primeiroComponenteExtra - Primeiro componente extra
 * @param {Array} parametros.todasBolas - Array com todas as bolas
 * @param {Array} parametros.bolasCompostas - Array com bolas compostas
 * @param {number} parametros.totalBolas - Total de bolas
 * @param {boolean} parametros.checkStructure - Se estrutura está marcada
 * @param {string} parametros.corStructure - Cor da estrutura
 * @returns {string} Frase principal formatada
 */
function gerarFrasePrincipal(parametros) {
    logLegenda("Iniciando geração da frase principal", "function");
    
    try {
        var nomeTipo = parametros.palavraDigitada || parametros.campoNomeTipo;
        var prefixoNomeTipo = parametros.escolhaNomeTipo === "Tipo" ? "type " : "";
        var preposicao = parametros.alfabetoUsado ? "en" : "avec";
        var decorTexto = "décor";

        // Aplicar regra 2D/3D se as dimensões estiverem disponíveis
        var classificacao2D3D = "";
        if (parametros.dimensoes && typeof regras !== 'undefined' && regras.classificar2Dou3D) {
            var resultado2D3D = regras.classificar2Dou3D(parametros.dimensoes);
            if (resultado2D3D.classificacao) {
                classificacao2D3D = " " + resultado2D3D.classificacao;
                logLegenda("Classificação 2D/3D aplicada: " + resultado2D3D.classificacao + " (" + resultado2D3D.motivo + ")", "info");
                logLegenda("Dimensões encontradas: " + resultado2D3D.dimensoesEncontradas.join(", "), "info");
            } else {
                logLegenda("Nenhuma classificação 2D/3D aplicada: " + resultado2D3D.motivo, "info");
            }
        } else {
            logLegenda("Regra 2D/3D não aplicada: dimensões ou função não disponíveis", "info");
        }

        var frasePrincipal = "Logo " + (parametros.listaL || "") + ": " + 
                             decorTexto + " " + prefixoNomeTipo + "\"" + nomeTipo + "\"" + classificacao2D3D + " " + preposicao;

        if (parametros.alfabetoUsado) {
            frasePrincipal += " bioprint " + (parametros.corBioprint || "");
        }

        // Adicionar componentes
        if (parametros.componentesTexto && parametros.componentesTexto.length > 0) {
            frasePrincipal += " " + parametros.componentesTexto.join(", ");
        }

        // Adicionar todos os componentes extras
        if (parametros.todosComponentesExtras && parametros.todosComponentesExtras.length > 0) {
            var nomesExtras = [];
            for (var i = 0; i < parametros.todosComponentesExtras.length; i++) {
                nomesExtras.push(parametros.todosComponentesExtras[i].nome);
            }
            frasePrincipal += ", " + nomesExtras.join(", ");
            logLegenda("Adicionados " + nomesExtras.length + " componentes extras na frase principal: " + nomesExtras.join(", "), "info");
        }

        // Adicionar as bolas
        if ((parametros.todasBolas && parametros.todasBolas.length > 0) || 
            (parametros.bolasCompostas && parametros.bolasCompostas.length > 0)) {
            var textoBoule = parametros.totalBolas > 1 ? "boules" : "boule";
            frasePrincipal += ", " + textoBoule + " " + parametros.todasBolas.join(", ");
            if (parametros.bolasCompostas && parametros.bolasCompostas.length > 0) {
                frasePrincipal += ", boules composées " + parametros.bolasCompostas.join(", ");
            }
        }

        // Adicionar estrutura
        frasePrincipal += ", sur structure aluminium";
        if (parametros.checkStructure) {
            frasePrincipal += " laquée " + (parametros.corStructure || "");
        }
        frasePrincipal += ".";

        logLegenda("Frase principal gerada com sucesso", "info");
        return frasePrincipal;
        
    } catch (erro) {
        logLegenda("Erro ao gerar frase principal: " + erro, "error");
        return "Erro ao gerar frase principal";
    }
}

/**
 * Processa e agrupa os componentes da legenda
 * @param {Array} itensLegenda - Array com todos os itens da legenda
 * @returns {Object} Objeto com componentes agrupados e referências
 */
function processarComponentes(itensLegenda) {
    logLegenda("Iniciando processamento de componentes", "function");
    
    try {
        var componentesAgrupados = {};
        var componentesReferencias = [];
        var itensProcessados = {};
        var texturasAdicionadas = [];

        // Procurar por componentes e texturas
        for (var i = 0; i < itensLegenda.length; i++) {
            var item = itensLegenda[i];
            
            if (item.tipo === "textura") {
                var numeroTextura = item.referencia.match(/\d+/)[0];
                if (!funcoes.arrayContains(texturasAdicionadas, numeroTextura)) {
                    texturasAdicionadas.push(numeroTextura);
                }
            } else if (item.tipo === "componente") {
                var nomeComponente = item.nome.split(' ')[0];
                var corComponente = item.nome.split(' ').slice(1).join(' ');
                
                if (!componentesAgrupados[nomeComponente]) {
                    componentesAgrupados[nomeComponente] = [];
                }
                
                if (!funcoes.arrayContains(componentesAgrupados[nomeComponente], corComponente)) {
                    componentesAgrupados[nomeComponente].push(corComponente);
                }
                
                if (!itensProcessados[item.referencia + item.unidade]) {
                    componentesReferencias.push(funcoes.criarLinhaReferencia(item));
                    itensProcessados[item.referencia + item.unidade] = true;
                }
            }
        }

        // Definir a ordem dos componentes
        var ordemComponentes = [
            'BIOPRINT',
            'RECYPRINT',
            'FLEXIPRINT',
            'MOQUETTE',
            'CAMOUFLAGE',
            'FIL LUMIERE',
            'LUCIOLES',
            'STALACTITS',
            'RIDEAUX',
            'FIL COMÈTE',
            'SOFT XLED',
            'BOULE ANIMÉ',
            'BOULES ANIMÉS',
            'BOUQUETS',
            'ECLAT ANIMÉ',
            'ECLATS ANIMÉS',
            'FLAME BOULE',
            'FLAME BOULES',
            'TIGES X-LED 0,50M',
            'TIGES X-LED 0,80M',
            'XLED SPIRAL',
            'XLED STAR'
        ];

        var ordemUnidades = ['m2', 'ml', 'units'];

        // Ordenar componentesReferencias
        componentesReferencias.sort(function(a, b) {
            var infoA = funcoes.extrairInfoComponente(a);
            var infoB = funcoes.extrairInfoComponente(b);
            
            // Primeiro compara pelo componente base usando a ordem definida
            var posA = 999;
            var posB = 999;
            
            for (var i = 0; i < ordemComponentes.length; i++) {
                if (infoA.componente === ordemComponentes[i].toLowerCase()) {
                    posA = i;
                }
                if (infoB.componente === ordemComponentes[i].toLowerCase()) {
                    posB = i;
                }
            }
            
            if (posA !== posB) {
                return posA - posB;
            }
            
            // Se mesmo componente, ordena por cor
            if (infoA.cor !== infoB.cor) {
                return infoA.cor.localeCompare(infoB.cor);
            }
            
            // Se mesma cor, ordena por unidade (m2 antes de ml)
            var unidadeA = funcoes.encontrarIndice(ordemUnidades, infoA.unidade);
            var unidadeB = funcoes.encontrarIndice(ordemUnidades, infoB.unidade);
            
            if (unidadeA === -1) unidadeA = 999;
            if (unidadeB === -1) unidadeB = 999;
            
            return unidadeA - unidadeB;
        });

        // Ordenar componentes agrupados
        var componentesOrdenados = [];
        for (var nomeComponente in componentesAgrupados) {
            if (componentesAgrupados.hasOwnProperty(nomeComponente)) {
                componentesOrdenados.push(nomeComponente);
            }
        }
        
        componentesOrdenados.sort(function(a, b) {
            var posA = 999;
            var posB = 999;
            
            for (var i = 0; i < ordemComponentes.length; i++) {
                if (a === ordemComponentes[i]) {
                    posA = i;
                }
                if (b === ordemComponentes[i]) {
                    posB = i;
                }
            }
            
            return posA - posB;
        });
        
        // Construir componentesTexto usando a ordem correta
        var componentesTexto = [];
        for (var i = 0; i < componentesOrdenados.length; i++) {
            var nomeComponente = componentesOrdenados[i];
            componentesTexto.push(nomeComponente + " " + componentesAgrupados[nomeComponente].join(", "));
        }

        logLegenda("Processamento de componentes concluído: " + componentesTexto.length + " componentes", "info");
        
        return {
            componentesTexto: componentesTexto,
            componentesReferencias: componentesReferencias,
            texturasAdicionadas: texturasAdicionadas
        };
        
    } catch (erro) {
        logLegenda("Erro ao processar componentes: " + erro, "error");
        return {
            componentesTexto: [],
            componentesReferencias: [],
            texturasAdicionadas: []
        };
    }
}

/**
 * Processa e conta as bolas da legenda
 * @param {Array} itensLegenda - Array com todos os itens da legenda
 * @returns {Object} Objeto com informações processadas das bolas
 */
function processarBolas(itensLegenda) {
    logLegenda("Iniciando processamento de bolas", "function");
    
    try {
        var bolasCores = [];
        var totalBolas = 0;
        var contagemBolas = {};
        var bolasCompostas = false;
        var bolesContadas = [];
        var bolasProcessadas = {};

        // Processar bolas
        for (var i = 0; i < itensLegenda.length; i++) {
            var item = itensLegenda[i];
            
            if (item.tipo === "bola") {
                var corBola = item.nome.split(' ')[1];
                if (!funcoes.arrayContains(bolasCores, corBola)) {
                    bolasCores.push(corBola);
                }
                
                totalBolas += item.quantidade;
                var chaveBola = item.referencia || item.nome;
                
                if (!contagemBolas[chaveBola]) {
                    contagemBolas[chaveBola] = 0;
                }
                contagemBolas[chaveBola] += item.quantidade;
                
                if (item.nome.toLowerCase().indexOf("composta") !== -1) {
                    bolasCompostas = true;
                }
                
                if (!bolasProcessadas[chaveBola] || item.unidade === "units") {
                    bolasProcessadas[chaveBola] = item;
                }
            }
        }

        // Separar bolas compostas
        var bolasCompostasArray = [];
        for (var i = 0; i < itensLegenda.length; i++) {
            if (itensLegenda[i].tipo === "bola" && itensLegenda[i].composta) {
                bolasCompostasArray.push(itensLegenda[i].nome);
            }
        }

        // Remover duplicatas
        var todasBolas = [];
        for (var i = 0; i < bolasCores.length; i++) {
            todasBolas.push(bolasCores[i]);
        }
        for (var i = 0; i < bolesContadas.length; i++) {
            todasBolas.push(bolesContadas[i]);
        }
        
        todasBolas = funcoes.removerDuplicatas(todasBolas);
        bolasCompostasArray = funcoes.removerDuplicatas(bolasCompostasArray);

        logLegenda("Processamento de bolas concluído: " + totalBolas + " bolas, " + todasBolas.length + " cores", "info");
        
        return {
            todasBolas: todasBolas,
            bolasCompostas: bolasCompostasArray,
            totalBolas: totalBolas,
            bolasProcessadas: bolasProcessadas,
            contagemBolas: contagemBolas
        };
        
    } catch (erro) {
        logLegenda("Erro ao processar bolas: " + erro, "error");
        return {
            todasBolas: [],
            bolasCompostas: [],
            totalBolas: 0,
            bolasProcessadas: {},
            contagemBolas: {}
        };
    }
}

/**
 * Processa os componentes extras da legenda
 * @param {Array} itensLegenda - Array com todos os itens da legenda
 * @returns {Object} Objeto com todos os componentes extras e primeiro componente extra (para compatibilidade)
 */
function processarComponentesExtras(itensLegenda) {
    logLegenda("Iniciando processamento de componentes extras", "function");
    
    try {
        var todosComponentesExtras = [];
        var primeiroComponenteExtra = null;

        // Processar todos os componentes extras
        for (var i = 0; i < itensLegenda.length; i++) {
            if (itensLegenda[i].tipo === "extra") {
                todosComponentesExtras.push(itensLegenda[i]);
                
                // Manter o primeiro para compatibilidade
                if (!primeiroComponenteExtra) {
                    primeiroComponenteExtra = itensLegenda[i];
                }
            }
        }

        logLegenda("Processamento de componentes extras concluído: " + todosComponentesExtras.length + " extras", "info");
        
        return {
            todosComponentesExtras: todosComponentesExtras,
            primeiroComponenteExtra: primeiroComponenteExtra,  // manter para compatibilidade
            componentesExtras: todosComponentesExtras.slice(1)  // manter para compatibilidade
        };
        
    } catch (erro) {
        logLegenda("Erro ao processar componentes extras: " + erro, "error");
        return {
            todosComponentesExtras: [],
            primeiroComponenteExtra: null,
            componentesExtras: []
        };
    }
}

/**
 * Processa as observações da legenda
 * @param {string} campoObs - Texto das observações
 * @returns {string} Observações processadas ou string vazia
 */
function processarObservacoes(campoObs) {
    logLegenda("Iniciando processamento de observações", "function");
    
    try {
        if (campoObs && campoObs.text && campoObs.text.toString().replace(/\s/g, '').length > 0) {
            var observacaoCodificada = funcoes.encodeObservacao(campoObs.text);
            logLegenda("Observação processada: " + observacaoCodificada, "info");
            return "Obs: " + observacaoCodificada;
        }
        
        return "";
        
    } catch (erro) {
        logLegenda("Erro ao processar observações: " + erro, "error");
        return "";
    }
}

/**
 * Processa as dimensões da legenda
 * @param {Array} dimensoes - Array com nomes das dimensões
 * @param {Object} grupoDimensoes - Grupo de elementos de dimensões
 * @returns {Array} Array com dimensões formatadas
 */
function processarDimensoes(dimensoes, grupoDimensoes) {
    logLegenda("Iniciando processamento de dimensões", "function");
    
    try {
        var dimensoesValidas = [];
        
        for (var i = 0; i < dimensoes.length; i++) {
            var valorDimensao = grupoDimensoes.children[i*2 + 1].text;
            if (valorDimensao !== "") {
                var dimensao = dimensoes[i];
                if (dimensao === "⌀") {
                    dimensao = "\u00D8";
                }
                dimensoesValidas.push(dimensao + ": " + regras.formatarDimensao(valorDimensao));
            }
        }

        logLegenda("Processamento de dimensões concluído: " + dimensoesValidas.length + " dimensões", "info");
        
        return dimensoesValidas;
        
    } catch (erro) {
        logLegenda("Erro ao processar dimensões: " + erro, "error");
        return [];
    }
}

/**
 * Processa a contagem de elementos
 * @param {Array} itensLegenda - Array com todos os itens da legenda
 * @returns {Array} Array com texto de contagem formatado
 */
function processarContagemElementos(itensLegenda) {
    logLegenda("Iniciando processamento de contagem de elementos", "function");
    
    try {
        var contagemElementosTexto = [];
        
        for (var i = 0; i < itensLegenda.length; i++) {
            if (itensLegenda[i].tipo === "contagem") {
                var linhas = itensLegenda[i].texto.split('\n');
                contagemElementosTexto.push(linhas[0]); // Adiciona a primeira linha (total)
                
                for (var j = 1; j < linhas.length; j++) {
                    var linha = linhas[j];
                    // Verifica se a linha contém informações sobre uma bola
                    if (linha.indexOf("boule") !== -1) {
                        // Adiciona "(units)" após a medida, mantendo o formato original
                        linha = linha.replace(/(\d+(?:,\d+)?\s*m)/, "$1 (units)");
                    }
                    contagemElementosTexto.push(linha);
                }
                break;
            }
        }

        logLegenda("Processamento de contagem concluído: " + contagemElementosTexto.length + " linhas", "info");
        
        return contagemElementosTexto;
        
    } catch (erro) {
        logLegenda("Erro ao processar contagem de elementos: " + erro, "error");
        return [];
    }
}

/**
 * Processa os campos opcionais Usage e Quantité prévue
 * @param {Object} campoUsage - Dropdown de Usage
 * @param {Object} campoQuantitePrevu - Campo de Quantité prévue
 * @returns {Array} Array com texto dos campos opcionais formatado
 */
function processarCamposOpcionais(campoUsage, campoQuantitePrevu) {
    logLegenda("Iniciando processamento de campos opcionais", "function");
    
    try {
        var camposOpcionaisTexto = [];

        // Processar campo Usage
        if (campoUsage && campoUsage.selection && campoUsage.selection.index > 0 && campoUsage.selection.text) {
            var usageTexto = "Usage: " + campoUsage.selection.text;
            camposOpcionaisTexto.push(usageTexto);
            logLegenda("Campo Usage processado: " + usageTexto, "info");
        }

        // Processar campo Quantité prévue
        if (campoQuantitePrevu && campoQuantitePrevu.text !== undefined) {
            // Converter para string e remover espaços manualmente
            var textoQuantite = String(campoQuantitePrevu.text);
            var textoLimpo = textoQuantite.replace(/^\s+/, '').replace(/\s+$/, '');
            
            if (textoLimpo !== "") {
                var quantiteTexto = "Quantité prévue: " + textoLimpo;
                camposOpcionaisTexto.push(quantiteTexto);
                logLegenda("Campo Quantité prévue processado: " + quantiteTexto, "info");
            }
        }

        logLegenda("Processamento de campos opcionais concluído: " + camposOpcionaisTexto.length + " campos", "info");
        
        return camposOpcionaisTexto;
        
    } catch (erro) {
        logLegenda("Erro ao processar campos opcionais: " + erro, "error");
        return [];
    }
}

/**
 * Função principal para atualizar o preview da legenda
 * @param {Object} parametros - Objeto com todos os parâmetros necessários
 * @returns {Object} Objeto com texto da legenda e texturas
 */
function atualizarPreview(parametros) {
    logLegenda("Iniciando atualização do preview da legenda", "function");
    
    try {
        // Validar parâmetros de entrada
        if (!parametros || !parametros.itensLegenda) {
            logLegenda("Erro: Parâmetros inválidos para atualizarPreview", "error");
            return {
                texto: "Erro: Parâmetros inválidos",
                texturas: []
            };
        }

        var previewText = [];
        var itensLegenda = parametros.itensLegenda;

        // Usar função modularizada para processar o alfabeto
        var resultadoAlfabeto = gerarPreviewAlfabeto(itensLegenda);
        var referenciasAlfabeto = resultadoAlfabeto.referenciasAlfabeto;
        var alfabetoUsado = resultadoAlfabeto.alfabetoUsado;
        var palavraDigitada = resultadoAlfabeto.palavraDigitada;
        var corBioprint = resultadoAlfabeto.corBioprint;

        // Processar componentes
        var resultadoComponentes = processarComponentes(itensLegenda);
        var componentesTexto = resultadoComponentes.componentesTexto;
        var componentesReferencias = resultadoComponentes.componentesReferencias;
        var texturasAdicionadas = resultadoComponentes.texturasAdicionadas;

        // Processar bolas
        var resultadoBolas = processarBolas(itensLegenda);
        var todasBolas = resultadoBolas.todasBolas;
        var bolasCompostas = resultadoBolas.bolasCompostas;
        var totalBolas = resultadoBolas.totalBolas;
        var bolasProcessadas = resultadoBolas.bolasProcessadas;

        // Processar componentes extras
        var resultadoExtras = processarComponentesExtras(itensLegenda);
        var todosComponentesExtras = resultadoExtras.todosComponentesExtras;
        var primeiroComponenteExtra = resultadoExtras.primeiroComponenteExtra;
        var componentesExtras = resultadoExtras.componentesExtras;

        // Preparar dimensões para a regra 2D/3D
        var dimensoesProcessadas = null;
        if (parametros.dimensoes && parametros.grupoDimensoes) {
            dimensoesProcessadas = {
                H: "",
                L: "",
                P: "",
                diametro: ""
            };
            
            // Mapear dimensões dos campos da interface
            for (var i = 0; i < parametros.dimensoes.length; i++) {
                var valorDimensao = parametros.grupoDimensoes.children[i*2 + 1].text;
                var tipoDimensao = parametros.dimensoes[i];
                
                if (tipoDimensao === "H") {
                    dimensoesProcessadas.H = valorDimensao;
                } else if (tipoDimensao === "L") {
                    dimensoesProcessadas.L = valorDimensao;
                } else if (tipoDimensao === "P") {
                    dimensoesProcessadas.P = valorDimensao;
                } else if (tipoDimensao === "⌀") {
                    dimensoesProcessadas.diametro = valorDimensao;
                }
            }
            
            logLegenda("Dimensões processadas para regra 2D/3D: H=" + dimensoesProcessadas.H + 
                      ", L=" + dimensoesProcessadas.L + ", P=" + dimensoesProcessadas.P + 
                      ", ⌀=" + dimensoesProcessadas.diametro, "info");
        }

        // Gerar frase principal
        var parametrosFrase = {
            palavraDigitada: palavraDigitada,
            campoNomeTipo: parametros.campoNomeTipo ? parametros.campoNomeTipo.text : "",
            escolhaNomeTipo: parametros.escolhaNomeTipo ? parametros.escolhaNomeTipo.selection.text : "",
            alfabetoUsado: alfabetoUsado,
            corBioprint: corBioprint,
            listaL: parametros.listaL ? parametros.listaL.selection.text : "",
            componentesTexto: componentesTexto,
            todosComponentesExtras: todosComponentesExtras,
            primeiroComponenteExtra: primeiroComponenteExtra,  // manter para compatibilidade
            todasBolas: todasBolas,
            bolasCompostas: bolasCompostas,
            totalBolas: totalBolas,
            checkStructure: parametros.checkStructure ? parametros.checkStructure.value : false,
            corStructure: parametros.corStructure ? parametros.corStructure.selection.text : "",
            dimensoes: dimensoesProcessadas  // Adicionar dimensões processadas
        };

        var frasePrincipal = gerarFrasePrincipal(parametrosFrase);
        previewText.push(frasePrincipal);

        // Adicionar dimensões
        if (parametros.dimensoes && parametros.grupoDimensoes) {
            var dimensoesValidas = processarDimensoes(parametros.dimensoes, parametros.grupoDimensoes);
            if (dimensoesValidas.length > 0) {
                previewText.push("\u200B"); // Adiciona uma linha em branco extra
                previewText.push(dimensoesValidas.join(" - "));
            }
        }

        // Adicionar tipo de fixação
        if (parametros.listaFixacao && parametros.listaFixacao.selection) {
            previewText.push(t("fixacao") + " " + parametros.listaFixacao.selection.text);
        }

        // Adicionar campos opcionais (Usage e Quantité prévue) após fixação
        var camposOpcionaisTexto = processarCamposOpcionais(parametros.campoUsage, parametros.campoQuantitePrevu);
        if (camposOpcionaisTexto.length > 0) {
            previewText.push("\u200B"); // Linha de separação antes dos campos opcionais
            for (var i = 0; i < camposOpcionaisTexto.length; i++) {
                previewText.push(camposOpcionaisTexto[i]);
            }
            logLegenda("Campos opcionais adicionados à legenda com linha separadora: " + camposOpcionaisTexto.length + " campos", "info");
        }

        // Adicionar "Composants:" se houver componentes, alfabeto ou componentes extras
        var temComponentes = false;
        for (var i = 0; i < itensLegenda.length; i++) {
            if (itensLegenda[i].tipo === "componente" || 
                itensLegenda[i].tipo === "alfabeto" || 
                itensLegenda[i].tipo === "extra") {
                temComponentes = true;
                break;
            }
        }
        
        if (temComponentes) {
            previewText.push("\u200B"); // Linha em branco antes de "Composants:"
            previewText.push("Composants:");
            logLegenda("Secção 'Composants:' adicionada (componentes, alfabeto ou extras detectados)", "info");
        }

        // Adicionar referências do alfabeto
        for (var i = 0; i < referenciasAlfabeto.length; i++) {
            previewText = previewText.concat(referenciasAlfabeto[i].texto.split('\n'));
        }

        // Adicionar referências de componentes
        previewText = previewText.concat(componentesReferencias);
        
        // Adicionar contagem de bolas
        if (totalBolas > 0) {
            previewText.push("\u200B");
            var textoBouleContagem = totalBolas === 1 ? "boule" : "boules";
            previewText.push("Total de " + totalBolas + " " + textoBouleContagem + " :");
            for (var chaveBola in bolasProcessadas) {
                if (bolasProcessadas.hasOwnProperty(chaveBola)) {
                    var bolaItem = bolasProcessadas[chaveBola];
                    previewText.push(funcoes.criarLinhaReferencia(bolaItem));
                }
            }
        }

        // Adicionar contagem de elementos
        var contagemElementosTexto = processarContagemElementos(itensLegenda);
        if (contagemElementosTexto.length > 0) {
            previewText = previewText.concat(contagemElementosTexto);
        }

        // Adicionar componentes extras (já processados anteriormente)
        if (todosComponentesExtras.length > 0) {
            for (var i = 0; i < todosComponentesExtras.length; i++) {
                // Aplicar maiúsculas apenas no nome do componente extra na lista
                var textoComponenteExtra = todosComponentesExtras[i].texto;
                var nomeComponenteExtra = todosComponentesExtras[i].nome;
                
                // Substituir o nome pelo nome em maiúsculas no texto da linha de referência
                var textoComMaiusculas = textoComponenteExtra.replace(nomeComponenteExtra, nomeComponenteExtra.toUpperCase());
                
                previewText.push(textoComMaiusculas);
                logLegenda("Componente extra em maiúsculas adicionado na lista: " + nomeComponenteExtra.toUpperCase(), "info");
            }
        }

        // Adicionar observações
        if (parametros.campoObs) {
            var observacoes = processarObservacoes(parametros.campoObs);
            if (observacoes !== "") {
                previewText.push("\u200B");
                previewText.push(observacoes);
            }
        }

        logLegenda("Preview da legenda atualizado com sucesso", "info");
        
        // Retornar objeto com texto e texturas
        return {
            texto: previewText.join("\n"),
            texturas: texturasAdicionadas
        };
        
    } catch (erro) {
        logLegenda("Erro ao atualizar preview da legenda: " + erro, "error");
        return {
            texto: "Erro ao gerar legenda: " + erro,
            texturas: []
        };
    }
}

// Exportar todas as funções no escopo global
$.global.funcoesLegenda = {
    atualizarPreview: atualizarPreview,
    gerarFrasePrincipal: gerarFrasePrincipal,
    processarComponentes: processarComponentes,
    processarBolas: processarBolas,
    processarComponentesExtras: processarComponentesExtras,
    processarObservacoes: processarObservacoes,
    processarDimensoes: processarDimensoes,
    processarContagemElementos: processarContagemElementos,
    processarCamposOpcionais: processarCamposOpcionais
}; 