/**
 * Arquivo: bridge.jsx
 * Domínio: Comunicação via BridgeTalk e operações entre aplicações
 * 
 * Este arquivo contém todas as funções relacionadas à comunicação via BridgeTalk
 * entre o script principal e o Adobe Illustrator, incluindo contagem de bolas
 * e adição de legendas.
 * 
 * Funções principais:
 * - executarContagemBolas(): Executa contagem de bolas via BridgeTalk
 * - adicionarLegendaViaBridge(): Adiciona legenda no Illustrator via BridgeTalk
 * - prepararScriptIllustrator(): Prepara script para execução no Illustrator
 * - configurarBridgeTalk(): Configura comunicação BridgeTalk
 */

// Função auxiliar para logs protegidos
function logProtegido(mensagem, tipo) {
    if (typeof logs !== 'undefined' && logs.adicionarLog && logs.TIPOS_LOG) {
        logs.adicionarLog(mensagem, tipo);
    }
}

// Função auxiliar para verificar se é array (compatível ExtendScript)
function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

// Função para executar contagem de bolas via BridgeTalk
function executarContagemBolas(dados, textoResultado, callback) {
    logProtegido("DEBUG: Entrou em executarContagemBolas. typeof dados=" + (typeof dados) + ", dados.componentes=" + (dados && dados.componentes ? 'ok' : 'undefined'), logs.TIPOS_LOG.INFO);
    logProtegido("Iniciando contagem de bolas via BridgeTalk", logs.TIPOS_LOG.FUNCTION);
    
    try {
        // Validar dados
        if (!dados || typeof dados !== 'object' || !dados.componentes || !isArray(dados.componentes)) {
            logProtegido("Erro: Base de dados não acessível ou formato inválido", logs.TIPOS_LOG.ERROR);
            var mensagemErro = "Erro: A base de dados não está acessível ou está em um formato inválido.";
            if (callback) callback(mensagemErro, null);
            return;
        }
        
        logProtegido("Base de dados validada, preparando BridgeTalk", logs.TIPOS_LOG.INFO);
        var pastaScripts = File($.fileName).parent.fsName.replace(/\\/g, '/');
        logProtegido("Pasta de scripts: " + pastaScripts, logs.TIPOS_LOG.INFO);
        
        // Configurar BridgeTalk
        var bt = new BridgeTalk();
        bt.target = "illustrator";
        
        // Preparar código para execução no Illustrator
        var btCode = ''
            + '$.evalFile("' + pastaScripts + '/json2.js");'
            + '$.evalFile("' + pastaScripts + '/logs.jsx");'
            + '$.evalFile("' + pastaScripts + '/funcoes.jsx");'
            + '$.evalFile("' + pastaScripts + '/database.jsx");'
            + '(' + funcoes.contarBolasNaArtboard.toString() + ')();';
        
        bt.body = btCode;
        
        logProtegido("Código BridgeTalk preparado, enviando para Illustrator", logs.TIPOS_LOG.INFO);
        
        // Configurar callback de sucesso
        bt.onResult = function(resObj) {
            logProtegido("BridgeTalk retornou resultado", logs.TIPOS_LOG.INFO);
            logProtegido("Resultado bruto: " + resObj.body, logs.TIPOS_LOG.INFO);
            
            var resultado = resObj.body.split("|");
            var contagem, combinacoes;
            
            // Processar resultado
            for (var i = 0; i < resultado.length; i++) {
                var parte = resultado[i].split(":");
                if (parte[0] === "contagem") {
                    contagem = parseInt(parte[1]);
                } else if (parte[0] === "combinacoes") {
                    combinacoes = parte.slice(1).join(":");
                }
            }
            
            logProtegido("Contagem extraída: " + contagem, logs.TIPOS_LOG.INFO);
            logProtegido("Combinações extraídas: " + (combinacoes ? combinacoes.substring(0, 100) + "..." : "nenhuma"), logs.TIPOS_LOG.INFO);
            
            var textoCompleto = processarResultadoContagem(contagem, combinacoes);
            
            // Atualizar interface
            if (textoResultado) {
                textoResultado.text = textoCompleto;
                textoResultado.notify("onChange");
            }
            
            logProtegido("Resultado da contagem finalizado e exibido", logs.TIPOS_LOG.INFO);
            
            if (callback) callback(null, textoCompleto);
            ui.mostrarAlertaPersonalizado("Resultado atualizado na janela de contagem", "Sucesso");
        };
        
        // Configurar callback de erro
        bt.onError = function(err) {
            var mensagemErro = "Erro no BridgeTalk: " + err.body;
            logProtegido(mensagemErro, logs.TIPOS_LOG.ERROR);
            
            if (textoResultado) {
                textoResultado.text = mensagemErro;
                textoResultado.notify("onChange");
            }
            
                    if (callback) callback(mensagemErro, null);
        ui.mostrarAlertaPersonalizado(mensagemErro, "Erro");
    };
        
        logProtegido("Enviando requisição BridgeTalk", logs.TIPOS_LOG.INFO);
        bt.send();
        
    } catch (e) {
        var mensagemErro = "Erro ao iniciar contagem: " + (e.message || "Erro desconhecido") + "\nTipo de erro: " + (e.name || "Tipo de erro desconhecido");
        logProtegido("Exceção capturada: " + mensagemErro, logs.TIPOS_LOG.ERROR);
        
        if (textoResultado) {
            textoResultado.text = mensagemErro;
            textoResultado.notify("onChange");
        }
        
        if (callback) callback(mensagemErro, null);
        ui.mostrarAlertaPersonalizado(mensagemErro, "Erro");
    }
}

