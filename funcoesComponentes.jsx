// funcoesComponentes.jsx
// Funções relacionadas a componentes do sistema de legendas
// A partir da etapa 5.2.2.5, funções deste domínio devem ser adicionadas aqui.

// Exemplo de função (stub)
function atualizarUnidades(listaComponentes, listaCores, listaUnidades, dados, selecionarUnidadeMetrica, arrayContains) {
    logs.logFuncao("atualizarUnidades", {
        componente: listaComponentes.selection ? listaComponentes.selection.text : "Nenhum",
        cor: listaCores.selection ? listaCores.selection.text : "Nenhuma"
    }, "Iniciando atualização de unidades");
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
    
    // Log para debug
    logs.adicionarLog("Unidades atualizadas: " + unidadesDisponiveis.join(", "), logs.TIPOS_LOG.INFO);
    
    logs.logFuncao("atualizarUnidades", {
        unidadesEncontradas: unidadesDisponiveis.length - 1,
        unidades: unidadesDisponiveis.slice(1) // Remove "Selecione uma unidade"
    }, "Atualização de unidades concluída");

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

// Função para verificar CMYK (migrada de script.jsx)
// Função preparada para uso futuro - não gera logs para evitar ruído
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
                
                // Aqui você pode adicionar qualquer lógica adicional que queira executar
                // quando um CMYK é encontrado, sem exibir alertas
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

// Função para salvar a seleção atual (migrada de script.jsx)
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
        logs.logFuncao("salvarSelecaoAtual", {
            componente: ultimaSelecao.componente,
            cor: ultimaSelecao.cor,
            unidade: ultimaSelecao.unidade,
            multiplicador: ultimaSelecao.multiplicador
        }, "Seleção salva");
    } catch (e) {
        alert("Erro ao salvar seleção: " + e.message);
        logs.adicionarLog("Erro ao salvar seleção: " + e.message, logs.TIPOS_LOG.ERROR);
    }
}

// Função para restaurar a última seleção (migrada de script.jsx)
function restaurarUltimaSelecao(listaComponentes, listaCores, listaUnidades, campoQuantidade, campoMultiplicador, ultimaSelecao, dados, t) {
    logs.logFuncao("restaurarUltimaSelecao", {
        componente: ultimaSelecao.componente,
        cor: ultimaSelecao.cor,
        unidade: ultimaSelecao.unidade,
        multiplicador: ultimaSelecao.multiplicador
    }, "Iniciando restauração da última seleção");
    
    try {
        if (ultimaSelecao.componente && listaComponentes && listaComponentes.items && listaComponentes.items.length) {
            for (var i = 0; i < listaComponentes.items.length; i++) {
                if (listaComponentes.items[i].text === ultimaSelecao.componente) {
                    listaComponentes.selection = i;
                    logs.adicionarLog("Componente restaurado: " + ultimaSelecao.componente, logs.TIPOS_LOG.INFO);
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
                    logs.adicionarLog("Cor restaurada: " + ultimaSelecao.cor, logs.TIPOS_LOG.INFO);
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
                    logs.adicionarLog("Unidade restaurada: " + ultimaSelecao.unidade, logs.TIPOS_LOG.INFO);
                    break;
                }
            }
        }

        // Deixar o campo quantidade vazio
        if (typeof campoQuantidade !== 'undefined' && campoQuantidade) {
            campoQuantidade.text = "";
        }
        if (typeof campoMultiplicador !== 'undefined' && campoMultiplicador) {
            campoMultiplicador.text = ultimaSelecao.multiplicador;
        }
        
        logs.logFuncao("restaurarUltimaSelecao", {
            componente: ultimaSelecao.componente,
            cor: ultimaSelecao.cor,
            unidade: ultimaSelecao.unidade,
            multiplicador: ultimaSelecao.multiplicador
        }, "Restauração da última seleção concluída com sucesso");
        
    } catch (e) {
        logs.adicionarLog("Erro ao restaurar seleção: " + e.message, logs.TIPOS_LOG.ERROR);
        alert("Erro ao restaurar seleção: " + e.message);
    }
}

// Exportação global
$.global.funcoesComponentes = {
    atualizarUnidades: atualizarUnidades,
    verificarCMYK: verificarCMYK,
    salvarSelecaoAtual: salvarSelecaoAtual,
    restaurarUltimaSelecao: restaurarUltimaSelecao
    // Adicione outras funções aqui
}; 