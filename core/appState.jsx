/**
 * appState.jsx
 *
 * Estado base da aplicação e variáveis globais partilhadas entre módulos.
 * Mantém compatibilidade com o modelo atual baseado em variáveis globais e
 * namespaces em $.global.
 */

function criarUltimaSelecaoInicial() {
    return {
        componente: null,
        cor: null,
        unidade: null,
        multiplicador: "1"
    };
}

function criarExtraStateInicial() {
    return {
        ativos: {
            observacoes: false,
            componenteExtra: false,
            pvc: false,
            texturas: false,
            bolas: false,
            contador: false,
            alfabeto: false
        }
    };
}

function limparEstadoRuntimeLegenda() {
    itensLegenda = [];
    itensNomes = [];
    ultimaSelecao = criarUltimaSelecaoInicial();

    $.global.itensLegenda = itensLegenda;
    $.global.itensNomes = itensNomes;
    $.global.ultimaSelecao = ultimaSelecao;
    $.global.extraState = criarExtraStateInicial();
    $.global.componentesObservacoes = null;
    $.global.areaLogs = null;

    return {
        itensLegenda: itensLegenda,
        itensNomes: itensNomes,
        ultimaSelecao: ultimaSelecao,
        extraState: $.global.extraState
    };
}

function inicializarEstadoBaseLegenda() {
    if (typeof caminhoConfig === "undefined" || !caminhoConfig) {
        caminhoConfig = Folder.myDocuments.fsName + "/cartouche_config.json";
    }

    if (typeof nomeDesigner === "undefined") {
        nomeDesigner = "";
    }

    if (typeof idiomaUsuario === "undefined" || !idiomaUsuario) {
        idiomaUsuario = "Português";
    }

    if (typeof IDIOMA_ATUAL === "undefined" || !IDIOMA_ATUAL) {
        IDIOMA_ATUAL = idiomaUsuario;
    }

    limparEstadoRuntimeLegenda();

    $.global.caminhoConfig = caminhoConfig;
    $.global.nomeDesigner = nomeDesigner;
    $.global.idiomaUsuario = idiomaUsuario;
    $.global.IDIOMA_ATUAL = IDIOMA_ATUAL;
    $.global.itensLegenda = itensLegenda;
    $.global.itensNomes = itensNomes;
    $.global.ultimaSelecao = ultimaSelecao;

    return {
        caminhoConfig: caminhoConfig,
        nomeDesigner: nomeDesigner,
        idiomaUsuario: idiomaUsuario,
        idiomaAtual: IDIOMA_ATUAL,
        itensLegenda: itensLegenda,
        itensNomes: itensNomes,
        ultimaSelecao: ultimaSelecao,
        extraState: $.global.extraState
    };
}

$.global.appState = {
    inicializarEstadoBaseLegenda: inicializarEstadoBaseLegenda,
    limparEstadoRuntimeLegenda: limparEstadoRuntimeLegenda
};
