// funcoesComponentes.jsx
// Funções relacionadas a componentes do sistema de legendas
// A partir da etapa 5.2.2.5, funções deste domínio devem ser adicionadas aqui.

function atualizarUnidades(listaComponentes, listaCores, listaUnidades, dados, selecionarUnidadeMetrica, arrayContains) {
    if (listaComponentes.selection.index === 0 || listaCores.selection.index === 0) {
        // Limpar unidades se não há seleção válida
        listaUnidades.removeAll();
        listaUnidades.add("item", "Selecione uma unidade");
        listaUnidades.selection = 0;
        return;
    }

    var componenteSelecionado = dados.componentes[funcoes.encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
    var corSelecionada = dados.cores[funcoes.encontrarIndicePorNome(dados.cores, listaCores.selection.text)];
    
    if (!componenteSelecionado || !corSelecionada) {
        // Limpar unidades se dados inválidos
        listaUnidades.removeAll();
        listaUnidades.add("item", "Selecione uma unidade");
        listaUnidades.selection = 0;
        return;
    }
    
    var unidadesDisponiveis = ["Selecione uma unidade"];
    var unidadesIds = []; // Para evitar duplicatas

    for (var i = 0; i < dados.combinacoes.length; i++) {
        if (dados.combinacoes[i].componenteId === componenteSelecionado.id && dados.combinacoes[i].corId === corSelecionada.id) {
            if (!funcoes.arrayContains(unidadesIds, dados.combinacoes[i].unidade)) {
                unidadesDisponiveis.push(dados.combinacoes[i].unidade);
                unidadesIds.push(dados.combinacoes[i].unidade);
            }
        }
    }

    var selecaoAtual = listaUnidades.selection ? listaUnidades.selection.text : null;
    
    // Limpar e repopular o dropdown
    listaUnidades.removeAll();
    for (var i = 0; i < unidadesDisponiveis.length; i++) {
        listaUnidades.add("item", unidadesDisponiveis[i]);
    }

    // Selecionar unidade métrica automaticamente
    var unidadeParaSelecionar = funcoes.selecionarUnidadeMetrica(unidadesDisponiveis);
    if (unidadeParaSelecionar) {
        for (var i = 0; i < listaUnidades.items.length; i++) {
            if (listaUnidades.items[i].text === unidadeParaSelecionar) {
                listaUnidades.selection = i;
                break;
            }
        }
    } else if (unidadesDisponiveis.length === 2) {
        listaUnidades.selection = 1; // Seleciona automaticamente se houver apenas uma opção
    } else {
        listaUnidades.selection = 0;
    }
}

function verificarCMYK(listaComponentes, listaCores, listaUnidades, dados, encontrarIndicePorNome) {
    if (listaComponentes.selection && listaComponentes.selection.index > 0 &&
        listaCores.selection && listaCores.selection.index > 0 &&
        listaUnidades.selection && listaUnidades.selection.index > 0) {
        
        var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
        var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCores.selection.text)];
        var unidadeSelecionada = listaUnidades.selection.text;

        for (var i = 0; i < dados.combinacoes.length; i++) {
            if (dados.combinacoes[i].componenteId === componenteSelecionado.id &&
                dados.combinacoes[i].corId === corSelecionada.id &&
                dados.combinacoes[i].unidade === unidadeSelecionada) {
                
                if (dados.combinacoes[i].cmyk) {
                    // Por exemplo, você poderia armazenar o CMYK em uma variável global
                    // ou atualizar algum elemento da interface
                    // cmykAtual = dados.combinacoes[i].cmyk;
                }
                break;
            }
        }
    }
}

function salvarSelecaoAtual(listaComponentes, listaCores, listaUnidades, campoMultiplicador, ultimaSelecao) {
    try {
        if (listaComponentes && listaComponentes.selection) {
            ultimaSelecao.componente = listaComponentes.selection.text;
        }
        if (listaCores && listaCores.selection) {
            ultimaSelecao.cor = listaCores.selection.text;
        }
        if (listaUnidades && listaUnidades.selection) {
            ultimaSelecao.unidade = listaUnidades.selection.text;
        }
        if (campoMultiplicador) {
            ultimaSelecao.multiplicador = campoMultiplicador.text;
        }
            } catch (e) {
            ui.mostrarAlertaPersonalizado("Erro ao salvar seleção: " + e.message, "Erro");
        }
}

