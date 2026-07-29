// regras.jsx

// Função auxiliar para logs protegidos
function logProtegidoRegras(mensagem, tipo) {
    if (typeof logs !== 'undefined' && logs.adicionarLog && logs.TIPOS_LOG) {
        logs.adicionarLog(mensagem, tipo);
    }
}

// Função para arredondar para a décima
function arredondarParaDecima(valor) {
    logProtegidoRegras("Arredondando para décima: " + valor, logs.TIPOS_LOG.FUNCTION);
    return Math.ceil(valor * 10) / 10;
}

// Função de arredondamento especial
function arredondamentoEspecial(valor, componenteId, unidade) {
    if (componenteId === 13 || componenteId === 14) { // IDs do fil lumiére e fil cométe
        return Math.ceil(valor);
    } else if (unidade === 'm2' || unidade === 'ml') {
        return arredondarParaDecima(valor);
    }
    return valor;
}

// Função para formatar a quantidade
function formatarQuantidade(quantidade, componenteId, unidade) {
    if (componenteId === 13 || componenteId === 14) {
        return quantidade.toString();
    } else if (unidade === 'm2' || unidade === 'ml') {
        return quantidade.toFixed(1).replace('.', ',');
    } else {
        return quantidade.toFixed(2).replace('.', ',');
    }
}

// Função para permitir apenas números e vírgula nas dimensões
function apenasNumerosEVirgula(campo) {
    campo.onKeydown = function(e) {
        var key = e.keyName;
        var isNumber = (key >= "0" && key <= "9");
        var isComma = (key == "," || key == ".");
        var isControlKey = (key == "Backspace" || key == "Delete" || key == "Left" || key == "Right");
        
        if (!(isNumber || isComma || isControlKey)) {
            e.preventDefault();
        }
    };
}

// Função para formatar números com duas casas decimais
function formatarNumero(match, inteiro, decimal) {
    var numero = parseFloat(inteiro + "." + decimal);
    return numero.toFixed(2).replace(".", ",");
}

// Função para formatar as dimensões com duas casas decimais
function formatarDimensao(valor) {
    if (valor === "") return "";
    var numero = parseFloat(valor.replace(',', '.'));
    if (isNaN(numero)) return "";
    return numero.toFixed(2).replace('.', ',') + " m";
}

// Cores para Structure laqueé
var coresStructure = [
    "Blanc RAL 9010",
    "Or PANTONE 131C",
    "Rouge RAL 3000",
    "Bleu RAL 5005",
    "Vert RAL 6029",
    "Rose RAL 3015",
    "Noir RAL 9011"
];

// Função para criar o grupo Structure laqueé
function criarGrupoStructure(parentGroup) {
    var grupoStructure = parentGroup.add("group");
    grupoStructure.orientation = "row";
    var checkStructure = grupoStructure.add("checkbox", undefined, "Structure laqué");
    var corStructure = grupoStructure.add("dropdownlist", undefined, coresStructure);
    corStructure.selection = 0;
    corStructure.enabled = false;

    checkStructure.onClick = function() {
        corStructure.enabled = checkStructure.value;
    };

    return {
        grupo: grupoStructure,
        checkbox: checkStructure,
        corDropdown: corStructure
    };
}

// Função para classificar se é 2D ou 3D baseado nas dimensões
function classificar2Dou3D(dimensoes) {
    logProtegidoRegras("Classificando dimensões 2D/3D", logs.TIPOS_LOG.FUNCTION);
    
    // Função para verificar se uma dimensão está preenchida (não vazia e maior que 0)
    function dimensaoPreenchida(valor) {
        if (!valor || valor === "") return false;
        var numero = parseFloat(valor.replace(',', '.'));
        return !isNaN(numero) && numero > 0;
    }
    
    try {
        // Verificar quais dimensões estão preenchidas
        var temH = dimensaoPreenchida(dimensoes.H);
        var temL = dimensaoPreenchida(dimensoes.L);
        var temP = dimensaoPreenchida(dimensoes.P);
        var temDiametro = dimensaoPreenchida(dimensoes.diametro);
        
        // Log das dimensões encontradas
        var dimensoesEncontradas = [];
        if (temH) dimensoesEncontradas.push("H");
        if (temL) dimensoesEncontradas.push("L");
        if (temP) dimensoesEncontradas.push("P");
        if (temDiametro) dimensoesEncontradas.push("⌀");
        
        // Aplicar regras de classificação
        var classificacao = "";
        var motivo = "";
        
        if (temP) {
            // A profundidade é o indicador mais forte de volume
            classificacao = "3D";
            motivo = temH && temL ? "Presença de H, L e P" : "Presença de profundidade (P)";
        } else if (temDiametro) {
            // Diâmetro sozinho não implica volume; um círculo continua a ser 2D
            classificacao = "2D";
            motivo = "Presença de diâmetro (⌀) sem profundidade (P)";
        } else if (temH && temL && !temP) {
            // Se há apenas H e L (sem P), é 2D
            classificacao = "2D";
            motivo = "Apenas H e L presentes (sem P)";
        } else if ((temH || temL || temP) && dimensoesEncontradas.length < 2) {
            // Se há apenas uma dimensão, considerar como 2D
            classificacao = "2D";
            motivo = "Apenas uma dimensão presente";
        } else {
            // Nenhuma dimensão válida ou caso não coberto
            classificacao = "";
            motivo = "Nenhuma dimensão válida encontrada";
        }
        
        logProtegidoRegras("Classificação concluída: " + classificacao + " - " + motivo, logs.TIPOS_LOG.INFO);
        return {
            classificacao: classificacao,
            motivo: motivo,
            dimensoesEncontradas: dimensoesEncontradas,
            temH: temH,
            temL: temL,
            temP: temP,
            temDiametro: temDiametro
        };
        
    } catch (e) {
        logProtegidoRegras("Erro ao classificar dimensões: " + e.message, logs.TIPOS_LOG.ERROR);
        // Em caso de erro, retornar resultado vazio
        return {
            classificacao: "",
            motivo: "Erro ao processar dimensões: " + e.message,
            dimensoesEncontradas: [],
            temH: false,
            temL: false,
            temP: false,
            temDiametro: false
        };
    }
}

