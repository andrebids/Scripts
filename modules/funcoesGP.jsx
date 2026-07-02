// funcoesGP.jsx
// Fluxo dedicado para variantes especiais de GP e lucioles associadas

function gpGarantirEstrutura(dados) {
    if (!dados.gp || !funcoes.isArray(dados.gp)) {
        dados.gp = [];
    }
    return dados.gp;
}

function gpListarEspessuras(dados) {
    var gp = gpGarantirEstrutura(dados);
    var espessuras = [];
    for (var i = 0; i < gp.length; i++) {
        var esp = String(gp[i].espessura || "");
        if (esp !== "" && !funcoes.arrayContains(espessuras, esp)) {
            espessuras.push(esp);
        }
    }
    espessuras.sort(function(a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    return espessuras;
}

function gpListarCores(dados, espessura) {
    var gp = gpGarantirEstrutura(dados);
    var cores = [];
    for (var i = 0; i < gp.length; i++) {
        if (String(gp[i].espessura) === String(espessura)) {
            var cor = String(gp[i].cor || "");
            if (cor !== "" && !funcoes.arrayContains(cores, cor)) {
                cores.push(cor);
            }
        }
    }
    cores.sort(function(a, b) {
        return a.localeCompare(b);
    });
    return cores;
}

function gpListarUnidades(dados, espessura, cor) {
    var variante = gpObterVariante(dados, espessura, cor);
    if (!variante || !variante.unidades || !funcoes.isArray(variante.unidades)) {
        return [];
    }

    var unidades = [];
    for (var i = 0; i < variante.unidades.length; i++) {
        if (!funcoes.arrayContains(unidades, variante.unidades[i])) {
            unidades.push(variante.unidades[i]);
        }
    }
    return unidades;
}

function gpObterVariante(dados, espessura, cor) {
    var gp = gpGarantirEstrutura(dados);
    for (var i = 0; i < gp.length; i++) {
        if (String(gp[i].espessura) === String(espessura) &&
            String(gp[i].cor).toLowerCase() === String(cor).toLowerCase()) {
            return gp[i];
        }
    }
    return null;
}

function gpObterCombinacaoLucioles(dados, corLucioles, unidade) {
    if (!dados || !dados.componentes || !dados.cores || !dados.combinacoes) {
        return null;
    }

    var componenteLucioles = null;
    for (var i = 0; i < dados.componentes.length; i++) {
        if (String(dados.componentes[i].nome).toLowerCase() === "lucioles") {
            componenteLucioles = dados.componentes[i];
            break;
        }
    }

    if (!componenteLucioles) {
        return null;
    }

    var corEncontrada = null;
    for (var j = 0; j < dados.cores.length; j++) {
        if (String(dados.cores[j].nome).toLowerCase() === String(corLucioles).toLowerCase()) {
            corEncontrada = dados.cores[j];
            break;
        }
    }

    if (!corEncontrada) {
        return null;
    }

    for (var k = 0; k < dados.combinacoes.length; k++) {
        var combinacao = dados.combinacoes[k];
        if (combinacao.componenteId === componenteLucioles.id &&
            combinacao.corId === corEncontrada.id &&
            combinacao.unidade === unidade) {
            return {
                componente: componenteLucioles,
                cor: corEncontrada,
                combinacao: combinacao
            };
        }
    }

    return null;
}

function gpGarantirRuntimeId(item) {
    if (!item.runtimeId) {
        item.runtimeId = "rt_" + (new Date().getTime()) + "_" + Math.floor(Math.random() * 100000);
    }
    return item.runtimeId;
}

function gpAtualizarTextoItem(item) {
    if (item.detalhesQuantidade && funcoes.isArray(item.detalhesQuantidade)) {
        item.quantidade = funcoes.calcularTotalDetalhesQuantidade(item.detalhesQuantidade);
        item.multiplicador = 1;
    }
    item.texto = funcoes.criarLinhaReferencia(item);
}

function gpEhItemLucioles(item) {
    if (!item) {
        return false;
    }
    var nome = String(item.nome || "").toLowerCase();
    var referencia = String(item.referencia || "").toLowerCase();
    return nome.indexOf("lucioles led") !== -1 || referencia.indexOf("lucioles led") !== -1;
}

function gpObterChaveLucioles(item) {
    var base = String(item.referencia || item.nome || "").toLowerCase().replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    return base + "|" + String(item.unidade || "");
}

function gpInicializarDetalhesQuantidade(item) {
    if (!item.detalhesQuantidade || !funcoes.isArray(item.detalhesQuantidade) || item.detalhesQuantidade.length === 0) {
        item.detalhesQuantidade = [{
            quantidade: item.quantidade,
            multiplicador: item.multiplicador || 1,
            grupoVinculadoId: item.grupoVinculadoId || null
        }];
    }
}

function gpSomarDetalhesQuantidade(detalhesQuantidade) {
    return funcoes.calcularTotalDetalhesQuantidade(detalhesQuantidade || []);
}

function gpFundirLuciolesDuplicados(itensLegenda) {
    if (!itensLegenda || !funcoes.isArray(itensLegenda)) {
        return;
    }

    var grupos = {};
    var ordem = [];

    for (var i = 0; i < itensLegenda.length; i++) {
        var item = itensLegenda[i];
        if ((item.tipo === "componente" || item.tipo === "gp_lucioles") && gpEhItemLucioles(item)) {
            var chave = gpObterChaveLucioles(item);
            if (!grupos[chave]) {
                grupos[chave] = [];
                ordem.push(chave);
            }
            grupos[chave].push(item);
        }
    }

    for (var k = 0; k < ordem.length; k++) {
        var chaveGrupo = ordem[k];
        var itensGrupo = grupos[chaveGrupo];
        if (!itensGrupo || itensGrupo.length <= 1) {
            continue;
        }

        var alvo = null;
        for (var a = 0; a < itensGrupo.length; a++) {
            if (itensGrupo[a].tipo === "componente") {
                alvo = itensGrupo[a];
                break;
            }
        }
        if (!alvo) {
            alvo = itensGrupo[0];
        }

        gpGarantirRuntimeId(alvo);
        gpInicializarDetalhesQuantidade(alvo);

        for (var s = 0; s < itensGrupo.length; s++) {
            var origem = itensGrupo[s];
            if (origem === alvo) {
                continue;
            }

            gpInicializarDetalhesQuantidade(origem);
            for (var d = 0; d < origem.detalhesQuantidade.length; d++) {
                alvo.detalhesQuantidade.unshift(origem.detalhesQuantidade[d]);
            }

            if (origem.tipo === "gp_lucioles" && origem.grupoVinculadoId) {
                for (var p = 0; p < itensLegenda.length; p++) {
                    var itemPai = itensLegenda[p];
                    if (itemPai.tipo === "gp" && itemPai.grupoVinculadoId === origem.grupoVinculadoId) {
                        itemPai.luciolesFundidosRuntimeId = alvo.runtimeId;
                        itemPai.luciolesFundidosQuantidade = gpSomarDetalhesQuantidade(origem.detalhesQuantidade);
                    }
                }
            }

            for (var r = itensLegenda.length - 1; r >= 0; r--) {
                if (itensLegenda[r] === origem) {
                    itensLegenda.splice(r, 1);
                    break;
                }
            }
        }

        alvo.quantidade = gpSomarDetalhesQuantidade(alvo.detalhesQuantidade);
        alvo.multiplicador = 1;
        gpAtualizarTextoItem(alvo);
    }
}

function gpLocalizarItemLuciolesExistente(itensLegenda, nomeLucioles, unidade, referenciaLucioles) {
    if (!itensLegenda || !funcoes.isArray(itensLegenda)) {
        return null;
    }

    for (var i = 0; i < itensLegenda.length; i++) {
        var item = itensLegenda[i];
        var nomeIgual = String(item.nome || "").toLowerCase() === String(nomeLucioles).toLowerCase();
        var referenciaIgual = String(item.referencia || "").toLowerCase() === String(referenciaLucioles || "").toLowerCase();
        if ((item.tipo === "componente" || item.tipo === "gp_lucioles") &&
            item.unidade === unidade &&
            (nomeIgual || referenciaIgual)) {
            return item;
        }
    }

    return null;
}

function gpRemoverGrupoVinculado(itensLegenda, grupoId) {
    if (!itensLegenda || !grupoId) {
        return;
    }

    var itensGrupo = [];
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].grupoVinculadoId === grupoId) {
            itensGrupo.push(itensLegenda[i]);
        }
    }

    for (var g = 0; g < itensGrupo.length; g++) {
        var itemGrupo = itensGrupo[g];
        if (itemGrupo.tipo === "gp" && itemGrupo.luciolesFundidosRuntimeId && itemGrupo.luciolesFundidosQuantidade) {
            for (var j = itensLegenda.length - 1; j >= 0; j--) {
                var alvo = itensLegenda[j];
                if (alvo.runtimeId === itemGrupo.luciolesFundidosRuntimeId) {
                    if (alvo.detalhesQuantidade && funcoes.isArray(alvo.detalhesQuantidade)) {
                        alvo.detalhesQuantidade = alvo.detalhesQuantidade.filter(function(termo) {
                            return termo.grupoVinculadoId !== grupoId;
                        });
                        alvo.quantidade = funcoes.calcularTotalDetalhesQuantidade(alvo.detalhesQuantidade);
                    } else {
                        alvo.quantidade -= itemGrupo.luciolesFundidosQuantidade;
                    }
                    if (alvo.quantidade <= 0) {
                        itensLegenda.splice(j, 1);
                    } else {
                        gpAtualizarTextoItem(alvo);
                    }
                    break;
                }
            }
        }
    }

    for (var r = itensLegenda.length - 1; r >= 0; r--) {
        if (itensLegenda[r].grupoVinculadoId === grupoId) {
            itensLegenda.splice(r, 1);
        }
    }
}