// Função para processar resultado da contagem de bolas
function processarResultadoContagem(contagem, combinacoes) {
    logProtegido("Processando resultado da contagem: " + contagem + " bolas", logs.TIPOS_LOG.FUNCTION);
    
    var textoCompleto = "";
    
    if (contagem !== undefined) {
        if (contagem === 0) {
            textoCompleto = "Resultado: " + (combinacoes || "Nenhum objeto selecionado") + "\n\n";
            logProtegido("Nenhuma bola encontrada", logs.TIPOS_LOG.INFO);
        } else {
            var textoBoule = contagem === 1 ? "boule" : "boules";
            textoCompleto = "Total de " + contagem + " " + textoBoule + " :\n";
            logProtegido("Processando " + contagem + " " + textoBoule, logs.TIPOS_LOG.INFO);
            
            if (combinacoes && combinacoes !== "Nenhum objeto selecionado") {
                var combArray = combinacoes.split(",");
                logProtegido("Processando " + (combArray.length - 1) + " combinações", logs.TIPOS_LOG.INFO);
                
                // Processar cada combinação
                for (var i = 1; i < combArray.length; i++) {
                    var combInfo = combArray[i].split("=");
                    if (combInfo.length === 3) {
                        var cor = decodeURIComponent(combInfo[0]);
                        var tamanho = combInfo[1].replace('.', ',');
                        var quantidade = combInfo[2];
                        textoCompleto += "boule " + cor + " ⌀ " + tamanho + " m: " + quantidade + "\n";
                        logProtegido("Combinação processada: " + cor + " ⌀ " + tamanho + " m: " + quantidade, logs.TIPOS_LOG.INFO);
                    } else {
                        textoCompleto += combArray[i] + "\n";
                        logProtegido("Combinação malformada: " + combArray[i], logs.TIPOS_LOG.WARNING);
                    }
                }
            } else {
                textoCompleto += "Nenhuma informação de combinação disponível\n";
                logProtegido("Nenhuma informação de combinação disponível", logs.TIPOS_LOG.WARNING);
            }
        }
    } else {
        textoCompleto = "Erro: Resultado inválido";
        logProtegido("Erro ao processar resultado: resultado inválido", logs.TIPOS_LOG.ERROR);
    }
    
    logProtegido("Processamento do resultado concluído", logs.TIPOS_LOG.INFO);
    return textoCompleto;
}

