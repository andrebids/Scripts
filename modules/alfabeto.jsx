function obterLetrasAlfabeto(texto) {
    return texto.toUpperCase().match(/<3|[A-Z#]/g) || [];
}

// Agrupar apenas ocorrências da mesma letra com as mesmas cores.
function processarAlfabeto(alfabeto, corBioprintSelecionada, tamanhoSelecionado, coresPorPosicao, materialAlfabeto) {
    materialAlfabeto = materialAlfabeto === "flexiprint" ? "flexiprint" : "bioprint";
    var referenciasUsadas = {};
    var ordemReferencias = [];
    var coresDasPosicoes = [];
    
    // Armazenar a palavra digitada
    var palavraDigitada = alfabeto;
    
    var referenciasMapeadas = {
        'A': 'GX214LW', 'B': 'GX215LW', 'C': 'GX216LW', 'D': 'GX217LW',
        'E': 'GX218LW', 'F': 'GX219LW', 'G': 'GX220LW', 'H': 'GX221LW',
        'I': 'GX222LW', 'J': 'GX223LW', 'K': 'GX224LW', 'L': 'GX225LW',
        'M': 'GX226LW', 'N': 'GX227LW', 'O': 'GX228LW', 'P': 'GX229LW',
        'Q': 'GX230LW', 'R': 'GX231LW', 'S': 'GX232LW', 'T': 'GX233LW',
        'U': 'GX234LW', 'V': 'GX235LW', 'W': 'GX236LW', 'X': 'GX237LW',
        'Y': 'GX238LW', 'Z': 'GX239LW', '<3': 'GX240LW', '#': 'GX241LW'
    };
    
    var letras = obterLetrasAlfabeto(alfabeto);
    for (var i = 0; i < letras.length; i++) {
        var caractere = letras[i];
        var cores = coresPorPosicao && coresPorPosicao.hasOwnProperty(i) ?
            coresPorPosicao[i] : corBioprintSelecionada.split(" et ");
        coresDasPosicoes.push(cores.slice(0));
        var chave = caractere + ":" + cores.slice(0).sort().join("|");
        if (!referenciasUsadas.hasOwnProperty(chave)) {
            referenciasUsadas[chave] = { caractere: caractere, cores: cores, quantidade: 0 };
            ordemReferencias.push(chave);
        }
        referenciasUsadas[chave].quantidade++;
    }

    var referenciasTexto = [];
    var coresUsadas = [];
    for (var r = 0; r < ordemReferencias.length; r++) {
        var referencia = referenciasUsadas[ordemReferencias[r]];
        var caractere = referencia.caractere;
        var cores = referencia.cores;
        for (var c = 0; c < cores.length; c++) {
            var encontrada = false;
            for (var j = 0; j < coresUsadas.length; j++) {
                if (coresUsadas[j] === cores[c]) encontrada = true;
            }
            if (!encontrada) coresUsadas.push(cores[c]);
        }
        referenciasTexto.push(referenciasMapeadas[caractere] + " (" + caractere + ") " + materialAlfabeto + " " + cores.join(" et ") + " " + tamanhoSelecionado + ": " + referencia.quantidade);
    }
    
    return {
        referenciasTexto: referenciasTexto,
        palavraDigitada: palavraDigitada,
        coresPorPosicao: coresDasPosicoes,
        materialAlfabeto: materialAlfabeto,
        corBioprint: coresUsadas.join(" et ")
    };
} 

// Função para adicionar palavra-chave do alfabeto
function adicionarPalavraChaveAlfabeto(campoPalavraChave, dropdownCorBioprint, tamanhoAlfabeto, grupoDimensoes, itensLegenda, atualizarListaItens, campoNomeTipo, t, configuracaoCores) {
    // O catálogo GX só tem A-Z, coração e #. Nunca omitir outras letras em silêncio.
    var caracteresNaoSuportados = campoPalavraChave.text.replace(/<3|[A-Z#\s]/gi, "");
    if (caracteresNaoSuportados !== "") {
        ui.mostrarAlertaPersonalizado(t("alfabetoCaracteresNaoSuportados") + ": " + caracteresNaoSuportados, "GX");
        return;
    }
    var corBioprint = dropdownCorBioprint && dropdownCorBioprint.selection ? dropdownCorBioprint.selection.text : "";
    if (configuracaoCores) corBioprint = configuracaoCores.coresGerais.join(" et ");
    var tamanhoSelecionado = tamanhoAlfabeto.selection.text;
    var valorNumerico = tamanhoSelecionado.replace(/[^\d,]/g, '').replace(',', '.');
    var i;
    for (i = 0; i < grupoDimensoes.children.length; i++) {
        var campo = grupoDimensoes.children[i];
        if (campo.type === "statictext" && campo.text === "H:") {
            var campoH = grupoDimensoes.children[i + 1];
            if (campoH && campoH.type === "edittext") {
                campoH.text = valorNumerico;
                break;
            }
        }
    }
    var resultado = processarAlfabeto(
        campoPalavraChave.text,
        corBioprint,
        tamanhoSelecionado,
        configuracaoCores ? configuracaoCores.coresPorPosicao : null,
        configuracaoCores ? (configuracaoCores.materialAlfabeto || "flexiprint") : "bioprint"
    );
    if (resultado.referenciasTexto.length > 0) {
        itensLegenda.push({
            tipo: "alfabeto",
            nome: "Referências do Alfabeto",
            texto: resultado.referenciasTexto.join("\n"),
            referencia: "",
            quantidade: 1,
            unidade: "",
            tamanhoAlfabeto: tamanhoSelecionado,
            materialAlfabeto: resultado.materialAlfabeto,
            corBioprint: resultado.corBioprint,
            coresPorPosicao: resultado.coresPorPosicao,
            palavraDigitada: resultado.palavraDigitada
        });
        atualizarListaItens();
        campoPalavraChave.text = "";
        campoNomeTipo.text = resultado.palavraDigitada;
    } else {
        ui.mostrarAlertaPersonalizado(t("nenhumaLetraValida"), "Atenção");
    }
} 

// Função para gerar referências do alfabeto para o preview
function gerarPreviewAlfabeto(itensLegenda) {
    var referenciasAlfabeto = [];
    var alfabetoUsado = false;
    var palavraDigitada = "";
    var corBioprint = "";
    var materialAlfabeto = "bioprint";
    for (var i = 0; i < itensLegenda.length; i++) {
        var item = itensLegenda[i];
        if (item.tipo === "alfabeto" && item.palavraDigitada) {
            palavraDigitada = item.palavraDigitada;
            corBioprint = item.corBioprint;
            materialAlfabeto = item.materialAlfabeto === "flexiprint" ? "flexiprint" : "bioprint";
            alfabetoUsado = true;
            referenciasAlfabeto.push(item);
        }
    }
    return {
        referenciasAlfabeto: referenciasAlfabeto,
        alfabetoUsado: alfabetoUsado,
        palavraDigitada: palavraDigitada,
        materialAlfabeto: materialAlfabeto,
        corBioprint: corBioprint
    };
} 

// Função para obter o tamanho do alfabeto nos itens da legenda
function obterTamanhoAlfabeto(itensLegenda) {
    var tamanho = "";
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].tipo === "alfabeto") {
            tamanho = itensLegenda[i].tamanhoAlfabeto;
            break;
        }
    }
    return tamanho;
} 

// Função para obter a palavra digitada do alfabeto nos itens da legenda
function obterPalavraDigitadaAlfabeto(itensLegenda) {
    var palavra = "";
    for (var i = 0; i < itensLegenda.length; i++) {
        if (itensLegenda[i].tipo === "alfabeto") {
            palavra = itensLegenda[i].palavraDigitada;
            break;
        }
    }
    return palavra;
} 

// Função para gerar o nome do arquivo AI do alfabeto
function gerarNomeArquivoAlfabeto(caractere, sufixoTamanho) {
    var nomeArquivoAI = "";
    if (caractere >= 'A' && caractere <= 'Z') {
        var numeroLetra = 214 + (caractere.charCodeAt(0) - 'A'.charCodeAt(0));
        nomeArquivoAI = "GX" + numeroLetra + "LW_" + sufixoTamanho + ".ai";
    } else if (caractere === '<3') {
        nomeArquivoAI = "GX240LW_" + sufixoTamanho + ".ai";
    } else if (caractere === '#') {
        nomeArquivoAI = "GX241LW_" + sufixoTamanho + ".ai";
    }
    return nomeArquivoAI;
}

/**
 * Cria interface de alfabeto quando checkbox é marcado
 */
function criarInterfaceAlfabeto(grupoExtra, dados, janela, t, funcoesFiltragem, funcoes, itensLegenda, atualizarListaItens, campoNomeTipo, grupoDimensoes) {
    var grupoAlfabeto = grupoExtra.add("panel", undefined, t("alfabeto"));
    grupoAlfabeto.orientation = "column";
    grupoAlfabeto.alignChildren = ["fill", "top"];
    grupoAlfabeto.spacing = 5;
    grupoAlfabeto.margins = [10, 16, 10, 8];

    function fixarTamanho(controle, largura, altura) {
        controle.minimumSize = [largura, altura];
        controle.preferredSize = [largura, altura];
        controle.maximumSize = [largura, altura];
    }
    function carregarCores(material) {
        var opcoes = { items: [], removeAll: function() { this.items = []; },
            add: function(tipo, nome) {
                for (var i = 0; i < dados.cores.length; i++) {
                    if (dados.cores[i].nome === nome) { this.items.push(nome); break; }
                }
            }
        };
        funcoesFiltragem.preencherCoresBioprint(opcoes, dados, funcoes.arrayContains, funcoes.encontrarPorId, material);
        return opcoes.items;
    }
    function criarConfiguracao(material) {
        var cores = carregarCores(material);
        var gerais = funcoes.arrayContains(cores, "or") ? ["or"] : cores.slice(0, 1);
        if (material === "flexiprint" && funcoes.arrayContains(cores, "blanc") && !funcoes.arrayContains(gerais, "blanc")) gerais.push("blanc");
        return { materialAlfabeto: material, coresGerais: gerais, coresPorPosicao: {}, coresDisponiveis: cores };
    }
    function copiarCoresPorPosicao(cores) {
        var copia = {};
        for (var i in cores) if (cores.hasOwnProperty(i)) copia[i] = cores[i].slice(0);
        return copia;
    }
    var configuracoes = [criarConfiguracao("bioprint"), criarConfiguracao("flexiprint")];
    var letras = [], atualizando = false;
    var linhaFrase = grupoAlfabeto.add("group");
    linhaFrase.alignChildren = ["left", "center"];
    linhaFrase.spacing = 8;
    linhaFrase.add("statictext", undefined, t("alfabetoLabel"));
    var campoPalavraChave = linhaFrase.add("edittext", undefined, "");
    campoPalavraChave.characters = 12;
    campoPalavraChave.alignment = ["fill", "center"];
    campoPalavraChave.helpTip = t("instrucaoAlfabeto");
    var modeloAlfabeto = linhaFrase.add("dropdownlist", undefined, ["2D · Bioprint", "3D · Flexiprint"]);
    modeloAlfabeto.selection = 1;
    linhaFrase.add("statictext", undefined, t("cor"));
    var dropdownCorGeral = linhaFrase.add("dropdownlist");
    fixarTamanho(dropdownCorGeral, 160, 24);
    linhaFrase.add("statictext", undefined, t("tamanho"));
    var tamanhoAlfabeto = linhaFrase.add("dropdownlist", undefined, ["1,40 m", "2,00 m"]);
    tamanhoAlfabeto.selection = 0;

    var linhaAcoes = grupoAlfabeto.add("group");
    linhaAcoes.spacing = 6;
    linhaAcoes.alignChildren = ["left", "center"];
    var botaoPersonalizar = linhaAcoes.add("button", undefined, t("alfabetoPersonalizar"));
    var resumoCores = linhaAcoes.add("statictext", undefined, "");
    resumoCores.alignment = ["fill", "center"];
    resumoCores.characters = 26;
    var botaoAdicionarPalavraChave = linhaAcoes.add("button", undefined, t("adicionar"));

    function configuracaoAtual() { return configuracoes[modeloAlfabeto.selection.index]; }
    function atualizarInterface() {
        var cfg = configuracaoAtual(), selecionado = -1, n = 0;
        atualizando = true;
        dropdownCorGeral.removeAll();
        function opcao(cores) {
            var item = dropdownCorGeral.add("item", cores.join(" + "));
            item.cores = cores;
            if (cores.slice(0).sort().join("|") === cfg.coresGerais.slice(0).sort().join("|")) selecionado = item.index;
        }
        if (cfg.materialAlfabeto === "flexiprint" && funcoes.arrayContains(cfg.coresDisponiveis, "or") && funcoes.arrayContains(cfg.coresDisponiveis, "blanc")) opcao(["or", "blanc"]);
        for (var c = 0; c < cfg.coresDisponiveis.length; c++) opcao([cfg.coresDisponiveis[c]]);
        if (selecionado < 0 && cfg.coresGerais.length) opcao(cfg.coresGerais.slice(0));
        dropdownCorGeral.add("item", t("alfabetoVariasCores"));
        dropdownCorGeral.selection = selecionado;
        dropdownCorGeral.helpTip = cfg.coresGerais.join(" + ");
        dropdownCorGeral.enabled = cfg.coresDisponiveis.length > 0;
        atualizando = false;
        for (var i in cfg.coresPorPosicao) if (cfg.coresPorPosicao.hasOwnProperty(i)) n++;
        resumoCores.text = n ? n + " " + t("alfabetoPersonalizadas") : t("alfabetoTodasGerais");
        botaoPersonalizar.enabled = letras.length > 0 && cfg.coresDisponiveis.length > 0;
        botaoAdicionarPalavraChave.enabled = letras.length > 0 && cfg.coresGerais.length > 0;
        if (janela.update) janela.update();
    }
    function atualizarLetras() {
        var novas = obterLetrasAlfabeto(campoPalavraChave.text), inicio = 0;
        while (inicio < novas.length && inicio < letras.length && novas[inicio] === letras[inicio]) inicio++;
        for (var m = 0; m < configuracoes.length; m++) {
            var cores = configuracoes[m].coresPorPosicao;
            for (var chave in cores) if (cores.hasOwnProperty(chave) && Number(chave) >= inicio) delete cores[chave];
        }
        letras = novas;
        atualizarInterface();
    }
    function abrirEditorCores(gerais) {
        var cfg = configuracaoAtual(), rascunhos = copiarCoresPorPosicao(cfg.coresPorPosicao);
        var coresGerais = cfg.coresGerais.slice(0), selecionada = 0, pagina = 0, botoes = [];
        if (!gerais && !letras.length) return;
        var dlg = new Window("dialog", t(gerais ? "alfabetoCoresGerais" : "alfabetoPersonalizar"));
        dlg.orientation = "column";
        dlg.alignChildren = ["fill", "top"];
        var palavra = dlg.add("statictext", undefined, gerais ? t("alfabetoTodasGerais") : campoPalavraChave.text);
        fixarTamanho(palavra, 420, 20);
        palavra.helpTip = campoPalavraChave.text;
        var anterior, seguinte, contador, usarGerais;
        if (!gerais) {
            var linhaLetras = dlg.add("group");
            linhaLetras.spacing = 5;
            anterior = linhaLetras.add("button", undefined, "‹");
            fixarTamanho(anterior, 24, 30);
            anterior.helpTip = t("alfabetoAnteriores");
            for (var b = 0; b < 6; b++) {
                var botao = linhaLetras.add("button", undefined, "");
                fixarTamanho(botao, 54, 36);
                botao.onClick = function() { selecionada = this.posicao; atualizarEditor(); };
                botoes.push(botao);
            }
            seguinte = linhaLetras.add("button", undefined, "›");
            fixarTamanho(seguinte, 24, 30);
            seguinte.helpTip = t("alfabetoSeguintes");
            contador = dlg.add("statictext", undefined, "");
            anterior.onClick = function() { pagina--; selecionada = pagina * 6; atualizarEditor(); };
            seguinte.onClick = function() { pagina++; selecionada = pagina * 6; atualizarEditor(); };
        }
        var alvo = dlg.add("statictext", undefined, "");
        var checks = [], linha;
        function coresAtuais() { return gerais ? coresGerais : rascunhos[selecionada] || coresGerais; }
        function atualizarEditor() {
            var atuais = coresAtuais();
            if (!gerais) {
                for (var b = 0; b < botoes.length; b++) {
                    var indice = pagina * 6 + b, botao = botoes[b];
                    botao.posicao = indice;
                    botao.enabled = indice < letras.length;
                    botao.text = botao.enabled ? (indice === selecionada ? "[" : "") + (indice + 1) + ": " + letras[indice] + (indice === selecionada ? "]" : "") : "";
                    botao.helpTip = botao.enabled ? (rascunhos[indice] || coresGerais).join(" + ") : "";
                }
                anterior.enabled = pagina > 0;
                seguinte.enabled = (pagina + 1) * 6 < letras.length;
                contador.text = (pagina * 6 + 1) + "–" + Math.min((pagina + 1) * 6, letras.length) + " / " + letras.length;
                usarGerais.enabled = rascunhos.hasOwnProperty(selecionada);
            }
            alvo.text = gerais ? (cfg.materialAlfabeto === "flexiprint" ? "Flexiprint" : "Bioprint") : (selecionada + 1) + ": " + letras[selecionada];
            for (var c = 0; c < checks.length; c++) {
                checks[c].value = funcoes.arrayContains(atuais, checks[c].cor);
                checks[c].enabled = !(checks[c].value && atuais.length === 1);
            }
        }
        for (var c = 0; c < cfg.coresDisponiveis.length; c++) {
            if (c % 3 === 0) { linha = dlg.add("group"); linha.alignChildren = ["left", "center"]; }
            var check = linha.add("checkbox", undefined, cfg.coresDisponiveis[c]);
            check.preferredSize.width = 130;
            check.cor = cfg.coresDisponiveis[c];
            check.onClick = function() {
                var cores = coresAtuais().slice(0);
                if (this.value && !funcoes.arrayContains(cores, this.cor)) cores.push(this.cor);
                else if (!this.value && cores.length > 1) {
                    for (var j = cores.length - 1; j >= 0; j--) if (cores[j] === this.cor) cores.splice(j, 1);
                }
                if (gerais) coresGerais = cores;
                else rascunhos[selecionada] = cores;
                atualizarEditor();
            };
            checks.push(check);
        }
        if (!gerais) {
            usarGerais = dlg.add("button", undefined, t("alfabetoUsarCoresGerais"));
            usarGerais.onClick = function() { delete rascunhos[selecionada]; atualizarEditor(); };
        }
        var acoes = dlg.add("group");
        acoes.alignment = "right";
        acoes.add("button", undefined, t("cancelar"), {name: "cancel"});
        var aplicar = acoes.add("button", undefined, t("alfabetoAplicar"), {name: "ok"});
        aplicar.onClick = function() { dlg.close(1); };
        atualizarEditor();
        if (dlg.show() === 1) {
            if (gerais) cfg.coresGerais = coresGerais;
            else cfg.coresPorPosicao = rascunhos;
        }
        atualizarInterface();
    }
    campoPalavraChave.onChanging = atualizarLetras;
    campoPalavraChave.onChange = atualizarLetras;
    modeloAlfabeto.onChange = atualizarInterface;
    dropdownCorGeral.onChange = function() {
        if (atualizando || !this.selection) return;
        if (!this.selection.cores) abrirEditorCores(true);
        else { configuracaoAtual().coresGerais = this.selection.cores.slice(0); atualizarInterface(); }
    };
    botaoPersonalizar.onClick = function() { abrirEditorCores(false); };
    botaoAdicionarPalavraChave.onClick = function() {
        adicionarPalavraChaveAlfabeto(campoPalavraChave, null, tamanhoAlfabeto, grupoDimensoes, itensLegenda, atualizarListaItens, campoNomeTipo, t, configuracaoAtual());
        if (campoPalavraChave.text === "") atualizarLetras();
    };
    atualizarInterface();
    janela.layout.layout(true);
    return { grupoAlfabeto: grupoAlfabeto, campoPalavraChave: campoPalavraChave, modeloAlfabeto: modeloAlfabeto,
        tamanhoAlfabeto: tamanhoAlfabeto, dropdownCorGeral: dropdownCorGeral, resumoCores: resumoCores,
        botaoPersonalizar: botaoPersonalizar, botaoAdicionarPalavraChave: botaoAdicionarPalavraChave };
}

/**
 * Remove interface de alfabeto quando checkbox é desmarcado
 */
function removerInterfaceAlfabeto(componentes, janela) {
    if (logs && logs.logFuncao) {
        logs.logFuncao("removerInterfaceAlfabeto", "Removendo interface de alfabeto");
    }
    
    try {
        if (componentes && componentes.grupoAlfabeto) {
            componentes.grupoAlfabeto.parent.remove(componentes.grupoAlfabeto);
            janela.layout.layout(true);
            
            if (logs && logs.logFuncao) {
                logs.logFuncao("removerInterfaceAlfabeto", "Interface de alfabeto removida com sucesso");
            }
        }
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao remover interface de alfabeto: " + erro.message, "error");
        }
    }
}

// Export global
$.global.alfabeto = {
    obterLetrasAlfabeto: obterLetrasAlfabeto,
    processarAlfabeto: processarAlfabeto,
    adicionarPalavraChaveAlfabeto: adicionarPalavraChaveAlfabeto,
    gerarPreviewAlfabeto: gerarPreviewAlfabeto,
    obterTamanhoAlfabeto: obterTamanhoAlfabeto,
    obterPalavraDigitadaAlfabeto: obterPalavraDigitadaAlfabeto,
    gerarNomeArquivoAlfabeto: gerarNomeArquivoAlfabeto,
    criarInterfaceAlfabeto: criarInterfaceAlfabeto,
    removerInterfaceAlfabeto: removerInterfaceAlfabeto
};