// Normalização independente do idioma para as regras de recomendação de PRINT.
function normalizarTextoRegraPrint(valor) {
    var texto = String(valor || "").toLowerCase();
    texto = texto.replace(/[áàâãä]/g, "a");
    texto = texto.replace(/[éèêë]/g, "e");
    texto = texto.replace(/[íìîï]/g, "i");
    texto = texto.replace(/[óòôõö]/g, "o");
    texto = texto.replace(/[úùûü]/g, "u");
    texto = texto.replace(/ç/g, "c");
    return texto.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
}

function obterTipoRegraPrint(nomePrint) {
    var nome = normalizarTextoRegraPrint(nomePrint);

    if (nome.indexOf("flexiprint") !== -1 && nome.indexOf("ignifuge") !== -1) {
        return "flexiprintIgnifuge";
    }
    if (nome.indexOf("print") !== -1 && nome.indexOf("ignifuge") !== -1) {
        return "printIgnifuge";
    }
    if (nome.indexOf("flexi+") !== -1 || nome.indexOf("flexi +") !== -1) {
        return "flexiPlus";
    }
    if (nome.indexOf("flexiprint") !== -1) {
        return "flexiprint";
    }
    if (nome.indexOf("recyprint") !== -1) {
        return "recyprint";
    }
    if (nome.indexOf("bioprint") !== -1) {
        return "bioprint";
    }
    return "outro";
}

function adicionarAvisoRegraPrint(avaliacao, codigo) {
    for (var i = 0; i < avaliacao.avisos.length; i++) {
        if (avaliacao.avisos[i] === codigo) {
            return;
        }
    }
    avaliacao.avisos.push(codigo);
}

/**
 * Avalia um PRINT no contexto escolhido pelo utilizador.
 * As regras são intencionalmente mantidas em código e não são editáveis na base.
 */
