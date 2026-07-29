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
     * Indica se a legenda contém lucioles, adicionadas diretamente ou através de GP.
     */
    function legendaTemLucioles(itensLegenda) {
        if (!itensLegenda || !itensLegenda.length) {
            return false;
        }

        for (var i = 0; i < itensLegenda.length; i++) {
            var item = itensLegenda[i];
            if (!item) {
                continue;
            }

            if (item.tipo === "gp_lucioles" || item.temLucioles === true) {
                return true;
            }

            if (item.tipo === "componente") {
                var nome = String(item.nome || "").toLowerCase();
                var referencia = String(item.referencia || "").toLowerCase();
                if (item.componenteId === 2 ||
                    nome.indexOf("lucioles") !== -1 ||
                    referencia.indexOf("lucioles") !== -1) {
                    return true;
                }
            }
        }

        return false;
    }

    function obterTextoOriginalLista(lista, item) {
        if (typeof funcoes !== "undefined" && funcoes && funcoes.obterTextoOriginalItemLista) {
            return funcoes.obterTextoOriginalItemLista(lista, item);
        }
        var itemAtual = item || (lista ? lista.selection : null);
        return itemAtual ? String(itemAtual.text || "") : "";
    }

    function obterUsoPrint(config) {
        return config.campoUsage && config.campoUsage.selection ?
            String(config.campoUsage.selection.text || "") : "";
    }

    function obterFixacaoPrint(config) {
        return config.listaFixacao && config.listaFixacao.selection ?
            String(config.listaFixacao.selection.text || "") : "";
    }

    function substituirNomePrint(texto, nomePrint) {
        return String(texto || "").replace(/\{print\}/g, nomePrint);
    }

    function obterDicaAvaliacaoPrint(config, avaliacao) {
        if (!avaliacao) {
            return "";
        }
        if (avaliacao.dica === "recomendado") {
            return config.t("printDicaRecomendado");
        }
        if (avaliacao.dica === "requerLed") {
            return config.t("printDicaRequerLed");
        }
        if (avaliacao.dica === "fimSerie") {
            return config.t("printDicaFimSerie");
        }
        if (avaliacao.dica === "somenteExterior") {
            return config.t("printDicaSomenteExterior");
        }
        if (avaliacao.dica === "somenteInterior") {
            return config.t("printDicaSomenteInterior");
        }
        return config.t("printDicaCompativel");
    }

    function obterMensagensAvaliacaoPrint(config, avaliacao) {
        var mensagens = [];
        if (!avaliacao || !avaliacao.avisos) {
            return mensagens;
        }

        for (var i = 0; i < avaliacao.avisos.length; i++) {
            var codigo = avaliacao.avisos[i];
            if (codigo === "somenteExterior") {
                mensagens.push(substituirNomePrint(config.t("printAvisoSomenteExterior"), avaliacao.nomeOriginal));
            } else if (codigo === "somenteInterior") {
                mensagens.push(substituirNomePrint(config.t("printAvisoSomenteInterior"), avaliacao.nomeOriginal));
            } else if (codigo === "requerLed") {
                mensagens.push(config.t("printAvisoRequerLed"));
            } else if (codigo === "fimSerie") {
                mensagens.push(config.t("printAvisoFimSerie"));
            }
        }

        var usoNorm = regras.normalizarTextoRegraPrint(obterUsoPrint(config));
        var fixacaoNorm = regras.normalizarTextoRegraPrint(obterFixacaoPrint(config));
        var interior = usoNorm.indexOf("interieur") !== -1 || usoNorm.indexOf("interior") !== -1;
        var auSol = fixacaoNorm.indexOf("au sol") !== -1 || fixacaoNorm.indexOf("pose au sol") !== -1;
        var temAvisoExterior = false;
        for (var j = 0; j < avaliacao.avisos.length; j++) {
            if (avaliacao.avisos[j] === "somenteExterior") {
                temAvisoExterior = true;
                break;
            }
        }
        if (interior && temAvisoExterior) {
            mensagens.push(config.t(auSol ? "printAlternativaAuSolInterior" : "printAlternativaInterior"));
        }
        return mensagens;
    }

    function obterAssinaturaAvisoPrint(config, avaliacao) {
        var temLed = regras.legendaTemIluminacaoLed(config.itensLegenda);
        return [
            regras.normalizarTextoRegraPrint(obterUsoPrint(config)),
            regras.normalizarTextoRegraPrint(obterFixacaoPrint(config)),
            temLed ? "led" : "sem-led",
            regras.normalizarTextoRegraPrint(avaliacao.nomeOriginal),
            avaliacao.avisos.join(",")
        ].join("|");
    }

    function mostrarAvisoAvaliacaoPrint(config, avaliacao) {
        var mensagens = obterMensagensAvaliacaoPrint(config, avaliacao);
        if (mensagens.length === 0) {
            return false;
        }

        if (!config.avisosPrintMostrados) {
            config.avisosPrintMostrados = {};
        }
        var assinatura = obterAssinaturaAvisoPrint(config, avaliacao);
        if (config.avisosPrintMostrados[assinatura]) {
            return false;
        }

        config.avisosPrintMostrados[assinatura] = true;
        mensagens.push(config.t("printAvisoPodeContinuar"));
        ui.mostrarAlertaPersonalizado(mensagens.join("\n\n"), config.t("printTituloAviso"));
        return true;
    }

    function obterAvaliacaoSelecaoPrint(config) {
        if (!config.linhaPrint || !config.linhaPrint.listaComponentes ||
            !config.linhaPrint.listaComponentes.selection ||
            config.linhaPrint.listaComponentes.selection.index <= 0) {
            return null;
        }
        var nomeOriginal = obterTextoOriginalLista(config.linhaPrint.listaComponentes);
        return regras.avaliarCompatibilidadePrint(
            nomeOriginal,
            obterUsoPrint(config),
            obterFixacaoPrint(config),
            regras.legendaTemIluminacaoLed(config.itensLegenda)
        );
    }

    function atualizarAjudaSelecaoPrint(config) {
        if (!config.linhaPrint || !config.linhaPrint.listaComponentes) {
            return;
        }
        var avaliacao = obterAvaliacaoSelecaoPrint(config);
        config.linhaPrint.listaComponentes.helpTip = avaliacao ? obterDicaAvaliacaoPrint(config, avaliacao) : "";
    }

    function atualizarDropdownRecomendacoesPrint(config, termo, preservarSelecao) {
        if (!config.linhaPrint || !config.linhaPrint.listaComponentes || !config.componentesOriginaisPrint) {
            return;
        }

        var lista = config.linhaPrint.listaComponentes;
        var nomeAnterior = obterTextoOriginalLista(lista);
        var termoNorm = regras.normalizarTextoRegraPrint(typeof termo === "string" ? termo : (config.termoPesquisaPrint || ""));
        config.termoPesquisaPrint = termoNorm;
        var avaliacoes = regras.ordenarAvaliacoesPrint(
            config.componentesOriginaisPrint,
            obterUsoPrint(config),
            obterFixacaoPrint(config),
            regras.legendaTemIluminacaoLed(config.itensLegenda)
        );
        var filtradas = [];

        for (var i = 0; i < avaliacoes.length; i++) {
            if (!termoNorm ||
                regras.normalizarTextoRegraPrint(avaliacoes[i].nomeOriginal).indexOf(termoNorm) !== -1) {
                filtradas.push(avaliacoes[i]);
            }
        }

        lista.atualizandoRecomendacoes = true;
        lista.removeAll();
        lista.nomesOriginais = [];

        lista.add("item", config.t("selecioneComponente"));
        lista.nomesOriginais.push("");

        var indiceAnterior = -1;
        for (var j = 0; j < filtradas.length; j++) {
            var avaliacao = filtradas[j];
            var textoVisual = avaliacao.nomeOriginal + (avaliacao.marcador ? " " + avaliacao.marcador : "");
            var itemLista = lista.add("item", textoVisual);
            lista.nomesOriginais.push(avaliacao.nomeOriginal);
            if (avaliacao.nomeOriginal === nomeAnterior) {
                indiceAnterior = itemLista.index;
            }
        }

        if (preservarSelecao !== false && indiceAnterior > 0) {
            lista.selection = indiceAnterior;
        } else if (termoNorm && filtradas.length > 0) {
            lista.selection = 1;
        } else {
            lista.selection = 0;
        }
        lista.atualizandoRecomendacoes = false;

        var nomeAtual = obterTextoOriginalLista(lista);
        if (nomeAtual !== nomeAnterior && typeof funcoes.atualizarCores === "function") {
            funcoes.atualizarCores(
                lista,
                config.linhaPrint.listaCores,
                config.linhaPrint.listaUnidades,
                config.dados,
                config.t,
                function() {
                    if (funcoesComponentes && funcoesComponentes.verificarCMYK) {
                        funcoesComponentes.verificarCMYK(
                            lista,
                            config.linhaPrint.listaCores,
                            config.linhaPrint.listaUnidades,
                            config.dados,
                            funcoes.encontrarIndicePorNome
                        );
                    }
                }
            );
        }
        atualizarAjudaSelecaoPrint(config);
    }

    function obterNomeBasePrintItem(item, dados) {
        if (!item || item.tipo !== "componente" || !dados || !dados.componentes) {
            return "";
        }
        for (var i = 0; i < dados.componentes.length; i++) {
            if (dados.componentes[i].id === item.componenteId) {
                return regras.obterTipoRegraPrint(dados.componentes[i].nome) !== "outro" ?
                    dados.componentes[i].nome : "";
            }
        }
        return "";
    }

    function mostrarAvisosPrintDaLegenda(config) {
        if (!config.itensLegenda || !config.itensLegenda.length) {
            return false;
        }

        if (!config.avisosPrintMostrados) {
            config.avisosPrintMostrados = {};
        }
        var blocos = [];
        var vistos = {};
        var temLed = regras.legendaTemIluminacaoLed(config.itensLegenda);

        for (var i = 0; i < config.itensLegenda.length; i++) {
            var nomePrint = obterNomeBasePrintItem(config.itensLegenda[i], config.dados);
            if (!nomePrint) {
                continue;
            }
            var avaliacao = regras.avaliarCompatibilidadePrint(
                nomePrint,
                obterUsoPrint(config),
                obterFixacaoPrint(config),
                temLed
            );
            var mensagens = obterMensagensAvaliacaoPrint(config, avaliacao);
            var assinatura = obterAssinaturaAvisoPrint(config, avaliacao);
            if (mensagens.length > 0 && !vistos[assinatura] && !config.avisosPrintMostrados[assinatura]) {
                vistos[assinatura] = true;
                config.avisosPrintMostrados[assinatura] = true;
                blocos.push(nomePrint + ":\n" + mensagens.join("\n"));
            }
        }

        if (blocos.length > 0) {
            blocos.push(config.t("printAvisoPodeContinuar"));
            ui.mostrarAlertaPersonalizado(blocos.join("\n\n"), config.t("printTituloAviso"));
            return true;
        }
        return false;
    }

    eventosUI.atualizarRecomendacoesPrint = function(config, termo, preservarSelecao) {
        atualizarDropdownRecomendacoesPrint(config, termo, preservarSelecao);
    };
    
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
                        if (config.componentesObservacoes && config.componentesObservacoes.campoObs) {
                            config.componentesObservacoes.campoObs.text = "";
                        }
                        // Atualizar variável global também
                        $.global.componentesObservacoes = config.componentesObservacoes;
                    } else {
                        ui.removerInterfaceObservacoes(config.componentesObservacoes, config.janela);
                        config.componentesObservacoes = null;
                        $.global.componentesObservacoes = null;
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

            // Evento para checkbox PVC
            if (config.checkboxMostrarPVC) {
                config.checkboxMostrarPVC.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkboxMostrarPVC - valor: " + this.value);
                    }

                    if (this.value) {
                        config.grupoPVC = config.abaGeral.add("group");
                        config.grupoPVC.orientation = "row";
                        config.grupoPVC.alignChildren = ["left", "center"];
                        config.grupoPVC.spacing = 5;

                        config.grupoPVC.add("statictext", undefined, config.t("tipoPVC"));
                        var opcoesTipoPVC = [
                            config.t("opcaoPVC"),
                            config.t("opcaoDisquePlexi"),
                            config.t("opcaoImpression")
                        ];
                        var campoTipoPVC = config.grupoPVC.add("dropdownlist", undefined, opcoesTipoPVC);
                        campoTipoPVC.selection = 0;

                        config.grupoPVC.add("statictext", undefined, config.t("descricaoPVC"));
                        var campoDescricaoPVC = config.grupoPVC.add("edittext", undefined, "");
                        campoDescricaoPVC.characters = 18;

                        config.grupoPVC.add("statictext", undefined, config.t("unidadePVC"));
                        var campoUnidadePVC = config.grupoPVC.add("dropdownlist", undefined, ["units"]);
                        campoUnidadePVC.selection = 0;

                        config.grupoPVC.add("statictext", undefined, config.t("quantidadePVC"));
                        var campoQuantidadePVC = config.grupoPVC.add("edittext", undefined, "1");
                        campoQuantidadePVC.characters = 4;
                        funcoes.apenasNumerosEVirgula(campoQuantidadePVC);

                        var botaoAdicionarPVC = config.grupoPVC.add("button", undefined, config.t("adicionarPVC"));

                        botaoAdicionarPVC.onClick = function() {
                            var tipoPVC = campoTipoPVC.selection ? campoTipoPVC.selection.text : "";
                            var descricaoPVC = String(campoDescricaoPVC.text || "").replace(/^\s+/, "").replace(/\s+$/, "");
                            var unidadePVC = campoUnidadePVC.selection ? campoUnidadePVC.selection.text : "units";
                            var quantidadePVC = parseFloat(String(campoQuantidadePVC.text || "").replace(',', '.'));

                            if (tipoPVC === "" || descricaoPVC === "" || isNaN(quantidadePVC) || quantidadePVC <= 0) {
                                ui.mostrarAlertaPersonalizado(config.t("preencherCampos"), "Campo Obrigatório");
                                return;
                            }

                            var nomePVC = tipoPVC;
                            var textoPVC = tipoPVC + " " + descricaoPVC + " (" + unidadePVC + "): " + quantidadePVC.toFixed(2).replace('.', ',');

                            config.itensLegenda.push({
                                tipo: "pvc",
                                subtipo: tipoPVC,
                                nome: nomePVC,
                                descricao: descricaoPVC,
                                texto: textoPVC,
                                unidade: unidadePVC,
                                quantidade: quantidadePVC
                            });

                            config.atualizarListaItens();
                            campoTipoPVC.selection = 0;
                            campoDescricaoPVC.text = "";
                            campoQuantidadePVC.text = "1";
                        };

                        config.janela.layout.layout(true);
                        config.janela.layout.resize();
                    } else {
                        if (config.grupoPVC) {
                            config.grupoPVC.parent.remove(config.grupoPVC);
                            config.grupoPVC = null;
                            config.janela.layout.layout(true);
                            config.janela.layout.resize();
                        }
                    }
                };
            }

            if (config.checkboxMostrarGP) {
                config.checkboxMostrarGP.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "checkboxMostrarGP - valor: " + this.value);
                    }

                    if (this.value) {
                        if (typeof funcoesGP === 'undefined' || !funcoesGP) {
                            ui.mostrarAlertaPersonalizado("Módulo de GP não disponível.", "Erro");
                            this.value = false;
                            return;
                        }

                        funcoesGP.garantirEstrutura(config.dados);

                        config.grupoGP = config.abaGeral.add("panel", undefined, "GP");
                        config.grupoGP.orientation = "column";
                        config.grupoGP.alignChildren = ["left", "top"];
                        config.grupoGP.spacing = 8;

                        var linhaGP = config.grupoGP.add("group");
                        linhaGP.orientation = "row";
                        linhaGP.alignChildren = ["left", "center"];
                        linhaGP.spacing = 5;

                        linhaGP.add("statictext", undefined, "\u00D8");
                        var listaEspessuraGP = linhaGP.add("dropdownlist", undefined, ["Selecione " + "\u00D8"].concat(funcoesGP.listarEspessuras(config.dados)));
                        listaEspessuraGP.selection = 0;

                        linhaGP.add("statictext", undefined, "Cor");
                        var listaCorGP = linhaGP.add("dropdownlist", undefined, ["Selecione cor"]);
                        listaCorGP.selection = 0;

                        linhaGP.add("statictext", undefined, "Lucioles");
                        var listaLuciolesGP = linhaGP.add("dropdownlist", undefined, ["Sem lucioles", "LED blanc pur", "LED blanc chaud"]);
                        listaLuciolesGP.selection = 0;

                        linhaGP.add("statictext", undefined, "ml");
                        var campoQuantidadeGP = linhaGP.add("edittext", undefined, "1");
                        campoQuantidadeGP.characters = 4;
                        funcoes.apenasNumerosEVirgula(campoQuantidadeGP);

                        var botaoAdicionarGP = linhaGP.add("button", undefined, "Adicionar GP");

                        function repopularDropdown(dropdown, placeholder, itens) {
                            dropdown.removeAll();
                            dropdown.add("item", placeholder);
                            for (var i = 0; i < itens.length; i++) {
                                dropdown.add("item", itens[i]);
                            }
                            dropdown.selection = 0;
                        }

                        function selecionarPorTexto(dropdown, texto) {
                            if (!dropdown || !dropdown.items || !texto) {
                                return false;
                            }
                            for (var i = 0; i < dropdown.items.length; i++) {
                                if (dropdown.items[i].text === texto) {
                                    dropdown.selection = i;
                                    return true;
                                }
                            }
                            return false;
                        }

                        function atualizarCoresGP() {
                            if (!listaEspessuraGP.selection || listaEspessuraGP.selection.index <= 0) {
                                repopularDropdown(listaCorGP, "Selecione cor", []);
                                return;
                            }
                            repopularDropdown(
                                listaCorGP,
                                "Selecione cor",
                                funcoesGP.listarCores(config.dados, listaEspessuraGP.selection.text)
                            );
                        }

                        function restaurarUltimaSelecaoGP() {
                            var ultimaSelecaoGP = config.ultimaSelecao ? config.ultimaSelecao.gp : null;
                            if (!ultimaSelecaoGP) {
                                return;
                            }

                            if (ultimaSelecaoGP.espessura) {
                                selecionarPorTexto(listaEspessuraGP, ultimaSelecaoGP.espessura);
                                atualizarCoresGP();
                            }

                            if (ultimaSelecaoGP.cor) {
                                selecionarPorTexto(listaCorGP, ultimaSelecaoGP.cor);
                            }

                            if (typeof ultimaSelecaoGP.lucioles !== "undefined" && ultimaSelecaoGP.lucioles !== null) {
                                listaLuciolesGP.selection = ultimaSelecaoGP.lucioles;
                            }

                            if (ultimaSelecaoGP.quantidade) {
                                campoQuantidadeGP.text = ultimaSelecaoGP.quantidade;
                            }
                        }

                        listaEspessuraGP.onChange = atualizarCoresGP;

                        botaoAdicionarGP.onClick = function() {
                            if (!listaEspessuraGP.selection || listaEspessuraGP.selection.index <= 0 ||
                                !listaCorGP.selection || listaCorGP.selection.index <= 0) {
                                ui.mostrarAlertaPersonalizado("Preencha diâmetro e cor do GP.", "Campo Obrigatório");
                                return;
                            }

                            var quantidadeGP = parseFloat(String(campoQuantidadeGP.text || "").replace(",", "."));
                            if (isNaN(quantidadeGP) || quantidadeGP <= 0) {
                                ui.mostrarAlertaPersonalizado("Quantidade inválida para GP.", "Campo Obrigatório");
                                return;
                            }

                            var modoLucioles = "none";
                            if (listaLuciolesGP.selection && listaLuciolesGP.selection.index === 1) {
                                modoLucioles = "blanc_pur";
                            } else if (listaLuciolesGP.selection && listaLuciolesGP.selection.index === 2) {
                                modoLucioles = "blanc_chaud";
                            }

                            try {
                                if (config.ultimaSelecao) {
                                    config.ultimaSelecao.gp = {
                                        espessura: listaEspessuraGP.selection.text,
                                        cor: listaCorGP.selection.text,
                                        unidade: "ml",
                                        lucioles: listaLuciolesGP.selection ? listaLuciolesGP.selection.index : 0,
                                        quantidade: campoQuantidadeGP.text
                                    };
                                }

                                var nomeBaseGP = "GP " + listaEspessuraGP.selection.text + " " + listaCorGP.selection.text;
                                var unidadeBaseGP = "ml";

                                // Substituir qualquer GP anterior equivalente para evitar
                                // deixar um item de lucioles preso de uma seleção antiga.
                                for (var r = config.itensLegenda.length - 1; r >= 0; r--) {
                                    var itemExistente = config.itensLegenda[r];
                                    if ((itemExistente.tipo === "gp" || itemExistente.tipo === "gp_lucioles") &&
                                        itemExistente.nome &&
                                        (itemExistente.nome === nomeBaseGP || itemExistente.grupoVinculadoId) &&
                                        itemExistente.unidade === unidadeBaseGP) {
                                        var grupoRemover = itemExistente.grupoVinculadoId;
                                        if (grupoRemover) {
                                            if (typeof funcoesGP !== 'undefined' && funcoesGP && funcoesGP.removerGrupoVinculado) {
                                                funcoesGP.removerGrupoVinculado(config.itensLegenda, grupoRemover);
                                            } else {
                                                for (var rr = config.itensLegenda.length - 1; rr >= 0; rr--) {
                                                    if (config.itensLegenda[rr].grupoVinculadoId === grupoRemover) {
                                                        config.itensLegenda.splice(rr, 1);
                                                    }
                                                }
                                            }
                                        } else if (itemExistente.nome === nomeBaseGP) {
                                            config.itensLegenda.splice(r, 1);
                                        }
                                    }
                                }

                                var itensGP = funcoesGP.criarItens(
                                    config.dados,
                                    listaEspessuraGP.selection.text,
                                    listaCorGP.selection.text,
                                    "ml",
                                    quantidadeGP,
                                    modoLucioles,
                                    config.itensLegenda
                                );

                                for (var i = 0; i < itensGP.length; i++) {
                                    config.itensLegenda.push(itensGP[i]);
                                }

                                if (typeof funcoesGP !== 'undefined' && funcoesGP && funcoesGP.fundirLuciolesDuplicados) {
                                    funcoesGP.fundirLuciolesDuplicados(config.itensLegenda);
                                }

                                config.atualizarListaItens();
                                restaurarUltimaSelecaoGP();
                            } catch (e) {
                                ui.mostrarAlertaPersonalizado("Erro ao adicionar GP: " + e.message, "Erro");
                            }
                        };

                        restaurarUltimaSelecaoGP();

                        config.janela.layout.layout(true);
                        config.janela.layout.resize();
                    } else {
                        if (config.grupoGP) {
                            config.grupoGP.parent.remove(config.grupoGP);
                            config.grupoGP = null;
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

                    try {
                        atualizarDropdownRecomendacoesPrint(config, config.termoPesquisaPrint || "", true);
                    } catch (erro) {
                        if (logs && logs.adicionarLog && logs.TIPOS_LOG) {
                            logs.adicionarLog("Erro ao atualizar recomendações PRINT por uso: " + erro.message, logs.TIPOS_LOG.ERROR);
                        }
                    }
                };
            }

            if (config.listaFixacao) {
                config.listaFixacao.onChange = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("change", "listaFixacao - " + (this.selection ? this.selection.text : "nenhuma seleção"));
                    }
                    atualizarDropdownRecomendacoesPrint(config, config.termoPesquisaPrint || "", true);
                };
            }

            if (config.linhaPrint && config.linhaPrint.listaComponentes) {
                config.linhaPrint.listaComponentes.filtrarCustom = function(termo) {
                    atualizarDropdownRecomendacoesPrint(config, termo, true);
                };
            }

            // Evento para dropdown Densité LED
            if (config.campoDensiteLed) {
                config.campoDensiteLed.onChange = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("change", "campoDensiteLed - " + (this.selection ? this.selection.text : "nenhuma seleção"));
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

            // Acrescentar recomendação ao evento existente sem criar elementos na janela.
            if (config.linhaPrint && config.linhaPrint.listaComponentes) {
                var listaPrint = config.linhaPrint.listaComponentes;
                var eventoBasePrint = listaPrint.onChange;
                listaPrint.onChange = function() {
                    if (this.atualizandoRecomendacoes) {
                        return;
                    }
                    if (eventoBasePrint) {
                        eventoBasePrint.call(this);
                    }
                    var avaliacao = obterAvaliacaoSelecaoPrint(config);
                    atualizarAjudaSelecaoPrint(config);
                    if (avaliacao) {
                        mostrarAvisoAvaliacaoPrint(config, avaliacao);
                    }
                };
                atualizarDropdownRecomendacoesPrint(config, config.termoPesquisaPrint || "", true);
            }

            // Eventos de botões adicionar
            if (config.linhaPrint && config.linhaPrint.botaoAdicionar) {
                config.linhaPrint.botaoAdicionar.onClick = function() {
                    if (logs && logs.logEvento) {
                        logs.logEvento("click", "botaoAdicionarComponente_PRINT");
                    }
                    var avaliacaoPrintAdicionar = obterAvaliacaoSelecaoPrint(config);
                    if (avaliacaoPrintAdicionar) {
                        mostrarAvisoAvaliacaoPrint(config, avaliacaoPrintAdicionar);
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

                    // Verificar se o uso foi selecionado
                    if (!config.campoUsage || !config.campoUsage.selection || config.campoUsage.selection.index === 0) {
                        ui.mostrarAlertaPersonalizado(config.t("selecionarUsage"), "Campo Obrigatório");
                        if (config.campoUsage) {
                            config.campoUsage.active = true;
                        }
                        return;
                    }

                    // Avisos de PRINT são informativos e nunca bloqueiam a geração.
                    mostrarAvisosPrintDaLegenda(config);

                    // A densidade LED só é obrigatória quando a legenda contém lucioles
                    var exigeDensidadeLed = legendaTemLucioles(config.itensLegenda);
                    if (exigeDensidadeLed &&
                        (!config.campoDensiteLed ||
                         !config.campoDensiteLed.selection ||
                         config.campoDensiteLed.selection.index === 0)) {
                        ui.mostrarAlertaPersonalizado(config.t("selecionarDensiteLed"), "Campo Obrigatório");
                        if (config.campoDensiteLed) {
                            config.campoDensiteLed.active = true;
                        }
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
