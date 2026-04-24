#target illustrator
#targetengine maintarget

/**
 * extraPanel.jsx
 *
 * Gestão centralizada dos módulos opcionais da secção Extra.
 * Controla ativação, remoção e estado visual sem crescer a janela principal.
 */

$.global.extraPanel = {};

(function() {
    "use strict";

    var extraPanel = $.global.extraPanel;

    function relayout(config) {
        if (config && config.atualizarAlturaExtra) {
            config.atualizarAlturaExtra();
            return;
        }

        if (config && config.janela && config.janela.layout) {
            config.janela.layout.layout(true);
            config.janela.layout.resize();
        }
    }

    function marcarModuloAtivo(chave, ativo) {
        if (!$.global.extraState || !$.global.extraState.ativos) {
            return;
        }
        $.global.extraState.ativos[chave] = ativo;
    }

    function obterTituloModulo(chave, config) {
        switch (chave) {
            case "observacoes":
                return config.t("observacoes");
            case "componenteExtra":
                return config.checkboxMostrarComponenteExtra ? config.checkboxMostrarComponenteExtra.text : "Componente Extra";
            case "pvc":
                return config.checkboxMostrarPVC ? config.checkboxMostrarPVC.text : "PVC";
            case "texturas":
                return config.t("texturas");
            case "bolas":
                return config.t("painelBolas");
            case "contador":
                return config.t("contador");
            case "alfabeto":
                return config.t("alfabeto");
            default:
                return chave;
        }
    }

    function criarModuloBolas(parent, config) {
        var grupoBolasExtra = parent.add("group");
        grupoBolasExtra.orientation = "column";
        grupoBolasExtra.alignChildren = ["left", "top"];
        grupoBolasExtra.alignment = ["fill", "top"];

        var grupoBolasSelecao = grupoBolasExtra.add("group");
        grupoBolasSelecao.orientation = "row";
        grupoBolasSelecao.alignChildren = ["left", "center"];

        var coresBolasDisponiveis = funcoesFiltragem.getCoresDisponiveisBolas(
            config.dados,
            config.t,
            funcoes.arrayContains,
            funcoes.encontrarPorId
        );
        var listaCoresBolas = grupoBolasSelecao.add("dropdownlist", undefined, coresBolasDisponiveis);
        listaCoresBolas.selection = 0;

        var listaAcabamentos = grupoBolasSelecao.add("dropdownlist", undefined, [config.t("selecioneAcabamento")]);
        listaAcabamentos.selection = 0;

        var listaTamanhos = grupoBolasSelecao.add("dropdownlist", undefined, [config.t("selecioneTamanho")]);
        listaTamanhos.selection = 0;

        var campoQuantidadeBolas = grupoBolasSelecao.add("edittext", undefined, "1");
        campoQuantidadeBolas.characters = 5;
        funcoes.apenasNumerosEVirgula(campoQuantidadeBolas);

        var botaoAdicionarBola = grupoBolasSelecao.add("button", undefined, config.t("adicionarBola"));

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

        return {
            grupoBolasExtra: grupoBolasExtra,
            listaCoresBolas: listaCoresBolas,
            listaAcabamentos: listaAcabamentos,
            listaTamanhos: listaTamanhos,
            campoQuantidadeBolas: campoQuantidadeBolas,
            botaoAdicionarBola: botaoAdicionarBola
        };
    }

    function criarModuloComponenteExtra(parent, config) {
        var painel = parent.add("group");
        painel.orientation = "column";
        painel.alignChildren = ["fill", "top"];
        painel.alignment = ["fill", "top"];

        var grupoComponenteExtra = painel.add("group");
        grupoComponenteExtra.orientation = "row";
        grupoComponenteExtra.alignChildren = ["left", "center"];
        grupoComponenteExtra.spacing = 5;

        grupoComponenteExtra.add("statictext", undefined, config.t("nomeComponenteExtra"));
        var campoNomeExtra = grupoComponenteExtra.add("edittext", undefined, "");
        campoNomeExtra.characters = 12;

        grupoComponenteExtra.add("statictext", undefined, config.t("unidadeComponenteExtra"));
        var opcoesUnidadeExtra = ["m2", "ml", "unit"];
        var campoUnidadeExtra = grupoComponenteExtra.add("dropdownlist", undefined, opcoesUnidadeExtra);
        campoUnidadeExtra.selection = 0;

        grupoComponenteExtra.add("statictext", undefined, config.t("quantidadeComponenteExtra"));
        var campoQuantidadeExtra = grupoComponenteExtra.add("edittext", undefined, "1");
        campoQuantidadeExtra.characters = 4;
        funcoes.apenasNumerosEVirgula(campoQuantidadeExtra);

        var botaoAdicionarExtra = grupoComponenteExtra.add("button", undefined, config.t("adicionarComponenteExtra"));

        botaoAdicionarExtra.onClick = function() {
            var nomeExtra = campoNomeExtra.text;
            var unidadeExtra = campoUnidadeExtra.selection ? campoUnidadeExtra.selection.text : "";
            var quantidadeExtra = parseFloat(String(campoQuantidadeExtra.text || "").replace(",", "."));

            if (nomeExtra === "" || isNaN(quantidadeExtra) || quantidadeExtra <= 0) {
                ui.mostrarAlertaPersonalizado(config.t("preencherCampos"), "Campo Obrigatório");
                return;
            }

            var textoExtra = nomeExtra + " (" + unidadeExtra + "): " + quantidadeExtra.toFixed(2).replace(".", ",");
            config.itensLegenda.push({
                tipo: "extra",
                nome: nomeExtra,
                texto: textoExtra,
                unidade: unidadeExtra,
                quantidade: quantidadeExtra
            });

            config.atualizarListaItens();
            campoNomeExtra.text = "";
            campoQuantidadeExtra.text = "1";
        };

        return {
            painel: painel,
            grupoComponenteExtra: grupoComponenteExtra,
            campoNomeExtra: campoNomeExtra,
            campoUnidadeExtra: campoUnidadeExtra,
            campoQuantidadeExtra: campoQuantidadeExtra,
            botaoAdicionarExtra: botaoAdicionarExtra
        };
    }

    function criarModuloPVC(parent, config) {
        var painel = parent.add("group");
        painel.orientation = "column";
        painel.alignChildren = ["fill", "top"];
        painel.alignment = ["fill", "top"];

        var grupoPVC = painel.add("group");
        grupoPVC.orientation = "row";
        grupoPVC.alignChildren = ["left", "center"];
        grupoPVC.spacing = 5;

        grupoPVC.add("statictext", undefined, config.t("tipoPVC"));
        var opcoesTipoPVC = [
            config.t("opcaoPVC"),
            config.t("opcaoDisquePlexi"),
            config.t("opcaoImpression")
        ];
        var campoTipoPVC = grupoPVC.add("dropdownlist", undefined, opcoesTipoPVC);
        campoTipoPVC.selection = 0;

        grupoPVC.add("statictext", undefined, config.t("descricaoPVC"));
        var campoDescricaoPVC = grupoPVC.add("edittext", undefined, "");
        campoDescricaoPVC.characters = 18;

        grupoPVC.add("statictext", undefined, config.t("unidadePVC"));
        var campoUnidadePVC = grupoPVC.add("dropdownlist", undefined, ["units"]);
        campoUnidadePVC.selection = 0;

        grupoPVC.add("statictext", undefined, config.t("quantidadePVC"));
        var campoQuantidadePVC = grupoPVC.add("edittext", undefined, "1");
        campoQuantidadePVC.characters = 4;
        funcoes.apenasNumerosEVirgula(campoQuantidadePVC);

        var botaoAdicionarPVC = grupoPVC.add("button", undefined, config.t("adicionarPVC"));

        botaoAdicionarPVC.onClick = function() {
            var tipoPVC = campoTipoPVC.selection ? campoTipoPVC.selection.text : "";
            var descricaoPVC = String(campoDescricaoPVC.text || "").replace(/^\s+/, "").replace(/\s+$/, "");
            var unidadePVC = campoUnidadePVC.selection ? campoUnidadePVC.selection.text : "units";
            var quantidadePVC = parseFloat(String(campoQuantidadePVC.text || "").replace(",", "."));

            if (tipoPVC === "" || descricaoPVC === "" || isNaN(quantidadePVC) || quantidadePVC <= 0) {
                ui.mostrarAlertaPersonalizado(config.t("preencherCampos"), "Campo Obrigatório");
                return;
            }

            var nomePVC = tipoPVC;
            var textoPVC = tipoPVC + " " + descricaoPVC + " (" + unidadePVC + "): " + quantidadePVC.toFixed(2).replace(".", ",");

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

        return {
            painel: painel,
            grupoPVC: grupoPVC,
            campoTipoPVC: campoTipoPVC,
            campoDescricaoPVC: campoDescricaoPVC,
            campoUnidadePVC: campoUnidadePVC,
            campoQuantidadePVC: campoQuantidadePVC,
            botaoAdicionarPVC: botaoAdicionarPVC
        };
    }

    function obterDefinicoes(config) {
        return {
            observacoes: {
                create: function(parent) {
                    return ui.criarInterfaceObservacoes(parent, config.janela, config.t, {useGroup: true});
                }
            },
            componenteExtra: {
                create: function(parent) {
                    return criarModuloComponenteExtra(parent, config);
                }
            },
            pvc: {
                create: function(parent) {
                    return criarModuloPVC(parent, config);
                }
            },
            texturas: {
                create: function(parent) {
                    return ui.criarInterfaceTexturas(parent, config.janela, config.t, funcoesFiltragem, config.itensLegenda, config.atualizarListaItens, {useGroup: true});
                }
            },
            bolas: {
                create: function(parent) {
                    return criarModuloBolas(parent, config);
                }
            },
            contador: {
                create: function(parent) {
                    return ui.criarInterfaceContadorBolas(parent, config.dados, config.itensLegenda, config.atualizarListaItens);
                }
            },
            alfabeto: {
                create: function(parent) {
                    return alfabeto.criarInterfaceAlfabeto(
                        parent,
                        config.dados,
                        config.janela,
                        config.t,
                        funcoesFiltragem,
                        funcoes,
                        config.itensLegenda,
                        config.atualizarListaItens,
                        config.campoNomeTipo,
                        config.grupoDimensoes,
                        {useGroup: true}
                    );
                }
            }
        };
    }

    function aplicarReferenciasConfig(config, chave, instancia) {
        switch (chave) {
            case "observacoes":
                config.componentesObservacoes = instancia;
                $.global.componentesObservacoes = instancia;
                break;
            case "componenteExtra":
                config.grupoComponenteExtra = instancia ? instancia.grupoComponenteExtra : null;
                break;
            case "pvc":
                config.grupoPVC = instancia ? instancia.grupoPVC : null;
                break;
            case "texturas":
                config.componentesTextura = instancia;
                break;
            case "bolas":
                config.grupoBolasExtra = instancia ? instancia.grupoBolasExtra : null;
                break;
            case "contador":
                config.componentesContador = instancia;
                break;
            case "alfabeto":
                config.componentesAlfabeto = instancia;
                break;
        }
    }

    function ancorarInstanciaAoTopo(instancia) {
        if (!instancia) {
            return;
        }

        if (instancia.grupoObs) {
            instancia.grupoObs.alignment = ["fill", "top"];
        }
        if (instancia.grupoTexturas) {
            instancia.grupoTexturas.alignment = ["fill", "top"];
        }
        if (instancia.grupoAlfabeto) {
            instancia.grupoAlfabeto.alignment = ["fill", "top"];
        }
        if (instancia.grupo) {
            instancia.grupo.alignment = ["fill", "top"];
        }
        if (instancia.grupoBolasExtra) {
            instancia.grupoBolasExtra.alignment = ["fill", "top"];
        }
        if (instancia.painel) {
            instancia.painel.alignment = ["fill", "top"];
        }
    }

    function limparReferenciasConfig(config, chave) {
        switch (chave) {
            case "observacoes":
                config.componentesObservacoes = null;
                $.global.componentesObservacoes = null;
                break;
            case "componenteExtra":
                config.grupoComponenteExtra = null;
                break;
            case "pvc":
                config.grupoPVC = null;
                break;
            case "texturas":
                config.componentesTextura = null;
                break;
            case "bolas":
                config.grupoBolasExtra = null;
                break;
            case "contador":
                config.componentesContador = null;
                break;
            case "alfabeto":
                config.componentesAlfabeto = null;
                break;
        }
    }

    extraPanel.inicializar = function(config) {
        var manager = {
            config: config,
            definicoes: obterDefinicoes(config),
            instancias: {}
        };

        manager.atualizarEstadoVazio = function() {
            var quantidade = 0;
            for (var chave in manager.instancias) {
                if (manager.instancias.hasOwnProperty(chave)) {
                    quantidade++;
                }
            }

            config.grupoConfigVazio.visible = quantidade === 0;
            config.tabsModulosExtra.visible = quantidade > 0;

            if (quantidade > 0 && !config.tabsModulosExtra.selection && config.tabsModulosExtra.children.length > 0) {
                config.tabsModulosExtra.selection = 0;
            }

            relayout(config);
        };

        manager.ativarModulo = function(chave) {
            var definicao = manager.definicoes[chave];
            if (!definicao) {
                throw new Error("Módulo extra não registado: " + chave);
            }

            if (manager.instancias[chave]) {
                config.abasExtra.selection = config.abaConfigurar;
                config.tabsModulosExtra.selection = manager.instancias[chave].tab;
                manager.atualizarEstadoVazio();
                return manager.instancias[chave].instance;
            }

            var tab = config.tabsModulosExtra.add("tab", undefined, obterTituloModulo(chave, config));
            tab.orientation = "column";
            tab.alignChildren = ["fill", "top"];
            tab.alignment = ["fill", "top"];
            tab.margins = [8, 6, 8, 6];

            var instance = definicao.create(tab);
            ancorarInstanciaAoTopo(instance);
            manager.instancias[chave] = {
                tab: tab,
                instance: instance
            };

            aplicarReferenciasConfig(config, chave, instance);
            marcarModuloAtivo(chave, true);

            config.abasExtra.selection = config.abaConfigurar;
            config.tabsModulosExtra.selection = tab;
            manager.atualizarEstadoVazio();

            return instance;
        };

        manager.desativarModulo = function(chave) {
            var registro = manager.instancias[chave];
            if (!registro) {
                limparReferenciasConfig(config, chave);
                marcarModuloAtivo(chave, false);
                manager.atualizarEstadoVazio();
                return;
            }

            if (registro.tab && registro.tab.parent) {
                registro.tab.parent.remove(registro.tab);
            }

            delete manager.instancias[chave];
            limparReferenciasConfig(config, chave);
            marcarModuloAtivo(chave, false);
            manager.atualizarEstadoVazio();
        };

        manager.toggleModulo = function(chave, ativo) {
            if (ativo) {
                return manager.ativarModulo(chave);
            }
            manager.desativarModulo(chave);
            return null;
        };

        manager.atualizarEstadoVazio();

        return manager;
    };
})();
