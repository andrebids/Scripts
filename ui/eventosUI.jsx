#target illustrator
#targetengine maintarget

/**
 * Módulo de Centralização de Eventos UI
 * Responsável por gerenciar todos os eventos de interface do usuário
 */

// Namespace global para eventos UI
$.global.eventosUI = {};

(function() {
    "use strict";
    
    var eventosUI = $.global.eventosUI;
    
    // Logging obrigatório
    if (logs && logs.adicionarLog) {
        logs.adicionarLog("Iniciando módulo eventosUI", logs.TIPOS_LOG.INFO);
    }
    
    /**
     * Configura eventos de checkboxes da interface
     */
    eventosUI.configurarEventosCheckboxes = function(config) {
        // Removido log de início para melhorar performance
        // if (logs && logs.adicionarLog) {
        //     logs.adicionarLog("Configurando eventos de checkboxes", logs.TIPOS_LOG.INFO);
        // }
        
        try {
            // Evento para checkbox Structure laqueé
            if (config.checkStructure) {
                config.checkStructure.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkStructure - valor: " + this.value);
                    }
                    config.corStructure.visible = this.value;
                };
            }
            
            // Evento para checkbox mostrar bolas
            if (config.checkboxMostrarBolas) {
                config.checkboxMostrarBolas.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkboxMostrarBolas - valor: " + this.value);
                    }
                    
                    if (this.value) {
                        config.grupoBolasExtra = config.grupoExtra.add("panel", undefined, config.t("painelBolas"));
                        config.grupoBolasExtra.orientation = "column";
                        config.grupoBolasExtra.alignChildren = "left";

                        // Grupo de seleção de bolas
                        var grupoBolasSelecao = config.grupoBolasExtra.add("group");
                        grupoBolasSelecao.orientation = "row";

                        // Lista de cores para bolas
                        var coresBolasDisponiveis = funcoesFiltragem.getCoresDisponiveisBolas(config.dados, config.t, funcoes.arrayContains, funcoes.encontrarPorId);
                        var listaCoresBolas = grupoBolasSelecao.add("dropdownlist", undefined, coresBolasDisponiveis);
                        listaCoresBolas.selection = 0;

                        // Lista de acabamentos (inicialmente vazia)
                        var listaAcabamentos = grupoBolasSelecao.add("dropdownlist", undefined, [config.t("selecioneAcabamento")]);
                        listaAcabamentos.selection = 0;

                        // Lista de tamanhos (inicialmente vazia)
                        var listaTamanhos = grupoBolasSelecao.add("dropdownlist", undefined, [config.t("selecioneTamanho")]);
                        listaTamanhos.selection = 0;

                        // Campo para quantidade de bolas
                        var campoQuantidadeBolas = grupoBolasSelecao.add("edittext", undefined, "1");
                        campoQuantidadeBolas.characters = 5;
                        funcoes.apenasNumerosEVirgula(campoQuantidadeBolas);

                        // Botão adicionar bola
                        var botaoAdicionarBola = grupoBolasSelecao.add("button", undefined, config.t("adicionarBola"));

                        // Eventos de mudança
                        listaCoresBolas.onChange = function() {
                            if (logs && logs.logEvento) {
                                logs.logEvento("change", "listaCoresBolas - " + (this.selection ? this.selection.text : "nenhuma seleção"));
                            }
                            funcoesBolas.atualizarAcabamentos(listaCoresBolas, listaAcabamentos, config.dados, config.t, funcoes, function() {
                                funcoesBolas.atualizarTamanhos(listaCoresBolas, listaAcabamentos, listaTamanhos, config.dados, config.t, funcoes);
                            });
                        };
                        
                        listaAcabamentos.onChange = function() {
                            if (logs && logs.logEvento) {
                                logs.logEvento("change", "listaAcabamentos - " + (this.selection ? this.selection.text : "nenhuma seleção"));
                            }
                            funcoesBolas.atualizarTamanhos(listaCoresBolas, listaAcabamentos, listaTamanhos, config.dados, config.t, funcoes);
                        };

                        botaoAdicionarBola.onClick = function() {
                            funcoesBolas.adicionarBola(
                                listaCoresBolas,
                                listaAcabamentos,
                                listaTamanhos,
                                campoQuantidadeBolas,
                                config.dados,
                                config.itensLegenda,
                                config.atualizarListaItens,
                                config.t,
                                logs,
                                funcoes
                            );
                        };

                        config.janela.layout.layout(true);
                    } else {
                        if (config.grupoBolasExtra) {
                            config.grupoBolasExtra.parent.remove(config.grupoBolasExtra);
                            config.grupoBolasExtra = null;
                            config.janela.layout.layout(true);
                        }
                    }
                    config.janela.layout.resize();
                };
            }
            
            // Evento para checkbox alfabeto
            if (config.checkboxMostrarAlfabeto) {
                config.checkboxMostrarAlfabeto.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkboxMostrarAlfabeto - valor: " + this.value);
                    }
                    
                    if (this.value) {
                        config.componentesAlfabeto = alfabeto.criarInterfaceAlfabeto(
                            config.abaGeral, config.dados, config.janela, config.t, funcoesFiltragem, funcoes, config.itensLegenda, config.atualizarListaItens, config.campoNomeTipo, config.grupoDimensoes
                        );
                    } else {
                        if (config.componentesAlfabeto) {
                            alfabeto.removerInterfaceAlfabeto(config.componentesAlfabeto, config.janela);
                            config.componentesAlfabeto = null;
                        }
                    }
                    config.janela.layout.layout(true);
                    config.janela.layout.resize();
                };
            }
            
            // Evento para checkbox contador
            if (config.checkboxMostrarContar) {
                config.checkboxMostrarContar.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkboxMostrarContar - valor: " + this.value);
                    }
                    
                    if (this.value) {
                        config.componentesContador = ui.criarInterfaceContadorBolas(
                            config.grupoContador, config.dados, config.itensLegenda, config.atualizarListaItens
                        );
                        if (logs && logs.adicionarLog) {
                            logs.adicionarLog("Interface do contador criada e layout será atualizado", logs.TIPOS_LOG.INFO);
                        }
                        config.janela.layout.layout(true);
                        config.janela.layout.resize();
                    } else {
                        if (config.componentesContador && config.componentesContador.grupo) {
                            config.componentesContador.grupo.parent.remove(config.componentesContador.grupo);
                            config.componentesContador = null;
                            if (logs && logs.adicionarLog) {
                                logs.adicionarLog("Interface do contador removida e layout será atualizado", logs.TIPOS_LOG.INFO);
                            }
                            config.janela.layout.layout(true);
                            config.janela.layout.resize();
                        }
                    }
                };
            }
            
            // Evento para checkbox texturas
            if (config.checkboxMostrarTexturas) {
                config.checkboxMostrarTexturas.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkboxMostrarTexturas - valor: " + this.value);
                    }
                    
                    if (this.value) {
                        config.componentesTextura = ui.criarInterfaceTexturas(config.grupoTexturas, config.janela, config.t, funcoesFiltragem, config.itensLegenda, config.atualizarListaItens);
                    } else {
                        ui.removerInterfaceTexturas(config.componentesTextura, config.janela);
                        config.componentesTextura = null;
                    }
                    config.janela.layout.resize();
                };
            }
            
            // Evento para checkbox observações
            if (config.checkboxMostrarObs) {
                config.checkboxMostrarObs.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkboxMostrarObs - valor: " + this.value);
                    }
                    
                    if (this.value) {
                        config.componentesObservacoes = ui.criarInterfaceObservacoes(
                            config.grupoExtra,
                            config.janela,
                            config.t
                        );
                    } else {
                        ui.removerInterfaceObservacoes(config.componentesObservacoes, config.janela);
                        config.componentesObservacoes = null;
                    }
                    config.janela.layout.resize();
                };
            }
            
            // Evento para checkbox componente extra
            if (config.checkboxMostrarComponenteExtra) {
                config.checkboxMostrarComponenteExtra.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkboxMostrarComponenteExtra - valor: " + this.value);
                    }
                    
                    if (this.value) {
                        config.grupoComponenteExtra = config.abaGeral.add("group");
                        config.grupoComponenteExtra.orientation = "row";
                        config.grupoComponenteExtra.alignChildren = ["left", "center"];
                        config.grupoComponenteExtra.spacing = 5;
                        config.grupoComponenteExtra.add("statictext", undefined, config.t("nomeComponenteExtra"));
                        var campoNomeExtra = config.grupoComponenteExtra.add("edittext", undefined, "");
                        campoNomeExtra.characters = 12;
                        config.grupoComponenteExtra.add("statictext", undefined, config.t("unidadeComponenteExtra"));
                        var opcoesUnidadeExtra = ["m2", "ml", "unit"];
                        var campoUnidadeExtra = config.grupoComponenteExtra.add("dropdownlist", undefined, opcoesUnidadeExtra);
                        campoUnidadeExtra.selection = 0;
                        config.grupoComponenteExtra.add("statictext", undefined, config.t("quantidadeComponenteExtra"));
                        var campoQuantidadeExtra = config.grupoComponenteExtra.add("edittext", undefined, "1");
                        campoQuantidadeExtra.characters = 4;
                        var botaoAdicionarExtra = config.grupoComponenteExtra.add("button", undefined, config.t("adicionarComponenteExtra"));
                        
                        botaoAdicionarExtra.onClick = function() {
                            var nomeExtra = campoNomeExtra.text;
                            var unidadeExtra = campoUnidadeExtra.selection ? campoUnidadeExtra.selection.text : "";
                            var quantidadeExtra = parseFloat(campoQuantidadeExtra.text.replace(',', '.'));
                            if (nomeExtra === "" || isNaN(quantidadeExtra) || quantidadeExtra <= 0) {
                                ui.mostrarAlertaPersonalizado(config.t("preencherCampos"), "Campo Obrigatório");
                                return;
                            }
                            var textoExtra = nomeExtra + " (" + unidadeExtra + "): " + quantidadeExtra.toFixed(2).replace('.', ',');
                            config.itensLegenda.push({
                                tipo: "extra",
                                nome: nomeExtra,
                                texto: textoExtra,
                                unidade: unidadeExtra,
                                quantidade: quantidadeExtra
                            });
                            config.atualizarListaItens();
                            campoNomeExtra.text = "";
                            campoQuantidadeExtra.text = "";
                        };
                        
                        config.janela.layout.layout(true);
                        config.janela.layout.resize();
                    } else {
                        if (config.grupoComponenteExtra) {
                            config.grupoComponenteExtra.parent.remove(config.grupoComponenteExtra);
                            config.grupoComponenteExtra = null;
                            config.janela.layout.layout(true);
                            config.janela.layout.resize();
                        }
                    }
                };
            }
            
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Eventos de checkboxes configurados com sucesso", logs.TIPOS_LOG.INFO);
            }
            
        } catch (erro) {
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Erro ao configurar eventos de checkboxes: " + erro.message, logs.TIPOS_LOG.ERRO);
            }
            throw erro;
        }
    };
    
    /**
     * Configura eventos de dropdowns da interface
     */
    eventosUI.configurarEventosDropdowns = function(config) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Configurando eventos de dropdowns", logs.TIPOS_LOG.INFO);
        }
        
        try {
            // Evento para dropdown de idiomas
            if (config.dropdownIdiomas) {
                config.dropdownIdiomas.onChange = function() {
                    var novoIdioma = config.dropdownIdiomas.selection.text;
                    
                    if (novoIdioma !== config.idiomaUsuario) {
                        if (config.alterarIdioma && config.alterarIdioma(novoIdioma)) {
                            ui.mostrarAlertaPersonalizado(config.t("idiomaAlterado") + novoIdioma + config.t("reiniciarScript"), "Idioma Alterado");
                            config.janela.close();
                        } else {
                            ui.mostrarAlertaPersonalizado("Erro ao alterar idioma. Por favor, tente novamente.", "Erro");
                        }
                    }
                };
            }
            
            // Evento para dropdown L
            if (config.listaL) {
                config.listaL.onChange = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("change", "listaL - " + (this.selection ? this.selection.text : "nenhuma seleção"));
                    }
                };
            }
            
            // Evento para dropdown Usage
            if (config.campoUsage) {
                config.campoUsage.onChange = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("change", "campoUsage - " + (this.selection ? this.selection.text : "nenhuma seleção"));
                    }
                };
            }
            
            // Evento para dropdown Quantité prévue
            if (config.campoQuantitePrevu) {
                config.campoQuantitePrevu.onChanging = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("change", "campoQuantitePrevu - " + this.text);
                    }
                };
            }
            
            // Evento para dropdown Preço
            if (config.campoPreco) {
                config.campoPreco.onChanging = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("change", "campoPreco - " + this.text);
                    }
                };
            }
            
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Eventos de dropdowns configurados com sucesso", logs.TIPOS_LOG.INFO);
            }
            
        } catch (erro) {
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Erro ao configurar eventos de dropdowns: " + erro.message, logs.TIPOS_LOG.ERRO);
            }
            throw erro;
        }
    };
    
    /**
     * Configura eventos de componentes (linhas de componentes)
     */
    eventosUI.configurarEventosComponentes = function(config) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Configurando eventos de componentes", logs.TIPOS_LOG.INFO);
        }
        
        try {
            // Função auxiliar para configurar eventos de uma linha
            function configurarEventosLinha(linha) {
                if (linha.listaComponentes) {
                    linha.listaComponentes.onChange = function() {
                        funcoes.atualizarCores(linha.listaComponentes, linha.listaCores, linha.listaUnidades, config.dados, config.t, function() {
                            if (funcoesComponentes && funcoesComponentes.verificarCMYK) {
                                funcoesComponentes.verificarCMYK(linha.listaComponentes, linha.listaCores, linha.listaUnidades, config.dados, funcoes.encontrarIndicePorNome);
                            }
                        });
                    };
                }
                
                if (linha.listaCores) {
                    linha.listaCores.onChange = function() {
                        if (funcoesComponentes && funcoesComponentes.atualizarUnidades) {
                            funcoesComponentes.atualizarUnidades(linha.listaComponentes, linha.listaCores, linha.listaUnidades, config.dados, funcoes.selecionarUnidadeMetrica, funcoes.arrayContains);
                        }
                    };
                }
            }
            
            // Configurar eventos para cada linha de componentes
            if (config.linhaPrint) configurarEventosLinha(config.linhaPrint);
            if (config.linhaLeds) configurarEventosLinha(config.linhaLeds);
            if (config.linhaNormais) configurarEventosLinha(config.linhaNormais);
            
            // Eventos de botões adicionar
            if (config.linhaPrint && config.linhaPrint.botaoAdicionar) {
                config.linhaPrint.botaoAdicionar.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "botaoAdicionarComponente_PRINT");
                    }
                    var soma = 0;
                    var campos = config.linhaPrint.camposQuantidade;
                    for (var i = 0; i < campos.length; i++) {
                        var valor = parseFloat(campos[i].text.replace(",", "."));
                        if (!isNaN(valor) && valor > 0) {
                            soma += valor;
                        }
                    }
                    if (soma <= 0) {
                        ui.mostrarAlertaPersonalizado(config.t("preencherCampos"), "Campo Obrigatório");
                        return;
                    }
                    funcoesComponentes.adicionarComponente(
                        config.linhaPrint.listaComponentes,
                        config.linhaPrint.listaCores,
                        config.linhaPrint.listaUnidades,
                        soma,
                        config.linhaPrint.campoMultiplicador,
                        config.ultimaSelecao,
                        config.dados,
                        config.itensLegenda,
                        config.atualizarListaItens,
                        config.t,
                        logs,
                        funcoes,
                        funcoes.encontrarIndicePorNome,
                        config.linhaPrint.camposQuantidade
                    );
                };
            }
            
            if (config.linhaLeds && config.linhaLeds.botaoAdicionar) {
                config.linhaLeds.botaoAdicionar.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "botaoAdicionarComponente_LEDS");
                    }
                    var soma = 0;
                    var campos = config.linhaLeds.camposQuantidade;
                    for (var i = 0; i < campos.length; i++) {
                        var valor = parseFloat(campos[i].text.replace(",", "."));
                        if (!isNaN(valor) && valor > 0) {
                            soma += valor;
                        }
                    }
                    if (soma <= 0) {
                        ui.mostrarAlertaPersonalizado(config.t("preencherCampos"), "Campo Obrigatório");
                        return;
                    }
                    funcoesComponentes.adicionarComponente(
                        config.linhaLeds.listaComponentes,
                        config.linhaLeds.listaCores,
                        config.linhaLeds.listaUnidades,
                        soma,
                        config.linhaLeds.campoMultiplicador,
                        config.ultimaSelecao,
                        config.dados,
                        config.itensLegenda,
                        config.atualizarListaItens,
                        config.t,
                        logs,
                        funcoes,
                        funcoes.encontrarIndicePorNome,
                        config.linhaLeds.camposQuantidade
                    );
                };
            }
            
            if (config.linhaNormais && config.linhaNormais.botaoAdicionar) {
                config.linhaNormais.botaoAdicionar.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "botaoAdicionarComponente_NORMAIS");
                    }
                    var soma = 0;
                    var campos = config.linhaNormais.camposQuantidade;
                    for (var i = 0; i < campos.length; i++) {
                        var valor = parseFloat(campos[i].text.replace(",", "."));
                        if (!isNaN(valor) && valor > 0) {
                            soma += valor;
                        }
                    }
                    if (soma <= 0) {
                        ui.mostrarAlertaPersonalizado(config.t("preencherCampos"), "Campo Obrigatório");
                        return;
                    }
                    funcoesComponentes.adicionarComponente(
                        config.linhaNormais.listaComponentes,
                        config.linhaNormais.listaCores,
                        config.linhaNormais.listaUnidades,
                        soma,
                        config.linhaNormais.campoMultiplicador,
                        config.ultimaSelecao,
                        config.dados,
                        config.itensLegenda,
                        config.atualizarListaItens,
                        config.t,
                        logs,
                        funcoes,
                        funcoes.encontrarIndicePorNome,
                        config.linhaNormais.camposQuantidade
                    );
                };
            }
            
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Eventos de componentes configurados com sucesso", logs.TIPOS_LOG.INFO);
            }
            
        } catch (erro) {
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Erro ao configurar eventos de componentes: " + erro.message, logs.TIPOS_LOG.ERRO);
            }
            throw erro;
        }
    };
    
    /**
     * Configura eventos de botões principais
     */
    eventosUI.configurarEventosBotoes = function(config) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Configurando eventos de botões", logs.TIPOS_LOG.INFO);
        }
        
        try {
            // Evento para botão Update
            if (config.botaoUpdate) {
                config.botaoUpdate.onClick = function() {
                    if (config.executarUpdate) {
                        config.executarUpdate(config.t);
                    }
                };
            }
            
            // Evento para botão Gerar
            if (config.botaoGerar) {
                config.botaoGerar.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "botaoGerar");
                    }
                    
                    // Verificar se o campo L foi selecionado
                    if (!config.listaL.selection) {
                        ui.mostrarAlertaPersonalizado("Selecione um valor para o campo L (obrigatório)", "Campo Obrigatório");
                        return;
                    }
                    
                    // Verificar se o tipo de fixação foi selecionado
                    if (!config.listaFixacao.selection || config.listaFixacao.selection.index === 0) {
                        ui.mostrarAlertaPersonalizado(config.t("selecionarTipoFixacao"), "Atenção");
                        return;
                    }
                    
                    // Verificar se há dimensões preenchidas
                    var temDimensoes = false;
                    for (var i = 0; i < config.dimensoes.length; i++) {
                        var valorDimensao = config.grupoDimensoes.children[i*2 + 1].text;
                        if (valorDimensao !== "") {
                            temDimensoes = true;
                            break;
                        }
                    }

                    // Se não houver dimensões, mostrar confirmação personalizada
                    if (!temDimensoes) {
                        var continuarSemTamanho = false;
                        ui.mostrarConfirmacaoPersonalizada(
                            config.t("confirmacaoSemTamanho"), 
                            "Confirmação", 
                            function() { continuarSemTamanho = true; }, // Sim
                            function() { return; } // Não - retorna sem fazer nada
                        );
                        if (!continuarSemTamanho) {
                            return; // Se o usuário clicar em "Não", interrompe a execução
                        }
                    }
                    
                    // Chamar função de geração se existir
                    if (config.gerarLegenda) {
                        config.gerarLegenda();
                    }
                };
            }
            
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Eventos de botões configurados com sucesso", logs.TIPOS_LOG.INFO);
            }
            
        } catch (erro) {
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Erro ao configurar eventos de botões: " + erro.message, logs.TIPOS_LOG.ERRO);
            }
            throw erro;
        }
    };
    
    /**
     * Atualiza o layout da janela
     */
    eventosUI.atualizarLayoutJanela = function(janela) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Atualizando layout da janela", logs.TIPOS_LOG.INFO);
        }
        
        try {
            if (janela && janela.layout) {
                janela.layout.layout(true);
                janela.layout.resize();
            }
        } catch (erro) {
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Erro ao atualizar layout da janela: " + erro.message, logs.TIPOS_LOG.ERRO);
            }
        }
    };
    
    if (logs && logs.adicionarLog) {
        logs.adicionarLog("Módulo eventosUI carregado com sucesso", logs.TIPOS_LOG.INFO);
    }
    
})(); 