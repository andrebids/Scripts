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
        alert(t("nenhumaLetraValida"));
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