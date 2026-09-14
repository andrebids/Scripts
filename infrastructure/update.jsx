// update.jsx
// Função para executar o update do projeto Legenda

function lerConteudoArquivo(arquivo) {
    try {
        if (!arquivo || !arquivo.exists) {
            return "";
        }
        if (arquivo.open('r')) {
            var conteudo = arquivo.read();
            arquivo.close();
            return conteudo;
        }
    } catch (e) {}
    return "";
}

function removerArquivoSeExistir(arquivo) {
    try {
        if (arquivo && arquivo.exists) {
            arquivo.remove();
        }
    } catch (e) {}
}

function obterUltimasLinhas(texto, maxLinhas) {
    if (!texto) {
        return "";
    }
    var linhas = texto.split(/\r?\n/);
    if (linhas.length <= maxLinhas) {
        return texto;
    }
    return linhas.slice(linhas.length - maxLinhas).join("\n");
}

function obterDiretorioProjeto() {
    try {
        var arquivoAtual = new File($.fileName);
        var pastaAtual = arquivoAtual.parent;
        if (pastaAtual && pastaAtual.name && pastaAtual.name.toLowerCase() === "infrastructure") {
            return pastaAtual.parent.fsName;
        }
        return pastaAtual.fsName;
    } catch (e) {
        return File($.fileName).parent.fsName;
    }
}

function criarPastaRecursiva(pasta) {
    try {
        if (!pasta) {
            return false;
        }
        if (pasta.exists) {
            return true;
        }
        if (pasta.parent && !pasta.parent.exists) {
            criarPastaRecursiva(pasta.parent);
        }
        return pasta.create();
    } catch (e) {
        return false;
    }
}

function obterPastaUpdater() {
    var base = "";
    try {
        base = $.getenv("LOCALAPPDATA");
    } catch (e) {}

    if (!base) {
        base = Folder.temp.fsName;
    }

    var pasta = new Folder(base + "/Legenda/Updater");
    if (!criarPastaRecursiva(pasta)) {
        pasta = new Folder(Folder.temp.fsName + "/Legenda/Updater");
        criarPastaRecursiva(pasta);
    }
    return pasta;
}

function doisDigitos(valor) {
    return valor < 10 ? "0" + valor : "" + valor;
}

function criarRunId() {
    var data = new Date();
    return "run_" +
        data.getFullYear() +
        doisDigitos(data.getMonth() + 1) +
        doisDigitos(data.getDate()) + "_" +
        doisDigitos(data.getHours()) +
        doisDigitos(data.getMinutes()) +
        doisDigitos(data.getSeconds()) + "_" +
        Math.floor(Math.random() * 100000);
}

function escreverArquivoTexto(arquivo, conteudo) {
    if (!arquivo.open("w")) {
        return false;
    }
    arquivo.write(conteudo);
    arquivo.close();
    return true;
}