// Função para adicionar legenda via BridgeTalk
function adicionarLegendaViaBridge(nomeDesigner, legendaConteudo, texturas, palavraDigitada, tamanhoGXSelecionado, t, janela, pastaBaseLegenda, callback) {
    if (typeof logs !== 'undefined' && logs.adicionarLog && logs.TIPOS_LOG) {
        logProtegido("Iniciando adição de legenda via BridgeTalk", logs.TIPOS_LOG.FUNCTION);
    }
    if (typeof logs !== 'undefined' && logs.adicionarLog && logs.TIPOS_LOG) {
        logProtegido("Designer: " + nomeDesigner + ", Tamanho GX: " + tamanhoGXSelecionado, logs.TIPOS_LOG.INFO);
    }
    
    try {
        // Função que será executada no contexto do Illustrator
        var scriptIllustrator = function(nomeDesigner, conteudoLegenda, texturasString, palavraDigitada, tamanhoGX, pastaBaseLegenda) {
            
            // Função gerarNomeArquivoAlfabeto local para o BridgeTalk
            function gerarNomeArquivoAlfabeto(caractere, sufixoTamanho) {
                var mapeamento = {
                    "A": "GX214LW_" + sufixoTamanho + ".ai", "B": "GX215LW_" + sufixoTamanho + ".ai",
                    "C": "GX216LW_" + sufixoTamanho + ".ai", "D": "GX217LW_" + sufixoTamanho + ".ai",
                    "E": "GX218LW_" + sufixoTamanho + ".ai", "F": "GX219LW_" + sufixoTamanho + ".ai",
                    "G": "GX220LW_" + sufixoTamanho + ".ai", "H": "GX221LW_" + sufixoTamanho + ".ai",
                    "I": "GX222LW_" + sufixoTamanho + ".ai", "J": "GX223LW_" + sufixoTamanho + ".ai",
                    "K": "GX224LW_" + sufixoTamanho + ".ai", "L": "GX225LW_" + sufixoTamanho + ".ai",
                    "M": "GX226LW_" + sufixoTamanho + ".ai", "N": "GX227LW_" + sufixoTamanho + ".ai",
                    "O": "GX228LW_" + sufixoTamanho + ".ai", "P": "GX229LW_" + sufixoTamanho + ".ai",
                    "Q": "GX230LW_" + sufixoTamanho + ".ai", "R": "GX231LW_" + sufixoTamanho + ".ai",
                    "S": "GX232LW_" + sufixoTamanho + ".ai", "T": "GX233LW_" + sufixoTamanho + ".ai",
                    "U": "GX234LW_" + sufixoTamanho + ".ai", "V": "GX235LW_" + sufixoTamanho + ".ai",
                    "W": "GX236LW_" + sufixoTamanho + ".ai", "X": "GX237LW_" + sufixoTamanho + ".ai",
                    "Y": "GX238LW_" + sufixoTamanho + ".ai", "Z": "GX239LW_" + sufixoTamanho + ".ai",
                    "<3": "GX240LW_" + sufixoTamanho + ".ai", "#": "GX241LW_" + sufixoTamanho + ".ai"
                };
                return mapeamento[caractere] || "";
            }

            // Script de criação da legenda no Illustrator
            if (app.documents.length === 0) {
                app.documents.add();
            }
            
            var doc = app.activeDocument;
            var novaLayer = doc.layers.add();
            novaLayer.name = "Legenda";
            
            var artboardBounds = doc.artboards[0].artboardRect;
            
            // Função para obter nome do arquivo baseado no número da textura
            function obterNomeArquivoTextura(numeroTextura) {
                var num = parseInt(numeroTextura);
                switch(num) {
                    // LINHAS
                    case 1: return "Alpha.ai";
                    case 2: return "LetteringLine.ai";
                    case 3: return "OrigamiLine.ai";
                    case 4: return "GMline.ai";
                    case 5: return "PMline.ai";
                    
                    // LINHAS CRUZADAS
                    case 6: return "GMcrossedline.ai";
                    case 7: return "PMcrossedline.ai";
                    
                    // FORMAS GEOMÉTRICAS
                    case 8: return "Round.ai";
                    case 9: return "Square.ai";
                    case 10: return "Square_rectangle.ai";
                    case 11: return "Heart.ai";
                    
                    // PADRÕES ORGÂNICOS
                    case 12: return "Beehive.ai";
                    case 13: return "GMfoliage.ai";
                    case 14: return "PMfoliage.ai";
                    case 15: return "Gingerbread.ai";
                    
                    // PADRÕES COMPLEXOS
                    case 16: return "Boucle.ai";
                    case 17: return "MeliMelo.ai";
                    case 18: return "Wave.ai";
                    
                    // CALISSONS
                    case 19: return "GMcalisson.ai";
                    case 20: return "PMcalisson.ai";
                    
                    // SPAGHETTI
                    case 21: return "GMSpaghetti.ai";
                    case 22: return "MMSpaghetti.ai";
                    case 23: return "PMSpaghetti.ai";
                    
                    // ESTRELAS
                    case 24: return "etoileGM.ai";
                    case 25: return "etoilePM.ai";
                    
                    // Fallback para texturas antigas
                    default: return "texture" + numeroTextura + ".ai";
                }
            }

            // Processar texturas se existirem
            if (texturasString && texturasString !== "") {
                try {
                    // Usar o caminho base passado como parâmetro
                    var pastaScript = pastaBaseLegenda;
                    var texturas = texturasString ? texturasString.split(',') : [];
                    for (var t = 0; t < texturas.length; t++) {
                        if (texturas[t] && texturas[t] !== "") {
                            var numeroTextura = String(texturas[t]).replace(/[^0-9]/g, '');
                            if (numeroTextura) {
                                var nomeArquivo = obterNomeArquivoTextura(numeroTextura);
                                var caminhoTextura = pastaScript + "/resources/svg/" + nomeArquivo;
                                var arquivoTextura = new File(caminhoTextura);
                                // Removidos logs de debug excessivos para melhorar performance
                                // if (typeof logs !== 'undefined' && logs.adicionarLog) {
                                //     logs.adicionarLog("[BridgeTalk] Processando textura: " + numeroTextura, "info");
                                //     logs.adicionarLog("[BridgeTalk] Nome do arquivo: " + nomeArquivo, "info");
                                //     logs.adicionarLog("[BridgeTalk] Caminho do arquivo: " + caminhoTextura, "info");
                                //     logs.adicionarLog("[BridgeTalk] Arquivo existe: " + arquivoTextura.exists, "info");
                                // }
                                if (!arquivoTextura.exists) {
                                    ui.mostrarAlertaPersonalizado("[BridgeTalk] Arquivo não encontrado: " + caminhoTextura, "Erro");
                                }
                                if (arquivoTextura.exists) {
                                    var texturaItem = novaLayer.placedItems.add();
                                    texturaItem.file = arquivoTextura;
                                    texturaItem.position = [artboardBounds[0] + 400 + (t * 150), artboardBounds[1] - 100];
                                    texturaItem.embed();
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Continua mesmo se houver erro com texturas
                }
            }

            // Processar alfabeto se existir palavra digitada
            var alturaLetras = 200; // valor padrão
            try {
                if (palavraDigitada && palavraDigitada !== "") {
                    // Caminho dinâmico relativo à pasta do projeto (Legenda)
                    // Corrigir: usar pastaBaseLegenda para garantir consistência
                    var pastaScript = pastaBaseLegenda;
                    var caminhoAlfabeto = pastaScript + "/resources/alfabeto/";
                    // Configurar espaçamento e tamanho baseado no tamanho GX
                    var espacamentoHorizontal = (tamanhoGX === "1,40 m") ? 150 : 220;
                    var sufixoTamanho = (tamanhoGX === "1,40 m") ? "140" : "200";
                    alturaLetras = (tamanhoGX === "1,40 m") ? 200 : 300;
                    var posicaoX = artboardBounds[0] + 50;
                    // <3 é uma peça única; espaços separam letras sem inserir uma peça #.
                    var caracteres = palavraDigitada.toUpperCase().match(/<3|[A-Z#]|\s/g) || [];
                    for (var i = 0; i < caracteres.length; i++) {
                        var caractere = caracteres[i];
                        if (/\s/.test(caractere)) {
                            posicaoX += espacamentoHorizontal;
                            continue;
                        }
                        var nomeArquivo = gerarNomeArquivoAlfabeto(caractere, sufixoTamanho);
                        var caminhoArquivo = caminhoAlfabeto + nomeArquivo;
                        var arquivoAlfabeto = new File(caminhoArquivo);
                        // Removidos logs de debug excessivos para melhorar performance
                        // if (typeof logs !== 'undefined' && logs.adicionarLog) {
                        //     logs.adicionarLog("[BridgeTalk] Tentando carregar alfabeto: " + nomeArquivo, "info");
                        //     logs.adicionarLog("[BridgeTalk] Caminho do arquivo alfabeto: " + caminhoArquivo, "info");
                        //     logs.adicionarLog("[BridgeTalk] Arquivo existe: " + arquivoAlfabeto.exists, "info");
                        // }
                        if (!arquivoAlfabeto.exists) {
                            if (typeof logs !== 'undefined' && logs.adicionarLog) {
                                logs.adicionarLog("[BridgeTalk] Arquivo de letra NÃO encontrado: " + caminhoArquivo, "error");
                            }
                        }
                        if (arquivoAlfabeto.exists) {
                            var letraItem = novaLayer.placedItems.add();
                            letraItem.file = arquivoAlfabeto;
                            letraItem.position = [posicaoX, artboardBounds[1] - alturaLetras];
                            letraItem.embed();
                            posicaoX += espacamentoHorizontal;
                        }
                    }
                }
            } catch (e) {
                if (typeof logs !== 'undefined' && logs.adicionarLog) {
                    logs.adicionarLog("[BridgeTalk] Erro ao processar alfabeto: " + e, "error");
                }
                // Continua mesmo se houver erro com alfabeto
            }
            
            // Criar texto da legenda
            var textoLegenda = novaLayer.textFrames.add();
            var posicaoYLegenda = artboardBounds[1] - (palavraDigitada ? alturaLetras + 150 : 100);
            textoLegenda.position = [artboardBounds[0] + 50, posicaoYLegenda];
            
            var tamanhoFontePrincipal = 40;
            var tamanhoFonteBids = 40;
            
            // Configurar fonte e cor
            textoLegenda.textRange.characterAttributes.size = tamanhoFontePrincipal;
            textoLegenda.textRange.characterAttributes.fillColor = new RGBColor(0, 0, 0);
            
            try {
                textoLegenda.textRange.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
            } catch (e) {
                textoLegenda.textRange.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
            }
            
            // Adicionar linha Bids
            var textoBids = "Bids - " + nomeDesigner;
            var paragBids = textoLegenda.paragraphs.add(textoBids);
            paragBids.characterAttributes.size = tamanhoFonteBids;
            try {
                paragBids.characterAttributes.textFont = app.textFonts.getByName("Apercu-Bold");
            } catch (e) {
                paragBids.characterAttributes.textFont = app.textFonts.getByName("Arial-BoldMT");
            }
            paragBids.paragraphAttributes.spaceBefore = 0;
            paragBids.paragraphAttributes.spaceAfter = 0;

            // Processar linhas do conteúdo da legenda
            var linhas = conteudoLegenda.replace(/\r\n?/g, '\n').split('\n');
            
            for (var i = 0; i < linhas.length; i++) {
                var linha = linhas[i];
                
                // Correção específica para moquette blanc -> moquette blanche
                if (linha.indexOf("Logo") === 0 && linha.toLowerCase().indexOf("moquette blanc") !== -1) {
                    linha = linha.replace(/moquette blanc/i, "moquette blanche");
                }
                
                // Texto Unicode já foi transportado como JSON; %xx é texto literal.

                try {
                    var novoParag = textoLegenda.paragraphs.add(linha);
                } catch (e) {
                    // Continuar sem a linha problemática
                    continue;
                }
                novoParag.characterAttributes.size = tamanhoFontePrincipal;
                
                // Formatação especial para linha "Composants:"
                if (linha.indexOf("Composants:") === 0) {
                    var textoComposants = novoParag.characters[0];
                    textoComposants.length = "Composants:".length;
                    
                    try {
                        textoComposants.characterAttributes.textFont = app.textFonts.getByName("Apercu-Bold");
                    } catch (e) {
                        textoComposants.characterAttributes.textFont = app.textFonts.getByName("Arial-BoldMT");
                    }
                    
                    if (novoParag.characters.length > "Composants:".length) {
                        var textoRestante = novoParag.characters["Composants:".length];
                        textoRestante.length = novoParag.characters.length - "Composants:".length;
                        try {
                            textoRestante.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
                        } catch (e) {
                            textoRestante.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                        }
                    }
                } else {
                    try {
                        novoParag.characterAttributes.textFont = app.textFonts.getByName("Apercu-Regular");
                    } catch (e) {
                        novoParag.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
                    }
                }
                
                novoParag.paragraphAttributes.spaceBefore = 0;
                novoParag.paragraphAttributes.spaceAfter = 0;
            }

            // Ajustar limites geométricos
            textoLegenda.geometricBounds = [
                textoLegenda.geometricBounds[0],
                textoLegenda.geometricBounds[1],
                textoLegenda.geometricBounds[2],
                textoLegenda.geometricBounds[1] + 400
            ];

            return "success";
        };

        // Uma única serialização protege todos os campos, incluindo aspas e Unicode.
        var argumentos = JSON.stringify([
            nomeDesigner || "", legendaConteudo || "",
            isArray(texturas) ? texturas.join(',') : (texturas || ""),
            palavraDigitada || "", tamanhoGXSelecionado || "", pastaBaseLegenda || ""
        ]).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
        var scriptString = "(" + scriptIllustrator.toString() + ").apply(null, " + argumentos + ");";

        // Configurar BridgeTalk
        var bt = new BridgeTalk();
        bt.target = "illustrator";
        // O transporte do Illustrator altera barras de escape no corpo da mensagem.
        // Codificar o script completo mantém aspas, quebras de linha e Unicode intactos.
        bt.body = "eval(decodeURIComponent('" + encodeURIComponent(scriptString).replace(/'/g, "%27") + "'));";
        
        logProtegido("Script BridgeTalk preparado, enviando para Illustrator", logs.TIPOS_LOG.INFO);
        
        // Configurar callback de sucesso
        bt.onResult = function(resObj) {
            logProtegido("BridgeTalk retornou: " + resObj.body, logs.TIPOS_LOG.INFO);
            
            if (resObj.body === "success") {
                logProtegido("Legenda adicionada com sucesso", logs.TIPOS_LOG.INFO);
                if (callback) callback(null, "success");
            } else {
                var mensagemErro = "Ocorreu um problema ao adicionar a legenda: " + resObj.body;
                logProtegido(mensagemErro, logs.TIPOS_LOG.ERROR);
                ui.mostrarAlertaPersonalizado(mensagemErro, "Erro");
                if (callback) callback(mensagemErro, null);
            }
        };
        
        // Configurar callback de erro
        bt.onError = function(err) {
            var mensagemErro = "Erro ao adicionar legenda: " + err.body;
            logProtegido(mensagemErro, logs.TIPOS_LOG.ERROR);
            ui.mostrarAlertaPersonalizado(mensagemErro, "Erro");
            if (callback) callback(mensagemErro, null);
        };
        
        bt.send();
        
    } catch (e) {
        var mensagemErro = "Erro ao adicionar legenda: " + e + "\nLinha: " + e.line;
        logProtegido("Exceção capturada: " + mensagemErro, logs.TIPOS_LOG.ERROR);
        ui.mostrarAlertaPersonalizado(mensagemErro, "Erro");
        if (callback) callback(mensagemErro, null);
    }
}

// Mesmo escape JSON para todos os textos usados em literais de script.
function escaparStringParaBridge(str) {
    if (!str) return "";
    return JSON.stringify(String(str)).slice(1, -1)
        .replace(/'/g, "\\'")
        .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// Escape de texto bruto: sequências %xx escritas pelo utilizador são literais.
function escaparObservacaoParaBridge(observacao) {
    return escaparStringParaBridge(observacao);
}

// Codificação explícita, sem adivinhar se o texto já estava codificado.
function processarObservacaoSegura(observacao) {
    return observacao ? encodeURIComponent(String(observacao)) : "";
}

function decodificarObservacaoCompativel(textoCodeado) {
    if (!textoCodeado) return "";
    try {
        return decodeURIComponent(String(textoCodeado));
    } catch (e) {
        return String(textoCodeado);
    }
}

function decodificarObservacao(textoCodeado) {
    return decodificarObservacaoCompativel(textoCodeado);
}

function aplicarCodificacaoObservacao(texto) {
    return escaparStringParaBridge(texto);
}

// Função para escapar múltiplas observações para uso em BridgeTalk
function escaparObservacoesParaBridge(observacoes) {
    logProtegido("Escapando múltiplas observações para BridgeTalk", logs.TIPOS_LOG.FUNCTION);
    
    if (!observacoes) return "";
    
    var resultado = "";
    
    // Se for uma string única
    if (typeof observacoes === 'string') {
        resultado = escaparObservacaoParaBridge(observacoes);
    }
    // Se for um array de observações
    else if (isArray(observacoes)) {
        var observacoesEscapadas = [];
        for (var i = 0; i < observacoes.length; i++) {
            if (observacoes[i] && observacoes[i] !== "") {
                observacoesEscapadas.push(escaparObservacaoParaBridge(observacoes[i]));
            }
        }
        resultado = observacoesEscapadas.join("\\n");
    }
    // Se for um objeto com propriedades de observação
    else if (typeof observacoes === 'object') {
        var observacoesTexto = "";
        for (var propriedade in observacoes) {
            if (observacoes.hasOwnProperty(propriedade) && observacoes[propriedade]) {
                if (observacoesTexto !== "") observacoesTexto += "\\n";
                observacoesTexto += propriedade + ": " + observacoes[propriedade];
            }
        }
        resultado = escaparObservacaoParaBridge(observacoesTexto);
    }
    
    logProtegido("Múltiplas observações escapadas: " + (resultado.length > 50 ? resultado.substring(0, 50) + "..." : resultado), logs.TIPOS_LOG.INFO);
    return resultado;
}

// Função para validar e limpar observações antes do escape
function validarObservacaoParaBridge(observacao) {
    logProtegido("Validando observação para BridgeTalk", logs.TIPOS_LOG.FUNCTION);
    
    if (!observacao) {
        logProtegido("Observação vazia ou nula", logs.TIPOS_LOG.WARNING);
        return "";
    }
    
    // Converter para string se necessário
    var textoObservacao = String(observacao);
    
    // Remover caracteres problemáticos que podem causar erros no BridgeTalk
    var textoLimpo = textoObservacao;
    
    // Filtrar caracteres válidos usando uma abordagem mais segura para ExtendScript
    var resultado = "";
    for (var i = 0; i < textoLimpo.length; i++) {
        var caractere = textoLimpo.charAt(i);
        var charCode = textoLimpo.charCodeAt(i);
        
        // Permitir apenas caracteres imprimíveis e alguns caracteres de espaçamento
        if (charCode >= 32 && charCode <= 126) { // ASCII imprimíveis
            resultado += caractere;
        } else if (charCode === 9 || charCode === 10 || charCode === 13) { // tab, newline, carriage return
            resultado += caractere;
        } else if (charCode >= 128) { // caracteres Unicode
            resultado += caractere;
        }
        // Outros caracteres de controle são ignorados
    }
    textoLimpo = resultado;
    
    // Limitar tamanho para evitar overflow no BridgeTalk
    var TAMANHO_MAX_OBSERVACAO = 2000;
    if (textoLimpo.length > TAMANHO_MAX_OBSERVACAO) {
        textoLimpo = textoLimpo.substring(0, TAMANHO_MAX_OBSERVACAO) + "...";
        logProtegido("Observação truncada por exceder tamanho máximo (" + TAMANHO_MAX_OBSERVACAO + " caracteres)", logs.TIPOS_LOG.WARNING);
    }
    
    logProtegido("Observação validada: " + textoLimpo.length + " caracteres", logs.TIPOS_LOG.INFO);
    return textoLimpo;
}

// Função para validar ambiente BridgeTalk
function validarAmbienteBridge() {
    logProtegido("Validando ambiente BridgeTalk", logs.TIPOS_LOG.FUNCTION);
    
    try {
        if (typeof BridgeTalk === "undefined") {
            logProtegido("BridgeTalk não está disponível", logs.TIPOS_LOG.ERROR);
            return false;
        }
        
        logProtegido("Ambiente BridgeTalk validado com sucesso", logs.TIPOS_LOG.INFO);
        return true;
    } catch (e) {
        logProtegido("Erro ao validar ambiente BridgeTalk: " + e.message, logs.TIPOS_LOG.ERROR);
        return false;
    }
}

// Exportar funções para o escopo global
$.global.bridge = {
    executarContagemBolas: executarContagemBolas,
    processarResultadoContagem: processarResultadoContagem,
    adicionarLegendaViaBridge: adicionarLegendaViaBridge,
    escaparStringParaBridge: escaparStringParaBridge,
    escaparObservacaoParaBridge: escaparObservacaoParaBridge,
    escaparObservacoesParaBridge: escaparObservacoesParaBridge,
    validarObservacaoParaBridge: validarObservacaoParaBridge,
    aplicarCodificacaoObservacao: aplicarCodificacaoObservacao,
    processarObservacaoSegura: processarObservacaoSegura,
    decodificarObservacaoCompativel: decodificarObservacaoCompativel,
    decodificarObservacao: decodificarObservacao,
    validarAmbienteBridge: validarAmbienteBridge
};
