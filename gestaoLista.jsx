#target illustrator
#targetengine maintarget

/**
 * gestaoLista.jsx
 * Domínio: Gestão e manipulação da lista de itens da legenda
 * Responsabilidades:
 *   - Atualizar visualização da lista de itens
 *   - Remover itens individuais da lista
 *   - Remover todos os itens da lista
 *   - Organizar ordem dos itens (bolas por último)
 *   - Validar seleções de itens
 *   - Gerenciar array global itensLegenda
 */

/**
 * Atualiza a visualização da lista de itens na interface
 * Organiza os itens com bolas por último
 */
function atualizarListaItens(listaItens, itensLegenda) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("atualizarListaItens", {totalItens: itensLegenda.length}, "Iniciando atualização da lista");
    }
    
    try {
        // Validação de parâmetros
        if (!listaItens || !itensLegenda) {
            throw new Error("Parâmetros obrigatórios não fornecidos");
        }
        
        // Limpar lista atual
        listaItens.removeAll();
        
        var componentesNaoBolas = [];
        var bolas = [];
        
        // Separar itens por tipo
        for (var i = 0; i < itensLegenda.length; i++) {
            if (itensLegenda[i].tipo === "bola") {
                bolas.push(itensLegenda[i]);
            } else {
                componentesNaoBolas.push(itensLegenda[i]);
            }
        }
        
        // Adicionar primeiro os componentes que não são bolas
        for (var i = 0; i < componentesNaoBolas.length; i++) {
            listaItens.add("item", componentesNaoBolas[i].texto);
        }
        
        // Adicionar as bolas por último
        for (var i = 0; i < bolas.length; i++) {
            listaItens.add("item", bolas[i].texto);
        }
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("atualizarListaItens", "Lista atualizada - " + componentesNaoBolas.length + " componentes, " + bolas.length + " bolas");
        }
        
        return true;
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao atualizar lista de itens: " + erro.message, "error");
        }
        return false;
    }
}

/**
 * Remove item selecionado da lista
 */
function removerItem(listaItens, itensLegenda, atualizarCallback, t) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("removerItem", "Iniciando remoção de item selecionado");
    }
    
    try {
        // Validação de parâmetros
        if (!listaItens || !itensLegenda || !atualizarCallback) {
            throw new Error("Parâmetros obrigatórios não fornecidos");
        }
        
        var selectedIndex = listaItens.selection ? listaItens.selection.index : -1;
        
        if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < itensLegenda.length) {
            var itemRemovido = itensLegenda[selectedIndex];
            itensLegenda.splice(selectedIndex, 1);
            
            // Atualizar visualização
            atualizarCallback();
            
            if (logs && logs.logFuncao) {
                logs.logFuncao("removerItem", "Item removido: " + (itemRemovido ? itemRemovido.texto : "desconhecido"));
            }
            
            return true;
            
        } else {
            var mensagem = t ? t("selecioneItemRemover") : "Por favor, selecione um item para remover.";
            alert(mensagem);
            
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Tentativa de remoção sem seleção válida", "warning");
            }
            
            return false;
        }
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao remover item: " + erro.message, "error");
        }
        return false;
    }
}

/**
 * Remove todos os itens da lista após confirmação
 */
function removerTodosItens(itensLegenda, atualizarCallback, t) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("removerTodosItens", "Iniciando remoção de todos os itens");
    }
    
    try {
        // Validação de parâmetros
        if (!itensLegenda || !atualizarCallback) {
            throw new Error("Parâmetros obrigatórios não fornecidos");
        }
        
        var mensagemConfirmacao = t ? t("confirmarRemoverTodos") : "Tem certeza que deseja remover todos os itens?";
        
        if (confirm(mensagemConfirmacao)) {
            var totalItens = itensLegenda.length;
            
            // Limpar array (usando splice para manter referência)
            itensLegenda.splice(0, itensLegenda.length);
            
            // Atualizar visualização
            atualizarCallback();
            
            if (logs && logs.logFuncao) {
                logs.logFuncao("removerTodosItens", "Todos os itens removidos - total: " + totalItens);
            }
            
            return true;
        } else {
            if (logs && logs.logFuncao) {
                logs.logFuncao("removerTodosItens", "Remoção cancelada pelo usuário");
            }
            
            return false;
        }
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao remover todos os itens: " + erro.message, "error");
        }
        return false;
    }
}

/**
 * Configura eventos dos botões de gestão da lista
 */
function configurarEventosLista(botaoRemoverItem, botaoRemoverTodos, listaItens, itensLegenda, atualizarCallback, t) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("configurarEventosLista", "Configurando eventos dos botões de lista");
    }
    
    try {
        // Validação de parâmetros
        if (!botaoRemoverItem || !botaoRemoverTodos || !listaItens || !itensLegenda || !atualizarCallback) {
            throw new Error("Parâmetros obrigatórios não fornecidos");
        }
        
        // Configurar evento do botão remover item
        botaoRemoverItem.onClick = function() {
            removerItem(listaItens, itensLegenda, atualizarCallback, t);
        };
        
        // Configurar evento do botão remover todos
        botaoRemoverTodos.onClick = function() {
            removerTodosItens(itensLegenda, atualizarCallback, t);
        };
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("configurarEventosLista", "Eventos configurados com sucesso");
        }
        
        return true;
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao configurar eventos da lista: " + erro.message, "error");
        }
        return false;
    }
}

// Export global
$.global.gestaoLista = {
    atualizarListaItens: atualizarListaItens,
    removerItem: removerItem,
    removerTodosItens: removerTodosItens,
    configurarEventosLista: configurarEventosLista
}; 