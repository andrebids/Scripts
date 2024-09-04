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

// Exportar as funções para uso em outros scripts
$.global.regras = {
    arredondarParaDecima: arredondarParaDecima,
    arredondamentoEspecial: arredondamentoEspecial,
    formatarQuantidade: formatarQuantidade,
    apenasNumerosEVirgula: apenasNumerosEVirgula,
    formatarDimensao: formatarDimensao,
    coresStructure: coresStructure,
    criarGrupoStructure: criarGrupoStructure
};