function restaurarUltimaSelecao(listaComponentes, listaCores, listaUnidades, campoQuantidade, campoMultiplicador, ultimaSelecao, dados, t) {
    try {
        if (ultimaSelecao.componente && listaComponentes && listaComponentes.items && listaComponentes.items.length) {
            for (var i = 0; i < listaComponentes.items.length; i++) {
                if (listaComponentes.items[i].text === ultimaSelecao.componente) {
                    listaComponentes.selection = i;
                    break;
                }
            }
        }

        // Atualizar cores baseado no componente
        if (typeof funcoes.atualizarCores === 'function') {
            funcoes.atualizarCores(listaComponentes, listaCores, listaUnidades, dados, t, function() {
                if (funcoesComponentes && funcoesComponentes.verificarCMYK) {
                    funcoesComponentes.verificarCMYK(listaComponentes, listaCores, listaUnidades, dados, funcoes.encontrarIndicePorNome);
                }
            });
        }

        if (ultimaSelecao.cor && listaCores && listaCores.items && listaCores.items.length) {
            for (var i = 0; i < listaCores.items.length; i++) {
                if (listaCores.items[i].text === ultimaSelecao.cor) {
                    listaCores.selection = i;
                    break;
                }
            }
        }

        // Atualizar unidades baseado na cor
        if (funcoesComponentes && funcoesComponentes.atualizarUnidades) {
            funcoesComponentes.atualizarUnidades(listaComponentes, listaCores, listaUnidades, dados, funcoes.selecionarUnidadeMetrica, funcoes.arrayContains);
        }

        if (ultimaSelecao.unidade && listaUnidades && listaUnidades.items && listaUnidades.items.length) {
            for (var i = 0; i < listaUnidades.items.length; i++) {
                if (listaUnidades.items[i].text === ultimaSelecao.unidade) {
                    listaUnidades.selection = i;
                    break;
                }
            }
        }

        // Limpar campo(s) de quantidade
        if (typeof campoQuantidade !== 'undefined' && campoQuantidade) {
            if (Object.prototype.toString.call(campoQuantidade) === '[object Array]') {
                if (campoQuantidade.length > 0) {
                    campoQuantidade[0].text = "";
                }
            } else if (typeof campoQuantidade.text !== 'undefined') {
                campoQuantidade.text = "";
            }
        }
        if (typeof campoMultiplicador !== 'undefined' && campoMultiplicador) {
            campoMultiplicador.text = ultimaSelecao.multiplicador;
        }
        
            } catch (e) {
            ui.mostrarAlertaPersonalizado("Erro ao restaurar seleção: " + e.message + "\nUsando reset padrão", "Erro");
            // Reset padrão em caso de erro
        if (typeof campoQuantidade !== 'undefined' && campoQuantidade) {
            if (Object.prototype.toString.call(campoQuantidade) === '[object Array]') {
                if (campoQuantidade.length > 0) {
                    campoQuantidade[0].text = "1";
                }
            } else if (typeof campoQuantidade.text !== 'undefined') {
                campoQuantidade.text = "1";
            }
        }
        if (typeof campoMultiplicador !== 'undefined' && campoMultiplicador) {
            campoMultiplicador.text = "1";
        }
        if (listaComponentes && listaComponentes.selection) listaComponentes.selection = 0;
        if (listaCores) {
            listaCores.removeAll();
            listaCores.add("item", t("selecioneCor"));
            listaCores.selection = 0;
        }
        if (listaUnidades) {
            listaUnidades.removeAll();
            listaUnidades.add("item", t("selecioneUnidade"));
            listaUnidades.selection = 0;
        }
    }
}

