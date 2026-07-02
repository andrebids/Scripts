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
    var launcher = new File(pastaUpdater.fsName + "/launch_" + runId + ".bat");
    var conteudo = [
        "@echo off",
        "call \"" + runnerFile.fsName + "\" \"" + projectDir + "\" \"" + runId + "\" \"" + statusFile.fsName + "\" \"" + logFile.fsName + "\""
    ].join("\r\n");

    if (!escreverArquivoTexto(launcher, conteudo)) {
        throw new Error("Não foi possível criar o launcher do update: " + launcher.fsName);
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
        mensagem += "\n\nFeche e abra o script novamente.";
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

function executarUpdate(t) {
    try {
        var projectDir = obterDiretorioProjeto();
        var runnerFile = new File(projectDir + "/infrastructure/update_runner.bat");

        if (!runnerFile.exists) {
            mostrarAlertaUpdate(
                "Arquivo de update não encontrado: " + runnerFile.fsName,
                "Erro na Atualização"
            );
            return;
        }

        var pastaUpdater = obterPastaUpdater();
        var runId = criarRunId();
        var statusFile = new File(pastaUpdater.fsName + "/status_" + runId + ".json");
        var logFile = new File(pastaUpdater.fsName + "/update_" + runId + ".log");
        var launcher = criarLauncherUpdate(pastaUpdater, runnerFile, projectDir, runId, statusFile, logFile);

        removerArquivoSeExistir(statusFile);

        if (!launcher.execute()) {
            throw new Error("Não foi possível iniciar o update_runner.bat");
        }

        var timeoutMs = 20000;
        var intervaloMs = 500;
        var aguardadoMs = 0;
        var status = null;

        while (aguardadoMs < timeoutMs) {
            $.sleep(intervaloMs);
            aguardadoMs += intervaloMs;

            if (statusFile.exists) {
                status = lerStatusUpdate(statusFile);
                if (status && estadoUpdateFinalizado(status.state)) {
                    break;
                }
            }
        }

        if (!status) {
            mostrarAlertaUpdate(
                "Atualização iniciada em segundo plano.\n\nAinda não foi possível ler o estado do update.\n\nLog: " + logFile.fsName,
                "Atualização em Progresso"
            );
            return;
        }

        if (!estadoUpdateFinalizado(status.state)) {
            var progresso = "Atualização ainda em execução em segundo plano.";
            if (status.filesDownloaded || status.filesTotal) {
                progresso += "\n\nDownload: " + (status.filesDownloaded || 0) + "/" + (status.filesTotal || 0);
            }
            if (status.filesCopied) {
                progresso += "\nCópia: " + status.filesCopied + "/" + (status.filesTotal || 0);
            }
            progresso += "\n\nLog: " + logFile.fsName;
            mostrarAlertaUpdate(progresso, "Atualização em Progresso");
            return;
        }

        var resultado = mensagemEstadoUpdate(status, t);
        mostrarAlertaUpdate(
            resultado.mensagem,
            resultado.titulo,
            resultado.fecharJanela ? function() {
                fecharJanelaPrincipalAposUpdate();
            } : null
        );

    } catch (e) {
        mostrarAlertaUpdate(t("erroAtualizacao") + ": " + e, "Erro na Atualização");
    }
}

function fecharJanelaPrincipalAposUpdate() {
    try {
        if ($.global.janelaScript && $.global.janelaScript.close) {
            $.global.janelaScript.close();
            $.global.janelaScript = null;
        }
    } catch (e) {}
}

/**
 * Função para reiniciar o script após o update
 */
function reiniciarScript() {
    try {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Iniciando reinicialização do script", logs.TIPOS_LOG ? logs.TIPOS_LOG.INFO : "INFO");
        }
        
        // Fechar janela principal se existir
        if ($.global.janelaScript && $.global.janelaScript.close) {
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Fechando janela principal", logs.TIPOS_LOG ? logs.TIPOS_LOG.INFO : "INFO");
            }
            $.global.janelaScript.close();
            $.global.janelaScript = null;
        }
        
        // Aguardar um pouco para garantir que a janela foi fechada
        $.sleep(1000);
        
        // Executar o script novamente
        var projectDir = obterDiretorioProjeto();
        var scriptPath = projectDir + "/script.jsx";
        var novoScript = new File(scriptPath);
        
        if (novoScript.exists) {
            if (logs && logs.adicionarLog) {
                logs.adicionarLog("Reiniciando script: " + scriptPath, logs.TIPOS_LOG ? logs.TIPOS_LOG.INFO : "INFO");
            }
            
            // Método mais confiável de reinício
            try {
                // Log do caminho completo para debugging
                if (logs && logs.adicionarLog) {
                    logs.adicionarLog("Caminho completo do script: " + novoScript.fsName, logs.TIPOS_LOG ? logs.TIPOS_LOG.INFO : "INFO");
                }
                
                // Aguardar mais tempo para garantir que o arquivo foi atualizado
                $.sleep(500);
                
                // Tentar recarregar o script
                $.evalFile(novoScript);
                
                if (logs && logs.adicionarLog) {
                    logs.adicionarLog("Script reiniciado com sucesso", logs.TIPOS_LOG ? logs.TIPOS_LOG.INFO : "INFO");
                }
                
            } catch (evalError) {
                if (logs && logs.adicionarLog) {
                    logs.adicionarLog("Erro ao executar $.evalFile: " + evalError.message, logs.TIPOS_LOG ? logs.TIPOS_LOG.ERROR : "ERROR");
                }
                
                // Fallback: mostrar mensagem para reinício manual
                if (ui && ui.mostrarAlertaPersonalizado) {
                    ui.mostrarAlertaPersonalizado(
                        "Atualização concluída com sucesso!\n\nPor favor, execute o script manualmente para carregar a nova versão.\n\nDetalhes: " + evalError.message, 
                        "Reinício Manual Necessário"
                    );
                } else {
                    alert("Atualização concluída! Por favor, execute o script manualmente.\nErro: " + evalError.message);
                }
            }
        } else {
            if (ui && ui.mostrarAlertaPersonalizado) {
                ui.mostrarAlertaPersonalizado("Arquivo do script não encontrado para reinicialização: " + scriptPath, "Erro");
            } else {
                alert("Arquivo do script não encontrado para reinicialização");
            }
        }
        
    } catch (e) {
        if (logs && logs.adicionarLog) {
            logs.adicionarLog("Erro ao reiniciar script: " + e.message, logs.TIPOS_LOG ? logs.TIPOS_LOG.ERROR : "ERROR");
        }
        
        if (ui && ui.mostrarAlertaPersonalizado) {
            ui.mostrarAlertaPersonalizado(
                "Atualização concluída com sucesso, mas houve um erro ao reiniciar automaticamente.\n\nPor favor, execute o script manualmente.\n\nErro: " + e.message, 
                "Reinicialização Manual Necessária"
            );
        } else {
            alert("Atualização concluída. Por favor, execute o script manualmente.\nErro: " + e.message);
        }
    }
}

// Exportar funções para o escopo global
$.global.executarUpdate = executarUpdate;
$.global.reiniciarScript = reiniciarScript; 