function gpObterNomeBase(dados) {
    if (dados && dados.componentes) {
        for (var i = 0; i < dados.componentes.length; i++) {
            var componente = dados.componentes[i];
            if (String(componente.referencia || "").toUpperCase() === "GP") {
                return componente.nome;
            }
        }

        for (var j = 0; j < dados.componentes.length; j++) {
            var nome = String(dados.componentes[j].nome || "").toLowerCase();
            if (nome.indexOf("paille synth") !== -1) {
                return dados.componentes[j].nome;
            }
        }
    }

    return "Paille synthétique";
}

function gpCriarItens(dados, espessura, cor, unidade, quantidade, modoLucioles, itensLegenda) {
    var variante = gpObterVariante(dados, espessura, cor);
    if (!variante) {
        throw new Error("Variante GP não encontrada para espessura " + espessura + " e cor " + cor);
    }

    var quantidadeNumero = parseFloat(String(quantidade).replace(",", "."));
    if (isNaN(quantidadeNumero) || quantidadeNumero <= 0) {
        throw new Error("Quantidade inválida para GP");
    }

    var grupoVinculadoId = "gp_" + (new Date().getTime()) + "_" + Math.floor(Math.random() * 100000);
    var nomeGP = "GP " + espessura + " " + cor;
    var nomeBase = gpObterNomeBase(dados);
    var corLuciolesFrase = "";

    var itemGP = {
        tipo: "gp",
        nome: nomeGP,
        nomeBase: nomeBase,
        espessura: espessura,
        cor: cor,
        unidade: unidade,
        quantidade: quantidadeNumero,
        referencia: variante.referencia || nomeGP.toUpperCase(),
        texto: funcoes.criarTextoComponente(nomeGP, variante.referencia || nomeGP.toUpperCase(), unidade, quantidadeNumero, 1),
        grupoVinculadoId: grupoVinculadoId
    };

    var itens = [itemGP];

    if (modoLucioles && modoLucioles !== "none") {
        var corLucioles = modoLucioles === "blanc_chaud" ? "led blanc chaud" : "led blanc pur";
        corLuciolesFrase = corLucioles;
        var combinacaoLucioles = gpObterCombinacaoLucioles(dados, corLucioles, unidade);
        var nomeLucioles = "lucioles " + corLucioles;
        var referenciaLucioles = combinacaoLucioles && combinacaoLucioles.combinacao ? combinacaoLucioles.combinacao.referencia : "";
        var quantidadeLuciolesTotal = quantidadeNumero * 2;

        itemGP.temLucioles = true;
        itemGP.corLucioles = corLuciolesFrase;

        var itemLuciolesExistente = gpLocalizarItemLuciolesExistente(itensLegenda, nomeLucioles, unidade, referenciaLucioles);
        if (itemLuciolesExistente) {
            gpGarantirRuntimeId(itemLuciolesExistente);
            if (!itemLuciolesExistente.detalhesQuantidade || !funcoes.isArray(itemLuciolesExistente.detalhesQuantidade)) {
                itemLuciolesExistente.detalhesQuantidade = [{
                    quantidade: itemLuciolesExistente.quantidade,
                    multiplicador: itemLuciolesExistente.multiplicador || 1
                }];
            }
            itemLuciolesExistente.detalhesQuantidade.unshift({
                quantidade: quantidadeNumero,
                multiplicador: 2,
                grupoVinculadoId: grupoVinculadoId
            });
            itemLuciolesExistente.quantidade = funcoes.calcularTotalDetalhesQuantidade(itemLuciolesExistente.detalhesQuantidade);
            itemLuciolesExistente.multiplicador = 1;
            gpAtualizarTextoItem(itemLuciolesExistente);
            itemGP.luciolesFundidosRuntimeId = itemLuciolesExistente.runtimeId;
            itemGP.luciolesFundidosQuantidade = quantidadeLuciolesTotal;
        } else {
            var novoItemLucioles = {
                tipo: "gp_lucioles",
                nome: nomeLucioles,
                unidade: unidade,
                quantidade: quantidadeNumero,
                multiplicador: 2,
                detalhesQuantidade: [{
                    quantidade: quantidadeNumero,
                    multiplicador: 2,
                    grupoVinculadoId: grupoVinculadoId
                }],
                referencia: referenciaLucioles,
                texto: "",
                grupoVinculadoId: grupoVinculadoId,
                itemPaiTipo: "gp"
            };
            gpGarantirRuntimeId(novoItemLucioles);
            gpAtualizarTextoItem(novoItemLucioles);
            itens.push(novoItemLucioles);
        }
    }

    if (!itemGP.temLucioles) {
        itemGP.temLucioles = false;
        itemGP.corLucioles = "";
    }

    return itens;
}

$.global.funcoesGP = {
    garantirEstrutura: gpGarantirEstrutura,
    listarEspessuras: gpListarEspessuras,
    listarCores: gpListarCores,
    listarUnidades: gpListarUnidades,
    obterVariante: gpObterVariante,
    obterCombinacaoLucioles: gpObterCombinacaoLucioles,
    obterNomeBase: gpObterNomeBase,
    garantirRuntimeId: gpGarantirRuntimeId,
    atualizarTextoItem: gpAtualizarTextoItem,
    localizarItemLuciolesExistente: gpLocalizarItemLuciolesExistente,
    fundirLuciolesDuplicados: gpFundirLuciolesDuplicados,
    removerGrupoVinculado: gpRemoverGrupoVinculado,
    criarItens: gpCriarItens
};
