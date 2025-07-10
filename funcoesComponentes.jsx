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

// Exportação global
$.global.funcoesComponentes = {
    atualizarUnidades: atualizarUnidades,
    verificarCMYK: verificarCMYK,
    salvarSelecaoAtual: salvarSelecaoAtual
    // Adicione outras funções aqui
}; 