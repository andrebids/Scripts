/**
 * componentRows.jsx
 *
 * Fábricas de linhas de componentes para a janela principal.
 */

function criarLinhaGrupoComponentes(grupoPai, labelGrupo, componentesGrupo, opcoes) {
    var grupoLinha = grupoPai.add("group");
    grupoLinha.orientation = "row";
    grupoLinha.alignChildren = "center";
    grupoLinha.add("statictext", undefined, labelGrupo);

    var listaComponentes = grupoLinha.add("dropdownlist", undefined, [opcoes.t("selecioneComponente")].concat(componentesGrupo));
    listaComponentes.selection = 0;

    var listaCores = grupoLinha.add("dropdownlist", undefined, [opcoes.t("selecioneCor")].concat(extrairNomes(opcoes.dados.cores)));
    listaCores.selection = 0;

    var listaUnidades = grupoLinha.add("dropdownlist", undefined, [opcoes.t("selecioneUnidade")]);
    listaUnidades.selection = 0;

    var grupoQuantidades = grupoLinha.add("group");
    grupoQuantidades.orientation = "row";
    grupoQuantidades.alignChildren = "center";

    var camposQuantidade = [];

    function criarCampoQuantidade(valorPadrao) {
        while (camposQuantidade.length > 0) {
            grupoQuantidades.remove(camposQuantidade[0]);
            camposQuantidade.splice(0, 1);
        }

        var campo = grupoQuantidades.add("edittext", undefined, valorPadrao ? valorPadrao : "");
        campo.characters = 4;
        campo.preferredSize.width = 40;
        camposQuantidade.push(campo);
        return campo;
    }

    function criarCampoTemp(grupoCampos, camposTemp, dialogQuantidades, valorPadrao, descricaoPadrao, atualizarSoma) {
        try {
            var grupoLinhaTemp = grupoCampos.add("group");
            grupoLinhaTemp.orientation = "row";
            grupoLinhaTemp.alignChildren = ["left", "center"];
            grupoLinhaTemp.spacing = 5;

            var campoTemp = grupoLinhaTemp.add("edittext", undefined, valorPadrao ? valorPadrao : "");
            campoTemp.characters = 4;
            campoTemp.preferredSize.width = 40;

            campoTemp.addEventListener("keydown", function(event) {
                if (event.keyName === "Tab") {
                    event.preventDefault();
                    var indiceCampoAtual = -1;
                    for (var k = 0; k < camposTemp.length; k++) {
                        if (camposTemp[k].campo === campoTemp) {
                            indiceCampoAtual = k;
                            break;
                        }
                    }
                    if (indiceCampoAtual >= 0) {
                        if (indiceCampoAtual < camposTemp.length - 1) {
                            camposTemp[indiceCampoAtual + 1].campo.active = true;
                        } else if (campoTemp.text && campoTemp.text.length > 0) {
                            var novoCampo = criarCampoTemp(grupoCampos, camposTemp, dialogQuantidades, "", "", atualizarSoma);
                            dialogQuantidades.layout.layout(true);
                            dialogQuantidades.layout.resize();
                            novoCampo.active = true;
                        }
                    }
                }
            });

            campoTemp.onChanging = function() {
                var texto = campoTemp.text;
                var textoLimpo = texto.replace(/[^0-9.,\-]/g, "");
                if (texto !== textoLimpo) {
                    campoTemp.text = textoLimpo;
                }
            };

            var campoDescricao = grupoLinhaTemp.add("edittext", undefined, descricaoPadrao ? descricaoPadrao : "");
            campoDescricao.characters = 15;
            campoDescricao.preferredSize.width = 120;
            campoDescricao.helpTip = "Descrição opcional (não conta no total)";

            camposTemp.push({ campo: campoTemp, descricao: campoDescricao, grupo: grupoLinhaTemp });

            var botaoRemoverTemp = grupoLinhaTemp.add("button", undefined, "-");
            botaoRemoverTemp.preferredSize.width = 22;
            botaoRemoverTemp.preferredSize.height = 22;
            botaoRemoverTemp.onClick = function() {
                for (var i = 0; i < camposTemp.length; i++) {
                    if (camposTemp[i].campo === campoTemp) {
                        grupoCampos.remove(camposTemp[i].grupo);
                        camposTemp.splice(i, 1);
                        break;
                    }
                }
                atualizarSoma();
                dialogQuantidades.layout.layout(true);
                dialogQuantidades.layout.resize();
            };

            campoTemp.addEventListener("changing", function() {
                atualizarSoma();
                var isUltimoCampo = camposTemp[camposTemp.length - 1].campo === campoTemp;
                var temValor = campoTemp.text && campoTemp.text.length > 0;

                if (isUltimoCampo && temValor) {
                    criarCampoTemp(grupoCampos, camposTemp, dialogQuantidades, "", "", atualizarSoma);
                    dialogQuantidades.layout.layout(true);
                    dialogQuantidades.layout.resize();
                }
            });

            campoTemp.onDeactivate = function() {
                var valor = parseFloat(campoTemp.text.replace(",", "."));
                if (campoTemp.text && (isNaN(valor) || valor <= 0)) {
                    campoTemp.graphics.backgroundColor = campoTemp.graphics.newBrush(campoTemp.graphics.BrushType.SOLID_COLOR, [1, 0.9, 0.9]);
                } else {
                    campoTemp.graphics.backgroundColor = campoTemp.graphics.newBrush(campoTemp.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
                }
            };

            return campoTemp;
        } catch (e) {
            alert("ERRO na criarCampoTemp: " + e.toString() + "\nLinha: " + e.line);
            return null;
        }
    }

    function abrirDialogQuantidades() {
        try {
            var dialogQuantidades = new Window("palette", "Editar Quantidades");
            dialogQuantidades.orientation = "column";
            dialogQuantidades.alignChildren = ["fill", "top"];
            dialogQuantidades.spacing = 10;
            dialogQuantidades.margins = 16;
            dialogQuantidades.preferredSize.width = 320;
            dialogQuantidades.preferredSize.height = 400;

            dialogQuantidades.onClose = function() {
                try {
                    if (!opcoes.janela || opcoes.janela.toString() === "[object Window]") {
                        return true;
                    }
                    return true;
                } catch (e) {
                    return true;
                }
            };

            var tituloSecao = dialogQuantidades.add("statictext", undefined, "Campos de Valores:");
            tituloSecao.graphics.font = ScriptUI.newFont(tituloSecao.graphics.font.family, ScriptUI.FontStyle.BOLD, 10);

            var grupoCabecalho = dialogQuantidades.add("group");
            grupoCabecalho.orientation = "row";
            grupoCabecalho.alignChildren = ["left", "center"];
            grupoCabecalho.spacing = 5;

            var labelValor = grupoCabecalho.add("statictext", undefined, "Valor");
            labelValor.preferredSize.width = 40;
            labelValor.graphics.font = ScriptUI.newFont(labelValor.graphics.font.family, ScriptUI.FontStyle.BOLD, 9);

            var labelDescricao = grupoCabecalho.add("statictext", undefined, "Descrição (opcional)");
            labelDescricao.preferredSize.width = 120;
            labelDescricao.graphics.font = ScriptUI.newFont(labelDescricao.graphics.font.family, ScriptUI.FontStyle.BOLD, 9);

            var painelCampos = dialogQuantidades.add("panel");
            painelCampos.orientation = "column";
            painelCampos.alignChildren = ["fill", "top"];
            painelCampos.preferredSize.width = 290;
            painelCampos.preferredSize.height = 150;

            var grupoCampos = painelCampos.add("group");
            grupoCampos.orientation = "column";
            grupoCampos.alignChildren = ["fill", "top"];
            var camposTemp = [];

            var separador = dialogQuantidades.add("panel");
            separador.preferredSize.height = 2;

            var painelResumo = dialogQuantidades.add("panel", undefined, "Resumo");
            painelResumo.orientation = "column";
            painelResumo.alignChildren = ["fill", "top"];
            painelResumo.spacing = 8;
            painelResumo.margins = 10;

            var grupoValores = painelResumo.add("group");
            grupoValores.orientation = "column";
            grupoValores.alignChildren = ["fill", "top"];

            var labelValores = grupoValores.add("statictext", undefined, "Valores inseridos:");
            labelValores.graphics.font = ScriptUI.newFont(labelValores.graphics.font.family, ScriptUI.FontStyle.BOLD, 9);

            var areaValores = grupoValores.add("edittext", undefined, "-", { multiline: true, scrollable: true, readonly: true });
            areaValores.preferredSize.width = 280;
            areaValores.preferredSize.height = 50;
            areaValores.graphics.font = ScriptUI.newFont(areaValores.graphics.font.family, ScriptUI.FontStyle.REGULAR, 9);

            var grupoSoma = painelResumo.add("panel");
            grupoSoma.orientation = "row";
            grupoSoma.alignChildren = ["center", "center"];
            grupoSoma.margins = 8;
            grupoSoma.preferredSize.width = 280;
            grupoSoma.preferredSize.height = 35;

            var textoSoma = grupoSoma.add("statictext", undefined, "TOTAL: 0");
            textoSoma.graphics.font = ScriptUI.newFont("Arial", ScriptUI.FontStyle.BOLD, 16);
            textoSoma.graphics.foregroundColor = textoSoma.graphics.newPen(textoSoma.graphics.PenType.SOLID_COLOR, [1, 1, 1], 1);
            textoSoma.preferredSize.width = 200;
            textoSoma.preferredSize.height = 25;

            function atualizarSoma() {
                var numerosValidos = [];
                var valoresInvalidos = 0;

                for (var i = 0; i < camposTemp.length; i++) {
                    var textoOriginal = camposTemp[i].campo.text;
                    var valor = parseFloat(textoOriginal.replace(",", "."));

                    if (!isNaN(valor) && valor > 0) {
                        numerosValidos.push(valor);
                    } else if (textoOriginal && textoOriginal.length > 0) {
                        valoresInvalidos++;
                    }
                }

                if (numerosValidos.length > 0) {
                    var textoValores = "";
                    if (numerosValidos.length <= 6) {
                        var numerosFormatados = [];
                        for (var j = 0; j < numerosValidos.length; j++) {
                            numerosFormatados.push(numerosValidos[j].toString());
                        }
                        textoValores = numerosFormatados.join(" + ");
                    } else {
                        for (var k = 0; k < numerosValidos.length; k++) {
                            if (k > 0 && k % 5 === 0) {
                                textoValores += "\n";
                            }
                            textoValores += numerosValidos[k].toString();
                            if (k < numerosValidos.length - 1) {
                                textoValores += " + ";
                            }
                        }
                    }
                    areaValores.text = textoValores;
                } else {
                    areaValores.text = "-";
                }

                var somaExibicao = 0;
                for (var x = 0; x < numerosValidos.length; x++) {
                    somaExibicao += numerosValidos[x];
                }

                var textoTotal = "TOTAL: " + String(somaExibicao);
                if (valoresInvalidos > 0) {
                    textoTotal += " (" + valoresInvalidos + " inválido" + (valoresInvalidos > 1 ? "s" : "") + ")";
                }

                textoSoma.text = textoTotal;
                textoSoma.parent.layout.layout(true);
                textoSoma.parent.layout.resize();
            }

            for (var i = 0; i < camposQuantidade.length; i++) {
                criarCampoTemp(grupoCampos, camposTemp, dialogQuantidades, camposQuantidade[i].text, "", atualizarSoma);
            }

            if (camposTemp.length === 0) {
                criarCampoTemp(grupoCampos, camposTemp, dialogQuantidades, "", "", atualizarSoma);
            }

            if (camposTemp.length > 0) {
                camposTemp[0].campo.active = true;
            }

            atualizarSoma();

            var grupoBotoes = dialogQuantidades.add("group");
            grupoBotoes.orientation = "row";
            var botaoOK = grupoBotoes.add("button", undefined, "OK");
            var botaoCancelar = grupoBotoes.add("button", undefined, "Cancelar");

            botaoOK.onClick = function() {
                while (camposQuantidade.length > 0) {
                    grupoQuantidades.remove(camposQuantidade[0]);
                    camposQuantidade.splice(0, 1);
                }

                var soma = 0;
                for (var i = 0; i < camposTemp.length; i++) {
                    var valor = parseFloat(camposTemp[i].campo.text.replace(",", "."));
                    if (!isNaN(valor) && valor > 0) {
                        soma += valor;
                    }
                }

                criarCampoQuantidade(soma > 0 ? soma : "");
                grupoLinha.layout.layout(true);
                grupoLinha.layout.resize();
                dialogQuantidades.close();
            };

            botaoCancelar.onClick = function() {
                dialogQuantidades.close();
            };

            dialogQuantidades.show();
        } catch (e) {
            alert("ERRO GERAL na janela: " + e.toString() + "\nLinha: " + e.line + "\nDescrição: " + e.description);
        }
    }

    criarCampoQuantidade("");

    var botaoMais = grupoQuantidades.add("button", undefined, "+");
    botaoMais.preferredSize.width = 22;
    botaoMais.preferredSize.height = 22;
    botaoMais.onClick = abrirDialogQuantidades;

    grupoLinha.add("statictext", undefined, "x");
    var campoMultiplicador = grupoLinha.add("edittext", undefined, "1");
    campoMultiplicador.characters = 2;
    campoMultiplicador.preferredSize.width = 25;
    opcoes.funcoes.apenasNumerosEVirgula(campoMultiplicador);

    var botaoAdicionar = grupoLinha.add("button", undefined, opcoes.t("botaoAdicionar"));

    return {
        listaComponentes: listaComponentes,
        listaCores: listaCores,
        listaUnidades: listaUnidades,
        camposQuantidade: camposQuantidade,
        campoMultiplicador: campoMultiplicador,
        botaoAdicionar: botaoAdicionar
    };
}

$.global.componentRows = {
    criarLinhaGrupo: criarLinhaGrupoComponentes
};
