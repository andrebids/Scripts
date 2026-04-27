/**
 * appState.jsx
 *
 * Estado base da aplicação e variáveis globais partilhadas entre módulos.
 * Mantém compatibilidade com o modelo atual baseado em variáveis globais e
 * namespaces em $.global.
 */

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

    if (typeof itensLegenda === "undefined" || !itensLegenda) {
        itensLegenda = [];
    }

    if (typeof itensNomes === "undefined" || !itensNomes) {
        itensNomes = [];
    }

    if (typeof ultimaSelecao === "undefined" || !ultimaSelecao) {
        ultimaSelecao = {
            componente: null,
            cor: null,
            unidade: null,
            multiplicador: "1"
        };
    }

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
        ultimaSelecao: ultimaSelecao
    };
}

$.global.appState = {
    inicializarEstadoBaseLegenda: inicializarEstadoBaseLegenda
};