function criarLauncherUpdate(pastaUpdater, runnerFile, projectDir, runId, statusFile, logFile) {
    // WScript launches the existing runner hidden, including its console child.
    var launcher = new File(pastaUpdater.fsName + "/launch_" + runId + ".vbs");
    var command = 'cmd.exe /d /s /c ""' + runnerFile.fsName + '" "' + projectDir +
        '" "' + runId + '" "' + statusFile.fsName + '" "' + logFile.fsName + '""';
    var conteudo = 'CreateObject("WScript.Shell").Run "' + command.replace(/"/g, '""') + '", 0, False';
    if (!escreverArquivoTexto(launcher, conteudo)) {
        throw new Error("Não foi possível criar o launcher: " + launcher.fsName);
    }
    return launcher;
}

function parsearJSONSeguro(texto) {
    if (!texto) {
        return null;
    }

    texto = texto.replace(/^\uFEFF/, "");

    try {
        if (typeof JSON !== "undefined" && JSON.parse) {
            return JSON.parse(texto);
        }
    } catch (e1) {}

    try {
        if (typeof parseJSON === "function") {
            return parseJSON(texto);
        }
    } catch (e2) {}

    return null;
}

function lerStatusUpdate(statusFile) {
    var conteudo = lerConteudoArquivo(statusFile);
    return parsearJSONSeguro(conteudo);
}

function estadoUpdateFinalizado(estado) {
    return estado &&
        estado !== "RUNNING" &&
        estado !== "ELEVATING" &&
        estado !== "DOWNLOADING" &&
        estado !== "COPYING";
}

function mostrarAlertaUpdate(mensagem, titulo, callback) {
    if (ui && ui.mostrarAlertaPersonalizado) {
        ui.mostrarAlertaPersonalizado(mensagem, titulo, callback);
    } else {
        alert(mensagem);
        if (typeof callback === "function") {
            callback();
        }
    }
}

function anexarDetalhesVersao(mensagem, status) {
    if (status.localVersion || status.remoteVersion || status.installedVersion) {
        mensagem += "\n\n";
        if (status.localVersion) {
            mensagem += "Versão local anterior: " + status.localVersion + "\n";
        }
        if (status.remoteVersion) {
            mensagem += "Versão remota: " + status.remoteVersion + "\n";
        }
        if (status.installedVersion) {
            mensagem += "Versão instalada: " + status.installedVersion + "\n";
        }
    }
    return mensagem;
}

function anexarLog(mensagem, status) {
    if (status && status.logPath) {
        mensagem += "\n\nLog: " + status.logPath;
    }
    return mensagem;
}

function mensagemEstadoUpdate(status, t) {
    var estado = status && status.state ? status.state : "FAILED";
    var mensagem = "";
    var titulo = "Atualização";
    var fecharJanela = false;

    if (estado === "UPDATED") {
        titulo = "Atualização Concluída";
        mensagem = "Atualização concluída com sucesso.";
        mensagem = anexarDetalhesVersao(mensagem, status);
        if (status.filesCopied || status.filesTotal) {
            mensagem += "\nFicheiros copiados: " + (status.filesCopied || 0) + "/" + (status.filesTotal || 0);
        }
        mensagem += "\n\n" + t("updateConcluido");
        fecharJanela = true;
    } else if (estado === "ALREADY_CURRENT") {
        titulo = "Script Atualizado";
        mensagem = t("scriptAtualizado");
        mensagem = anexarDetalhesVersao(mensagem, status);
    } else if (estado === "NEEDS_PERMISSION") {
        titulo = "Permissões Necessárias";
        mensagem = "Não foi possível atualizar porque a pasta atual do Illustrator não tem permissão de escrita.";
        if (status.folder) {
            mensagem += "\n\nPasta: " + status.folder;
        }
        mensagem += "\n\nExecute o Illustrator como administrador ou ajuste as permissões da pasta.";
        mensagem = anexarDetalhesVersao(mensagem, status);
    } else if (estado === "ELEVATION_FAILED") {
        titulo = "Permissão Não Concedida";
        mensagem = "A atualização precisa de autorização do Windows para alterar a pasta do Illustrator.";
        mensagem += "\n\nTente novamente e aceite o pedido de permissão de administrador.";
        mensagem = anexarDetalhesVersao(mensagem, status);
    } else if (estado === "MISSING_POWERSHELL") {
        titulo = "PowerShell Não Encontrado";
        mensagem = "Não foi possível atualizar porque o PowerShell não está disponível neste computador.";
    } else if (estado === "MISSING_UPDATER") {
        titulo = "Updater Não Encontrado";
        mensagem = "O ficheiro interno do updater não foi encontrado.";
    } else if (estado === "DOWNLOAD_FAILED") {
        titulo = "Erro no Download";
        mensagem = "Não foi possível descarregar o projeto do GitHub.";
        if (status.failedFile) {
            mensagem += "\n\nFicheiro: " + status.failedFile;
        }
        mensagem = anexarDetalhesVersao(mensagem, status);
    } else if (estado === "INVALID_PACKAGE") {
        titulo = "Projeto Inválido";
        mensagem = "O projeto descarregado está incompleto ou não corresponde à versão remota.";
        if (status.missingFile) {
            mensagem += "\n\nFicheiro em falta: " + status.missingFile;
        }
        mensagem = anexarDetalhesVersao(mensagem, status);
    } else if (estado === "COPY_FAILED") {
        titulo = "Erro ao Copiar";
        mensagem = "Os ficheiros foram descarregados, mas a cópia para a pasta do Illustrator falhou.";
        if (status.failedFile) {
            mensagem += "\n\nFicheiro: " + status.failedFile;
        }
        mensagem += "\n\nVerifique permissões ou execute o Illustrator como administrador.";
        mensagem = anexarDetalhesVersao(mensagem, status);
    } else {
        titulo = "Erro na Atualização";
        mensagem = t("erroAtualizacao");
        if (status && status.message) {
            mensagem += "\n\n" + status.message;
        }
    }

    mensagem = anexarLog(mensagem, status);
    return {
        titulo: titulo,
        mensagem: mensagem,
        fecharJanela: fecharJanela
    };
}

function atualizarLayoutUpdate(janela) {
    // Illustrator paints a black background if update() follows a visible-window relayout.
    var visivel = janela.visible;
    if (visivel) { janela.hide(); }
    try {
        janela.layout.layout(true);
    } finally {
        if (visivel) { janela.show(); }
    }
}

function criarInterfaceUpdate(janela, botao, t) {
    botao.helpTip = t("updateAvisoReinicio");
    var painel = janela.add("group");
    painel.orientation = "column";
    painel.alignChildren = ["fill", "top"];
    painel.spacing = 4;
    painel.margins = 0;
    painel.visible = false;
    painel.maximumSize.height = 0;
    var linha = painel.add("group");
    linha.orientation = "row";
    linha.alignChildren = ["left", "center"];
    linha.spacing = 8;
    var texto = linha.add("statictext", undefined, "");
    texto.alignment = ["fill", "center"];
    texto.preferredSize.width = 300;
    var barra = linha.add("progressbar", undefined, 0, 100);
    barra.preferredSize = [100, 10];
    var acao = linha.add("button", undefined, t("updateRepetir"));
    var detalhes = linha.add("button", undefined, t("updateDetalhes"));
    var campo = painel.add("edittext", undefined, "", {multiline: true, readonly: true, scrolling: true});
    campo.preferredSize.height = 64;
    campo.visible = false;
    campo.maximumSize.height = 0;
    detalhes.onClick = function() {
        campo.visible = !campo.visible;
        campo.maximumSize.height = campo.visible ? 64 : 0;
        detalhes.text = t(campo.visible ? "updateOcultarDetalhes" : "updateDetalhes");
        atualizarLayoutUpdate(janela);
    };
    var view = {painel: painel, texto: texto, barra: barra, acao: acao,
        campo: campo, botao: botao, running: false, pending: false,
        scriptFile: new File(obterDiretorioProjeto() + "/script.jsx")};
    janela.updateView = view;
    var onClose = janela.onClose;
    janela.onClose = function() {
        if (view.running || view.pending) { return false; }
        return onClose ? onClose.call(janela) : true;
    };
    return view;
}

function apresentarProgressoUpdate(status, t) {
    var state = status ? status.state : "RUNNING";
    var total = Number(status && status.filesTotal) || 0;
    var count = Number(status && (state === "COPYING" ? status.filesCopied : status.filesDownloaded)) || 0;
    var key = state === "COPYING" ? "updateInstalar" :
        state === "DOWNLOADING" ? (status.phase === "EXTRACTING" ? "updateDescompactar" : "updateDownload") :
        state === "ELEVATING" ? "updatePermissao" : "updateVerificar";
    return {texto: t(key) + (total && (state === "COPYING" || state === "DOWNLOADING") ?
        " — " + count + "/" + total : ""), percent: total ? Math.min(100, Math.max(0, count / total * 100)) : 0};
}

function executarUpdate(t) {
    var janela = $.global.janelaScript;
    var view = janela && janela.updateView;
    if (!view || view.running || view.updated) { return; }
    var bloqueados = view.bloqueados || [];
    view.bloqueados = bloqueados;
    try {
        // Cache translated copy before the updater can replace files on disk.
        var traducoes = {};
        var keys = ["updateVerificar", "updateDownload", "updateDescompactar", "updateInstalar", "updatePermissao",
            "updateConcluido", "updateReabrir", "updateReinicioManual", "updateTitulo", "updateAvisoReinicio",
            "updateRepetir", "updateAcompanhar", "updateSemEstado",
            "updateErro", "scriptAtualizado", "erroAtualizacao"];
        for (var k = 0; k < keys.length; k++) { traducoes[keys[k]] = t(keys[k]); }
        var traduzir = function(key) { return traducoes[key] || key; };
        view.running = true;
        view.botao.enabled = false;
        view.acao.visible = false;
        view.acao.maximumSize.width = 0;
        view.barra.maximumSize.width = 100;
        view.painel.visible = true;
        view.painel.maximumSize.height = 1000;
        for (var i = 0; i < janela.children.length; i++) {
            var child = janela.children[i];
            if (child !== view.painel && !view.pending) {
                bloqueados.push({control: child, enabled: child.enabled});
                child.enabled = false;
            }
        }
        view.texto.text = traduzir("updateVerificar");
        atualizarLayoutUpdate(janela);
        janela.update();
        if (!view.pending) {
            var projectDir = view.scriptFile.parent.fsName;
            var runnerFile = new File(projectDir + "/infrastructure/update_runner.bat");
            if (!runnerFile.exists) { throw new Error("Updater: " + runnerFile.fsName); }
            var pastaUpdater = obterPastaUpdater();
            var runId = criarRunId();
            view.statusFile = new File(pastaUpdater.fsName + "/status_" + runId + ".json");
            view.logFile = new File(pastaUpdater.fsName + "/update_" + runId + ".log");
            var launcher = criarLauncherUpdate(pastaUpdater, runnerFile, projectDir, runId, view.statusFile, view.logFile);
            if (!launcher.execute()) { throw new Error("Launcher: " + launcher.fsName); }
            view.pending = true;
        }
        view.campo.text = "Log: " + view.logFile.fsName;
        var ultimoTexto = "";
        var ultimaMudanca = new Date().getTime();
        var status = null;
        while (true) {
            var raw = lerConteudoArquivo(view.statusFile);
            var lido = parsearJSONSeguro(raw);
            if (lido && lido.state) {
                status = lido;
                if (raw !== ultimoTexto) { ultimaMudanca = new Date().getTime(); ultimoTexto = raw; }
                if (estadoUpdateFinalizado(status.state)) { break; }
            }
            var progresso = apresentarProgressoUpdate(status, traduzir);
            view.texto.text = progresso.texto;
            view.texto.helpTip = progresso.texto;
            view.barra.value = progresso.percent;
            view.barra.visible = !!(status && status.filesTotal);
            janela.update();
            // No false failure and no duplicate install if a worker stops reporting.
            if (new Date().getTime() - ultimaMudanca > 600000) {
                view.texto.text = traduzir("updateSemEstado");
                view.acao.text = traduzir("updateAcompanhar");
                view.acao.onClick = function() { executarUpdate(t); };
                return;
            }
            $.sleep(250);
        }
        view.pending = false;
        var updated = status.state === "UPDATED";
        view.updated = updated;
        var current = status.state === "ALREADY_CURRENT";
        view.texto.text = traduzir(updated ? "updateConcluido" : current ? "scriptAtualizado" : "updateErro");
        view.barra.value = updated || current ? 100 : 0;
        view.barra.visible = false;
        view.barra.maximumSize.width = 0;
        view.campo.text = mensagemEstadoUpdate(status, traduzir).mensagem;
        view.acao.text = traduzir(updated ? "updateReabrir" : "updateRepetir");
        view.acao.onClick = updated ? function() { reiniciarScript(view.scriptFile, traduzir); } : function() { executarUpdate(t); };
        view.botao.enabled = !updated;
    } catch (e) {
        view.texto.text = t("updateErro");
        view.campo.text = String(e) + (view.logFile ? "\nLog: " + view.logFile.fsName : "");
        view.acao.text = t(view.pending ? "updateAcompanhar" : "updateRepetir");
        view.acao.onClick = function() { executarUpdate(t); };
    } finally {
        view.running = false;
        view.acao.visible = !(status && status.state === "ALREADY_CURRENT");
        view.acao.maximumSize.width = view.acao.visible ? 1000 : 0;
        if (!view.pending) {
            for (var j = 0; j < bloqueados.length; j++) {
                bloqueados[j].control.enabled = bloqueados[j].enabled;
            }
            view.bloqueados = null;
            view.botao.enabled = !(status && status.state === "UPDATED");
        }
        view.texto.helpTip = view.texto.text;
        atualizarLayoutUpdate(janela);
    }
    // Reload only after finally has released the close guard and finished using the old UI.
    if (view.updated) { reiniciarScript(view.scriptFile, traduzir); }
}

// The caller captures the file and translated messages before replacing files on disk.
function reiniciarScript(scriptFile, traduzir) {
    try {
        if (!scriptFile || !scriptFile.exists) { throw new Error(String(scriptFile)); }
        var janela = $.global.janelaScript;
        if (janela && janela.close && janela.close() === false) {
            throw new Error(traduzir("updateReabrir"));
        }
        $.global.janelaScript = null;
        $.evalFile(scriptFile);
        if (!$.global.janelaScript) { throw new Error(traduzir("updateReabrir")); }
        return true;
    } catch (e) {
        alert(traduzir("updateReinicioManual") + "\n\n" + String(e), traduzir("updateTitulo"));
        return false;
    }
}

// Exportar funções para o escopo global
$.global.executarUpdate = executarUpdate;
$.global.reiniciarScript = reiniciarScript; 
