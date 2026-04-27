// Função para processar o alfabeto e retornar as referências
function processarAlfabeto(alfabeto, corBioprintSelecionada, tamanhoSelecionado) {
    var referenciasUsadas = {};
    
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
    
    alfabeto = alfabeto.toUpperCase();
    for (var i = 0; i < alfabeto.length; i++) {
        var caractere = alfabeto[i];
        if (caractere === '<' && alfabeto[i+1] === '3') {
            caractere = '<3';
            i++; // Pula o próximo caractere, pois já foi processado
        }
        
        if (referenciasMapeadas.hasOwnProperty(caractere)) {
            if (!referenciasUsadas[caractere]) {
                referenciasUsadas[caractere] = 1;
            } else {
                referenciasUsadas[caractere]++;
            }
        }
    }

    var referenciasTexto = [];
    for (var caractere in referenciasUsadas) {
        if (referenciasUsadas.hasOwnProperty(caractere)) {
            referenciasTexto.push(referenciasMapeadas[caractere] + " (" + caractere + ") bioprint " + corBioprintSelecionada + " " + tamanhoSelecionado + ": " + referenciasUsadas[caractere]);
        }
    }
    
    return {
        referenciasTexto: referenciasTexto,
        palavraDigitada: palavraDigitada
    };
} 

// Função para adicionar palavra-chave do alfabeto
function adicionarPalavraChaveAlfabeto(campoPalavraChave, dropdownCorBioprint, tamanhoAlfabeto, grupoDimensoes, itensLegenda, atualizarListaItens, campoNomeTipo, t) {
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
        dropdownCorBioprint.selection ? dropdownCorBioprint.selection.text : "",
        tamanhoSelecionado
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
            bioprint: "bioprint",
            corBioprint: dropdownCorBioprint.selection ? dropdownCorBioprint.selection.text : "",
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
    for (var i = 0; i < itensLegenda.length; i++) {
        var item = itensLegenda[i];
        if (item.tipo === "alfabeto" && item.palavraDigitada) {
            palavraDigitada = item.palavraDigitada;
            corBioprint = item.corBioprint;
            alfabetoUsado = true;
            referenciasAlfabeto.push(item);
        }
    }
    return {
        referenciasAlfabeto: referenciasAlfabeto,
        alfabetoUsado: alfabetoUsado,
        palavraDigitada: palavraDigitada,
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
    if (logs && logs.logFuncao) {
        logs.logFuncao("criarInterfaceAlfabeto", "Criando interface de alfabeto");
    }
    
    try {
        // Validação de parâmetros
        if (!grupoExtra || !dados || !janela || !t) {
            throw new Error("Parâmetros obrigatórios não fornecidos");
        }
        
        // Adicionar o grupo de alfabeto
        var grupoAlfabeto = grupoExtra.add("panel", undefined, t("alfabeto"));
        grupoAlfabeto.orientation = "column";
        grupoAlfabeto.alignChildren = ["fill", "top"];
        grupoAlfabeto.spacing = 10;

        var subGrupoAlfabeto = grupoAlfabeto.add("group");
        subGrupoAlfabeto.orientation = "row";
        subGrupoAlfabeto.alignChildren = ["fill", "top"];
        subGrupoAlfabeto.spacing = 10;

        subGrupoAlfabeto.add("statictext", undefined, t("alfabetoLabel"));
        var campoPalavraChave = subGrupoAlfabeto.add("edittext", undefined, "");
        campoPalavraChave.characters = 20;

        // Adicionar texto estático para bioprint
        subGrupoAlfabeto.add("statictext", undefined, t("bioprint"));

        // Adicionar dropdown para cor do bioprint
        subGrupoAlfabeto.add("statictext", undefined, t("cor"));
        var dropdownCorBioprint = subGrupoAlfabeto.add("dropdownlist", undefined, ["Selecione a cor"]);

        // Manter o dropdown de tamanho existente
        subGrupoAlfabeto.add("statictext", undefined, t("tamanho"));
        var tamanhoAlfabeto = subGrupoAlfabeto.add("dropdownlist", undefined, ["1,40 m", "2,00 m"]);
        tamanhoAlfabeto.selection = 0;

        var botaoAdicionarPalavraChave = grupoAlfabeto.add("button", undefined, t("adicionar"));

        // Adicionar linha separadora
        var linhaSeparadora = grupoAlfabeto.add("panel");
        linhaSeparadora.preferredSize = [-1, 2];
        linhaSeparadora.graphics.backgroundColor = linhaSeparadora.graphics.newBrush(linhaSeparadora.graphics.BrushType.SOLID_COLOR, [0, 0, 0, 1]);

        // Adicionar texto de informação
        grupoAlfabeto.add("statictext", undefined, t("instrucaoAlfabeto"));

        // Chamar a função para preencher as cores do bioprint
        if (funcoesFiltragem && funcoesFiltragem.preencherCoresBioprint) {
            funcoesFiltragem.preencherCoresBioprint(dropdownCorBioprint, dados, funcoes.arrayContains, funcoes.encontrarPorId);
        }

        // Configurar evento do botão
        botaoAdicionarPalavraChave.onClick = function() {
            adicionarPalavraChaveAlfabeto(
                campoPalavraChave,
                dropdownCorBioprint,
                tamanhoAlfabeto,
                grupoDimensoes,
                itensLegenda,
                atualizarListaItens,
                campoNomeTipo,
                t
            );
        };

        // Atualizar layout da janela
        janela.layout.layout(true);
        janela.preferredSize.height += 100;
        
        if (logs && logs.logFuncao) {
            logs.logFuncao("criarInterfaceAlfabeto", "Interface de alfabeto criada com sucesso");
        }
        
        return {
            grupoAlfabeto: grupoAlfabeto,
            campoPalavraChave: campoPalavraChave,
            dropdownCorBioprint: dropdownCorBioprint,
            tamanhoAlfabeto: tamanhoAlfabeto,
            botaoAdicionarPalavraChave: botaoAdicionarPalavraChave
        };
        
    } catch (erro) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao criar interface de alfabeto: " + erro.message, "error");
        }
        return null;
    }
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
            janela.preferredSize.height -= 100;
            
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
    processarAlfabeto: processarAlfabeto,
    adicionarPalavraChaveAlfabeto: adicionarPalavraChaveAlfabeto,
    gerarPreviewAlfabeto: gerarPreviewAlfabeto,
    obterTamanhoAlfabeto: obterTamanhoAlfabeto,
    obterPalavraDigitadaAlfabeto: obterPalavraDigitadaAlfabeto,
    gerarNomeArquivoAlfabeto: gerarNomeArquivoAlfabeto,
    criarInterfaceAlfabeto: criarInterfaceAlfabeto,
    removerInterfaceAlfabeto: removerInterfaceAlfabeto
}; 