// Ao criar ou atualizar o texto do item, passar o array de quantidades para criarTextoComponente
// Converter camposQuantidade para array de valores
function extrairValoresCampos(camposQuantidade) {
    var arr = [];
    if (camposQuantidade && Object.prototype.toString.call(camposQuantidade) === '[object Array]') {
        for (var i = 0; i < camposQuantidade.length; i++) {
            var val = parseFloat(camposQuantidade[i].text.replace(',', '.'));
            if (!isNaN(val) && val > 0) {
                arr.push(val);
            }
        }
    }
    return arr;
}

function adicionarComponente(listaComponentes, listaCores, listaUnidades, quantidade, campoMultiplicador, ultimaSelecao, dados, itensLegenda, atualizarListaItens, t, logs, funcoes, encontrarIndicePorNome, camposQuantidade) {
    try {
        // Verificar se a quantidade foi preenchida
        if (typeof quantidade === 'undefined' || quantidade === null || isNaN(quantidade) || quantidade <= 0) {
            ui.mostrarAlertaPersonalizado(t("quantidadeNaoInformada"), "Campo Obrigatório"); // "Por favor, informe a quantidade"
            return;
        }

        // Verificações iniciais
        if (!dados || typeof dados !== 'object') {
            ui.mostrarAlertaPersonalizado("Erro: dados não está definido ou não é um objeto", "Erro");
            return;
        }

        if (!dados.componentes || !dados.cores) {
            ui.mostrarAlertaPersonalizado("Erro: dados.componentes ou dados.cores não estão definidos", "Erro");
            return;
        }

        if (!listaComponentes || !listaCores || !listaUnidades) {
            ui.mostrarAlertaPersonalizado("Erro: Uma ou mais listas não estão definidas\nComponentes: " + 
                  (listaComponentes ? "OK" : "Não definido") + 
                  "\nCores: " + (listaCores ? "OK" : "Não definido") + 
                  "\nUnidades: " + (listaUnidades ? "OK" : "Não definido"), "Erro");
            return;
        }

        if (!listaComponentes.selection || !listaCores.selection || !listaUnidades.selection) {
            ui.mostrarAlertaPersonalizado(t("selecionarComponenteCompleto"), "Seleção Obrigatória");
            return;
        }

        if (listaComponentes.selection.index === 0 || listaCores.selection.index === 0 || listaUnidades.selection.index === 0) {
            ui.mostrarAlertaPersonalizado(t("selecionarComponenteCompleto"), "Seleção Obrigatória");
            return;
        }

        // Salvar seleção atual antes de qualquer operação
        salvarSelecaoAtual(listaComponentes, listaCores, listaUnidades, campoMultiplicador, ultimaSelecao);

        // Obter dados selecionados
        var componenteSelecionado = dados.componentes[encontrarIndicePorNome(dados.componentes, listaComponentes.selection.text)];
        var corSelecionada = dados.cores[encontrarIndicePorNome(dados.cores, listaCores.selection.text)];
        var unidadeSelecionada = listaUnidades.selection.text;

        // Verificar se os dados foram obtidos corretamente
        if (!componenteSelecionado || !corSelecionada) {
            ui.mostrarAlertaPersonalizado("Erro ao obter componente ou cor selecionada:\nComponente: " + 
                  (componenteSelecionado ? "OK" : "Não encontrado") + 
                  "\nCor: " + (corSelecionada ? "OK" : "Não encontrada"), "Erro");
            return;
        }

        // Processar quantidade e multiplicador
        var quantidadeNum = quantidade;
        var multiplicador = parseFloat(campoMultiplicador.text.replace(',', '.'));

        if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
            ui.mostrarAlertaPersonalizado(t("quantidadeInvalida") + "\nValor inserido: " + quantidade, "Quantidade Inválida");
            return;
        }

        if (isNaN(multiplicador) || multiplicador <= 0) {
            ui.mostrarAlertaPersonalizado("Multiplicador inválido, usando valor padrão 1\nValor inserido: " + campoMultiplicador.text, "Atenção");
            multiplicador = 1;
        }

        // Encontrar combinação
        var combinacaoSelecionada = null;
        for (var i = 0; i < dados.combinacoes.length; i++) {
            if (dados.combinacoes[i].componenteId === componenteSelecionado.id &&
                dados.combinacoes[i].corId === corSelecionada.id &&
                dados.combinacoes[i].unidade === unidadeSelecionada) {
                combinacaoSelecionada = dados.combinacoes[i];
                break;
            }
        }

        if (!combinacaoSelecionada) {
            ui.mostrarAlertaPersonalizado("Combinação não encontrada:\nComponente: " + componenteSelecionado.nome + 
                  "\nCor: " + corSelecionada.nome + 
                  "\nUnidade: " + unidadeSelecionada, "Erro");
            return;
        }

        // Processar o componente
        var nomeComponente = componenteSelecionado.nome + " " + corSelecionada.nome;
        quantidadeNum = funcoes.arredondarComponente(quantidadeNum, unidadeSelecionada, nomeComponente);

        // Verificar se o item já existe
        var itemExistente = null;
        for (var i = 0; i < itensLegenda.length; i++) {
            if (itensLegenda[i].tipo === "componente" && 
                itensLegenda[i].nome === nomeComponente &&
                itensLegenda[i].unidade === unidadeSelecionada) {
                itemExistente = itensLegenda[i];
                break;
            }
        }

        var arrayQuantidades = extrairValoresCampos(camposQuantidade);
        if (itemExistente) {
            itemExistente.quantidade = quantidadeNum;
            itemExistente.multiplicador = multiplicador;
            itemExistente.texto = funcoes.criarTextoComponente(nomeComponente, combinacaoSelecionada.referencia, unidadeSelecionada, quantidadeNum, multiplicador, arrayQuantidades);
        } else {
            var novoItem = {
                tipo: "componente",
                nome: nomeComponente,
                quantidade: quantidadeNum,
                multiplicador: multiplicador,
                unidade: unidadeSelecionada,
                referencia: combinacaoSelecionada.referencia,
                componenteId: componenteSelecionado.id,
                texto: funcoes.criarTextoComponente(nomeComponente, combinacaoSelecionada.referencia, unidadeSelecionada, quantidadeNum, multiplicador, arrayQuantidades)
            };
            itensLegenda.push(novoItem);
        }

        // Atualizar a lista de itens
        if (typeof atualizarListaItens === 'function') {
            atualizarListaItens();
        }

        // Restaurar a última seleção
        try {
            restaurarUltimaSelecao(listaComponentes, listaCores, listaUnidades, camposQuantidade, campoMultiplicador, ultimaSelecao, dados, t);
        } catch (e) {
            alert("Erro ao restaurar seleção: " + e.message + "\nUsando reset padrão");
            if (typeof camposQuantidade !== 'undefined' && camposQuantidade) {
                if (Object.prototype.toString.call(camposQuantidade) === '[object Array]') {
                    if (camposQuantidade.length > 0) {
                        camposQuantidade[0].text = "1";
                    }
                } else if (typeof camposQuantidade.text !== 'undefined') {
                    camposQuantidade.text = "1";
                }
            }
            if (campoMultiplicador) campoMultiplicador.text = "1";
            if (listaComponentes && listaComponentes.selection) listaComponentes.selection = 0;
            if (listaCores) {
                listaCores.removeAll();
                listaCores.add("item", t("selecioneCor"));
                listaCores.selection = 0;
            }
            if (listaUnidades) {
                listaUnidades.removeAll();
                listaUnidades.add("item", t("selecioneUnidade"));
                listaUnidades.selection = 0;
            }
        }

            } catch (e) {
            ui.mostrarAlertaPersonalizado("Erro geral ao adicionar componente:\n" + e.message + "\nLinha: " + e.line, "Erro");
        }
}

// Exportação global
$.global.funcoesComponentes = {
    atualizarUnidades: atualizarUnidades,
    verificarCMYK: verificarCMYK,
    salvarSelecaoAtual: salvarSelecaoAtual,
    restaurarUltimaSelecao: restaurarUltimaSelecao,
    adicionarComponente: adicionarComponente
}; 