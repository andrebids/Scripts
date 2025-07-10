// funcoesComponentes.jsx
// Funções relacionadas a componentes do sistema de legendas
// A partir da etapa 5.2.2.5, funções deste domínio devem ser adicionadas aqui.

// Exemplo de função (stub)
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
    
    // Log para debug
    logs.adicionarLog("Unidades atualizadas: " + unidadesDisponiveis.join(", "), logs.TIPOS_LOG.INFO);

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

// Exportação global
$.global.funcoesComponentes = {
    atualizarUnidades: atualizarUnidades
    // Adicione outras funções aqui
}; 