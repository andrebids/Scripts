/**
 * bootstrap.jsx
 *
 * Responsável pelo arranque da aplicação principal:
 * - inicialização do sistema
 * - criação da janela principal
 * - gestão do estado de observações por documento
 */

function bootstrapInicializarSistema() {
    return inicializacao.inicializarSistema();
}

function bootstrapCriarJanelaPrincipal() {
    var janela = new Window("palette", t("tituloJanela"), undefined);

    $.global.janelaScript = janela;
    janela.orientation = "column";
    janela.alignChildren = ["fill", "top"];
    janela.spacing = 10;
    janela.margins = 16;

    janela.addEventListener("close", function() {
        if ($.global.appState && $.global.appState.limparEstadoRuntimeLegenda) {
            $.global.appState.limparEstadoRuntimeLegenda();
        }
        $.global.componentesObservacoes = null;
        $.global.janelaScript = null;
        $.global.legendaEstadoObs = null;
        return true;
    });

    if (janela.closeButton) {
        janela.closeButton.onClick = function() {
            janela.close();
        };
    }

    return janela;
}

function bootstrapObterChaveDocumentoAtivo() {
    try {
        if (app && app.documents && app.documents.length > 0 && app.activeDocument) {
            var doc = app.activeDocument;
            try {
                if (doc.fullName) {
                    return doc.fullName.fsName;
                }
            } catch (e1) {}
            return doc.name || "";
        }
    } catch (e2) {}

    return "";
}

function bootstrapSincronizarObservacoesComDocumento(campoObs) {
    var chaveAtual = bootstrapObterChaveDocumentoAtivo();

    if (!$.global.legendaEstadoObs) {
        $.global.legendaEstadoObs = {
            chaveDocumento: chaveAtual,
            ultimoTexto: campoObs ? campoObs.text : ""
        };
        return;
    }

    var estado = $.global.legendaEstadoObs;
    if (estado.chaveDocumento !== chaveAtual) {
        if (campoObs && campoObs.text === estado.ultimoTexto) {
            campoObs.text = "";
        }
        estado.chaveDocumento = chaveAtual;
    }

    estado.ultimoTexto = campoObs ? campoObs.text : "";
}

function bootstrapPrepararEstadoObservacoes() {
    var chaveAtual = bootstrapObterChaveDocumentoAtivo();

    if (!$.global.legendaEstadoObs) {
        $.global.legendaEstadoObs = {
            chaveDocumento: chaveAtual,
            ultimoTexto: ""
        };
        return;
    }

    if ($.global.legendaEstadoObs.chaveDocumento !== chaveAtual) {
        $.global.legendaEstadoObs = {
            chaveDocumento: chaveAtual,
            ultimoTexto: ""
        };
    }
}

$.global.bootstrap = {
    inicializarSistema: bootstrapInicializarSistema,
    criarJanelaPrincipal: bootstrapCriarJanelaPrincipal,
    obterChaveDocumentoAtivo: bootstrapObterChaveDocumentoAtivo,
    sincronizarObservacoesComDocumento: bootstrapSincronizarObservacoesComDocumento,
    prepararEstadoObservacoes: bootstrapPrepararEstadoObservacoes
};
