// regras.jsx

// Função para arredondar para a décima
function arredondarParaDecima(valor) {
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
        
        if (temDiametro) {
            // Se há diâmetro, sempre é 3D
            classificacao = "3D";
            motivo = "Presença de diâmetro (⌀)";
        } else if (temH && temL && temP) {
            // Se há H, L e P, é 3D
            classificacao = "3D";
            motivo = "Presença de H, L e P";
        } else if (temH && temL && !temP) {
            // Se há apenas H e L (sem P), é 2D
            classificacao = "2D";
            motivo = "Apenas H e L presentes (sem P)";
        } else if ((temH || temL || temP) && dimensoesEncontradas.length < 2) {
            // Se há apenas uma dimensão, considerar como 2D
            classificacao = "2D";
            motivo = "Apenas uma dimensão presente";
        } else if (temP && !temH && !temL) {
            // Caso especial: apenas profundidade
            classificacao = "3D";
            motivo = "Apenas profundidade (P) presente";
        } else {
            // Nenhuma dimensão válida ou caso não coberto
            classificacao = "";
            motivo = "Nenhuma dimensão válida encontrada";
        }
        
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

// Exportar as funções para uso em outros scripts
$.global.regras = {
    arredondarParaDecima: arredondarParaDecima,
    arredondamentoEspecial: arredondamentoEspecial,
    formatarQuantidade: formatarQuantidade,
    apenasNumerosEVirgula: apenasNumerosEVirgula,
    formatarDimensao: formatarDimensao,
    coresStructure: coresStructure,
    criarGrupoStructure: criarGrupoStructure,
    classificar2Dou3D: classificar2Dou3D
};