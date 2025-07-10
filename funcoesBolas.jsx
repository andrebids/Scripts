// funcoesBolas.jsx
// Funções relacionadas a bolas do sistema de legendas
// A partir da etapa 5.2.3, funções deste domínio devem ser adicionadas aqui.

// Função para atualizar a lista de acabamentos com base na cor selecionada
function atualizarAcabamentos(listaCoresBolas, listaAcabamentos, dados, t, funcoes, atualizarTamanhos) {
    logs.adicionarLog("Iniciando atualizarAcabamentos", logs.TIPOS_LOG.FUNCTION);
    
    try {
        if (listaCoresBolas.selection.index === 0) {
            listaAcabamentos.removeAll();
            listaAcabamentos.add("item", t("selecioneAcabamento"));
            listaAcabamentos.selection = 0;
            logs.adicionarLog("Nenhuma cor selecionada, acabamentos resetados", logs.TIPOS_LOG.INFO);
            return;
        }

        var corSelecionada = dados.cores[funcoes.encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
        var acabamentosDisponiveis = [t("selecioneAcabamento")];
        var acabamentosIds = [];

        logs.adicionarLog("Processando acabamentos para cor: " + corSelecionada.nome, logs.TIPOS_LOG.INFO);

        for (var i = 0; i < dados.bolas.length; i++) {
            if (dados.bolas[i].corId === corSelecionada.id) {
                var acabamento = funcoes.encontrarPorId(dados.acabamentos, dados.bolas[i].acabamentoId);
                if (acabamento && !funcoes.arrayContains(acabamentosIds, acabamento.id)) {
                    acabamentosDisponiveis.push(acabamento.nome);
                    acabamentosIds.push(acabamento.id);
                    logs.adicionarLog("Acabamento adicionado: " + acabamento.nome, logs.TIPOS_LOG.INFO);
                }
            }
        }

        listaAcabamentos.removeAll();
        for (var i = 0; i < acabamentosDisponiveis.length; i++) {
            listaAcabamentos.add("item", acabamentosDisponiveis[i]);
        }
        
        // Pré-selecionar o acabamento se houver apenas uma opção
        if (acabamentosDisponiveis.length === 2) {
            listaAcabamentos.selection = 1;
            logs.adicionarLog("Acabamento pré-selecionado (única opção)", logs.TIPOS_LOG.INFO);
        } else {
            listaAcabamentos.selection = 0;
        }
        
        // Atualizar tamanhos após selecionar o acabamento
        logs.adicionarLog("Chamando atualizarTamanhos", logs.TIPOS_LOG.FUNCTION);
        if (typeof atualizarTamanhos === 'function') {
            atualizarTamanhos();
        }
        
        logs.adicionarLog("atualizarAcabamentos concluído com sucesso", logs.TIPOS_LOG.FUNCTION);
    } catch (e) {
        logs.adicionarLog("Erro em atualizarAcabamentos: " + e.message, logs.TIPOS_LOG.ERROR);
        throw e;
    }
}

// Função para atualizar a lista de tamanhos com base na cor e acabamento selecionados
function atualizarTamanhos(listaCoresBolas, listaAcabamentos, listaTamanhos, dados, t, funcoes) {
    logs.adicionarLog("Iniciando atualizarTamanhos", logs.TIPOS_LOG.FUNCTION);
    
    try {
        if (listaCoresBolas.selection.index === 0 || listaAcabamentos.selection.index === 0) {
            listaTamanhos.removeAll();
            listaTamanhos.add("item", t("selecioneTamanho"));
            listaTamanhos.selection = 0;
            logs.adicionarLog("Cor ou acabamento não selecionado, tamanhos resetados", logs.TIPOS_LOG.INFO);
            return;
        }

        var corSelecionada = dados.cores[funcoes.encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
        var acabamentoSelecionado = dados.acabamentos[funcoes.encontrarIndicePorNome(dados.acabamentos, listaAcabamentos.selection.text)];
        var tamanhosDisponiveis = [t("selecioneTamanho")];

        logs.adicionarLog("Processando tamanhos para cor: " + corSelecionada.nome + " e acabamento: " + acabamentoSelecionado.nome, logs.TIPOS_LOG.INFO);

        for (var i = 0; i < dados.bolas.length; i++) {
            if (dados.bolas[i].corId === corSelecionada.id && dados.bolas[i].acabamentoId === acabamentoSelecionado.id) {
                var tamanho = funcoes.encontrarPorId(dados.tamanhos, dados.bolas[i].tamanhoId);
                if (tamanho && !funcoes.arrayContains(tamanhosDisponiveis, tamanho.nome)) {
                    tamanhosDisponiveis.push(tamanho.nome);
                    logs.adicionarLog("Tamanho adicionado: " + tamanho.nome, logs.TIPOS_LOG.INFO);
                }
            }
        }

        listaTamanhos.removeAll();
        for (var i = 0; i < tamanhosDisponiveis.length; i++) {
            listaTamanhos.add("item", tamanhosDisponiveis[i]);
        }
        
        // Pré-selecionar o tamanho se houver apenas uma opção
        if (tamanhosDisponiveis.length === 2) {
            listaTamanhos.selection = 1;
            logs.adicionarLog("Tamanho pré-selecionado (única opção)", logs.TIPOS_LOG.INFO);
        } else {
            listaTamanhos.selection = 0;
        }
        
        logs.adicionarLog("atualizarTamanhos concluído com sucesso", logs.TIPOS_LOG.FUNCTION);
    } catch (e) {
        logs.adicionarLog("Erro em atualizarTamanhos: " + e.message, logs.TIPOS_LOG.ERROR);
        throw e;
    }
}

// Função para atualizar o texto de uma bola
function atualizarTextoBola(bola) {
    logs.adicionarLog("Iniciando atualizarTextoBola", logs.TIPOS_LOG.FUNCTION);
    
    try {
        var textoBoule = bola.quantidade === 1 ? "boule" : "boules";
        var texto = textoBoule + " " + bola.nome;
        if (bola.referencia) {
            texto += " (Ref: " + bola.referencia + ")";
        }
        texto += " units: " + bola.quantidade.toFixed(2).replace('.', ',');
        
        logs.adicionarLog("Texto da bola atualizado: " + texto, logs.TIPOS_LOG.INFO);
        logs.adicionarLog("atualizarTextoBola concluído com sucesso", logs.TIPOS_LOG.FUNCTION);
        
        return texto;
    } catch (e) {
        logs.adicionarLog("Erro em atualizarTextoBola: " + e.message, logs.TIPOS_LOG.ERROR);
        throw e;
    }
}

// Função para adicionar uma bola à lista de itensLegenda
function adicionarBola(listaCoresBolas, listaAcabamentos, listaTamanhos, campoQuantidadeBolas, dados, itensLegenda, atualizarListaItens, t, logs, funcoes) {
    logs.logEvento("click", "botaoAdicionarBola");
    if (listaCoresBolas.selection.index === 0 || listaAcabamentos.selection.index === 0 || listaTamanhos.selection.index === 0) {
        alert(t("selecionarCor"));
        return;
    }

    var quantidade = parseFloat(campoQuantidadeBolas.text.replace(',', '.'));
    if (isNaN(quantidade) || quantidade <= 0) {
        alert(t("quantidadeInvalida"));
        return;
    }

    var corSelecionada = dados.cores[funcoes.encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
    var acabamentoSelecionado = dados.acabamentos[funcoes.encontrarIndicePorNome(dados.acabamentos, listaAcabamentos.selection.text)];
    var tamanhoSelecionado = dados.tamanhos[funcoes.encontrarIndicePorNome(dados.tamanhos, listaTamanhos.selection.text)];

    var bolaSelecionada = null;
    for (var i = 0; i < dados.bolas.length; i++) {
        if (dados.bolas[i].corId === corSelecionada.id &&
            dados.bolas[i].acabamentoId === acabamentoSelecionado.id &&
            dados.bolas[i].tamanhoId === tamanhoSelecionado.id) {
            bolaSelecionada = dados.bolas[i];
            break;
        }
    }
    
    if (bolaSelecionada) {
        try {
            // Verificar se já existe uma bola com a mesma referência
            var bolaExistente = null;
            for (var i = 0; i < itensLegenda.length; i++) {
                if (itensLegenda[i].tipo === "bola" && itensLegenda[i].referencia === bolaSelecionada.referencia) {
                    bolaExistente = itensLegenda[i];
                    break;
                }
            }

            if (bolaExistente) {
                bolaExistente.quantidade = quantidade; // Atualiza com a nova quantidade
                bolaExistente.texto = atualizarTextoBola(bolaExistente);
            } else {
                var textoBoule = quantidade === 1 ? "boule" : "boules";
                var texto = textoBoule + " " + corSelecionada.nome + " " + acabamentoSelecionado.nome + " " + tamanhoSelecionado.nome;
                if (bolaSelecionada.referencia) {
                    texto += " (Ref: " + bolaSelecionada.referencia + ")";
                }
                texto += " units: " + quantidade.toFixed(2).replace('.', ',');

                itensLegenda.push({
                    tipo: "bola",
                    nome: textoBoule + " " + corSelecionada.nome + " " + acabamentoSelecionado.nome + " " + tamanhoSelecionado.nome,
                    texto: texto,
                    referencia: bolaSelecionada.referencia,
                    quantidade: quantidade,
                    unidade: "units",
                    composta: bolaSelecionada.composta || false
                });
            }
            
            atualizarListaItens();
        } catch (e) {
            logs.adicionarLog("Erro ao processar bola: " + e.message, logs.TIPOS_LOG.ERROR);
            alert(t("erroProcessarBola") + e.message);
        }
    } else {
        alert(t("erroCombinacaoBola"));
    }
}

// Exportação global
$.global.funcoesBolas = {
    atualizarAcabamentos: atualizarAcabamentos,
    atualizarTamanhos: atualizarTamanhos,
    atualizarTextoBola: atualizarTextoBola,
    adicionarBola: adicionarBola
}; 