function avaliarCompatibilidadePrint(nomePrint, uso, fixacao, temIluminacaoLed) {
    var tipo = obterTipoRegraPrint(nomePrint);
    var usoNorm = normalizarTextoRegraPrint(uso);
    var fixacaoNorm = normalizarTextoRegraPrint(fixacao);
    var interior = usoNorm.indexOf("interieur") !== -1 || usoNorm.indexOf("interior") !== -1;
    var exterior = usoNorm.indexOf("exterieur") !== -1 || usoNorm.indexOf("exterior") !== -1;
    var auSol = fixacaoNorm.indexOf("au sol") !== -1 || fixacaoNorm.indexOf("pose au sol") !== -1;
    var poteauOuTransversal = fixacaoNorm.indexOf("poteau") !== -1 || fixacaoNorm.indexOf("transversal") !== -1;
    var avaliacao = {
        nomeOriginal: nomePrint,
        tipo: tipo,
        recomendado: false,
        condicional: false,
        condicaoCumprida: true,
        fimSerie: tipo === "bioprint",
        marcador: "",
        dica: "compativel",
        prioridade: 20,
        avisos: []
    };

    if (avaliacao.fimSerie) {
        adicionarAvisoRegraPrint(avaliacao, "fimSerie");
        avaliacao.marcador = "[FIN]";
        avaliacao.dica = "fimSerie";
        avaliacao.prioridade = 40;
    }

    // Sem Usage escolhido apenas se destaca o fim de série.
    if (!interior && !exterior) {
        return avaliacao;
    }

    if (interior) {
        if (tipo === "flexiprintIgnifuge") {
            avaliacao.recomendado = true;
            avaliacao.marcador = "[REC]";
            avaliacao.dica = "recomendado";
            avaliacao.prioridade = 0;
        } else if (tipo === "printIgnifuge") {
            // Para decoração no chão, Flexiprint ignifugé tem prioridade específica.
            if (!auSol) {
                avaliacao.recomendado = true;
                avaliacao.marcador = "[REC]";
                avaliacao.dica = "recomendado";
                avaliacao.prioridade = 0;
            } else {
                avaliacao.prioridade = 10;
            }
        } else if (tipo === "recyprint") {
            avaliacao.condicional = true;
            avaliacao.condicaoCumprida = temIluminacaoLed === true;
            avaliacao.marcador = "[LED]";
            avaliacao.dica = "requerLed";
            avaliacao.prioridade = avaliacao.condicaoCumprida ? 10 : 30;
            if (!avaliacao.condicaoCumprida) {
                adicionarAvisoRegraPrint(avaliacao, "requerLed");
            }
        } else if (tipo === "flexiprint" || tipo === "flexiPlus" || tipo === "bioprint") {
            adicionarAvisoRegraPrint(avaliacao, "somenteExterior");
            if (!avaliacao.fimSerie) {
                avaliacao.marcador = "[EXT]";
                avaliacao.dica = "somenteExterior";
            }
            avaliacao.prioridade = avaliacao.fimSerie ? 50 : 30;
        }
    }

    if (exterior) {
        if (tipo === "printIgnifuge" || tipo === "flexiprintIgnifuge") {
            adicionarAvisoRegraPrint(avaliacao, "somenteInterior");
            avaliacao.marcador = "[INT]";
            avaliacao.dica = "somenteInterior";
            avaliacao.prioridade = 30;
        } else if (auSol && (tipo === "flexiprint" || tipo === "flexiPlus")) {
            avaliacao.recomendado = true;
            avaliacao.marcador = "[REC]";
            avaliacao.dica = "recomendado";
            avaliacao.prioridade = 0;
        } else if (poteauOuTransversal && tipo === "recyprint") {
            avaliacao.recomendado = true;
            avaliacao.marcador = "[REC]";
            avaliacao.dica = "recomendado";
            avaliacao.prioridade = 0;
        } else if (!avaliacao.fimSerie) {
            avaliacao.prioridade = 10;
        }
    }

    return avaliacao;
}

function ordenarAvaliacoesPrint(nomesPrint, uso, fixacao, temIluminacaoLed) {
    var resultado = [];
    for (var i = 0; i < nomesPrint.length; i++) {
        resultado.push(avaliarCompatibilidadePrint(nomesPrint[i], uso, fixacao, temIluminacaoLed));
    }

    // Bubble sort por compatibilidade; mantém uma ordem previsível no ExtendScript.
    for (var a = 0; a < resultado.length - 1; a++) {
        for (var b = 0; b < resultado.length - a - 1; b++) {
            var atual = resultado[b];
            var seguinte = resultado[b + 1];
            var trocar = atual.prioridade > seguinte.prioridade;
            if (atual.prioridade === seguinte.prioridade) {
                trocar = normalizarTextoRegraPrint(atual.nomeOriginal) > normalizarTextoRegraPrint(seguinte.nomeOriginal);
            }
            if (trocar) {
                resultado[b] = seguinte;
                resultado[b + 1] = atual;
            }
        }
    }
    return resultado;
}

/**
 * Considera iluminação apenas quando um componente LED já foi adicionado à legenda.
 * A verificação usa os dados estruturados, não o campo Densité LED.
 */
function legendaTemIluminacaoLed(itensLegenda) {
    if (!itensLegenda || !itensLegenda.length) {
        return false;
    }

    for (var i = 0; i < itensLegenda.length; i++) {
        var item = itensLegenda[i];
        if (!item) {
            continue;
        }

        if (item.temLucioles === true || item.tipo === "gp_lucioles") {
            return true;
        }

        var texto = normalizarTextoRegraPrint(
            String(item.nome || "") + " " +
            String(item.referencia || "") + " " +
            String(item.texto || "")
        );
        if (texto.indexOf("led") !== -1) {
            return true;
        }
    }
    return false;
}

// Exportar as funções para uso em outros scripts
$.global.regras = {
    arredondarParaDecima: arredondarParaDecima,
    arredondamentoEspecial: arredondamentoEspecial,
    formatarQuantidade: formatarQuantidade,
    apenasNumerosEVirgula: apenasNumerosEVirgula,
    formatarDimensao: formatarDimensao,
    coresStructure: coresStructure,
    criarGrupoStructure: criarGrupoStructure,
    classificar2Dou3D: classificar2Dou3D,
    normalizarTextoRegraPrint: normalizarTextoRegraPrint,
    obterTipoRegraPrint: obterTipoRegraPrint,
    avaliarCompatibilidadePrint: avaliarCompatibilidadePrint,
    ordenarAvaliacoesPrint: ordenarAvaliacoesPrint,
    legendaTemIluminacaoLed: legendaTemIluminacaoLed
};
