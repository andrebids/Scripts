// funcoesBolas.jsx
// Funções relacionadas a bolas do sistema de legendas
// A partir da etapa 5.2.3, funções deste domínio devem ser adicionadas aqui.

function atualizarAcabamentos(listaCoresBolas, listaAcabamentos, dados, t, funcoes, atualizarTamanhos) {
    try {
        if (listaCoresBolas.selection.index === 0) {
            listaAcabamentos.removeAll();
            listaAcabamentos.add("item", t("selecioneAcabamento"));
            listaAcabamentos.selection = 0;
            return;
        }

        var corSelecionada = dados.cores[funcoes.encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
        var acabamentosDisponiveis = [t("selecioneAcabamento")];
        var acabamentosIds = [];

        for (var i = 0; i < dados.bolas.length; i++) {
            if (dados.bolas[i].corId === corSelecionada.id) {
                var acabamento = funcoes.encontrarPorId(dados.acabamentos, dados.bolas[i].acabamentoId);
                if (acabamento && !funcoes.arrayContains(acabamentosIds, acabamento.id)) {
                    acabamentosDisponiveis.push(acabamento.nome);
                    acabamentosIds.push(acabamento.id);
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
        } else {
            listaAcabamentos.selection = 0;
        }
        
        // Atualizar tamanhos após selecionar o acabamento
        if (typeof atualizarTamanhos === 'function') {
            atualizarTamanhos();
        }
        
    } catch (e) {
        throw e;
    }
}

function atualizarTamanhos(listaCoresBolas, listaAcabamentos, listaTamanhos, dados, t, funcoes) {
    try {
        if (listaCoresBolas.selection.index === 0 || listaAcabamentos.selection.index === 0) {
            listaTamanhos.removeAll();
            listaTamanhos.add("item", t("selecioneTamanho"));
            listaTamanhos.selection = 0;
            return;
        }

        var corSelecionada = dados.cores[funcoes.encontrarIndicePorNome(dados.cores, listaCoresBolas.selection.text)];
        var acabamentoSelecionado = dados.acabamentos[funcoes.encontrarIndicePorNome(dados.acabamentos, listaAcabamentos.selection.text)];
        var tamanhosDisponiveis = [t("selecioneTamanho")];

        for (var i = 0; i < dados.bolas.length; i++) {
            if (dados.bolas[i].corId === corSelecionada.id && dados.bolas[i].acabamentoId === acabamentoSelecionado.id) {
                var tamanho = funcoes.encontrarPorId(dados.tamanhos, dados.bolas[i].tamanhoId);
                if (tamanho && !funcoes.arrayContains(tamanhosDisponiveis, tamanho.nome)) {
                    tamanhosDisponiveis.push(tamanho.nome);
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
        } else {
            listaTamanhos.selection = 0;
        }
        
    } catch (e) {
        throw e;
    }
}

function atualizarTextoBola(bola) {
    try {
        var textoBoule = bola.quantidade === 1 ? "boule" : "boules";
        var texto = textoBoule + " " + bola.nome;
        if (bola.referencia) {
            texto += " (Ref: " + bola.referencia + ")";
        }
        texto += " units: " + bola.quantidade.toFixed(2).replace('.', ',');
        
        return texto;
    } catch (e) {
        throw e;
    }
}

function adicionarBola(listaCoresBolas, listaAcabamentos, listaTamanhos, campoQuantidadeBolas, dados, itensLegenda, atualizarListaItens, t, logs, funcoes) {
    if (listaCoresBolas.selection.index === 0 || listaAcabamentos.selection.index === 0 || listaTamanhos.selection.index === 0) {
        ui.mostrarAlertaPersonalizado(t("selecionarCor"), "Seleção Obrigatória");
        return;
    }

    var quantidade = parseFloat(campoQuantidadeBolas.text.replace(',', '.'));
    if (isNaN(quantidade) || quantidade <= 0) {
        ui.mostrarAlertaPersonalizado(t("quantidadeInvalida"), "Quantidade Inválida");
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
            ui.mostrarAlertaPersonalizado(t("erroProcessarBola") + e.message, "Erro");
        }
    } else {
        ui.mostrarAlertaPersonalizado(t("erroCombinacaoBola"), "Erro");
    }
}

// Exportação global
$.global.funcoesBolas = {
    atualizarAcabamentos: atualizarAcabamentos,
    atualizarTamanhos: atualizarTamanhos,
    atualizarTextoBola: atualizarTextoBola,
    adicionarBola: adicionarBola
}; 