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

function executarUpdate(t) {
    try {
        var currentDir = File($.fileName).parent.fsName;
        var runnerFile = new File(currentDir + "/infrastructure/update_runner.bat");
        var logFile = new File(currentDir + "/update_log.txt");
        var statusFile = new File(currentDir + "/update_status.txt");
        var lockFile = new File(currentDir + "/update_running.lock");

        if (!runnerFile.exists) {
            var erroRunner = "Arquivo de update não encontrado: " + runnerFile.fsName;
            if (ui && ui.mostrarAlertaPersonalizado) {
                ui.mostrarAlertaPersonalizado(erroRunner, "Erro na Atualização");
            } else {
                alert(erroRunner);
            }
            return;
        }

        removerArquivoSeExistir(statusFile);
        removerArquivoSeExistir(lockFile);

        if (!runnerFile.execute()) {
            throw new Error("Não foi possível iniciar o update_runner.bat");
        }

        var timeoutMs = 600000; // 10 minutos
        var intervaloMs = 500;
        var aguardadoMs = 0;

        while (aguardadoMs < timeoutMs) {
            $.sleep(intervaloMs);
            aguardadoMs += intervaloMs;

            if (statusFile.exists && !lockFile.exists) {
                break;
            }
        }

        if (!statusFile.exists) {
            throw new Error("Timeout ao aguardar update. Consulte update_log.txt para detalhes.");
        }

        var status = lerConteudoArquivo(statusFile);
        var logContent = lerConteudoArquivo(logFile);
        var sucesso = status && status.indexOf("OK") === 0;

        if (sucesso) {
            if (ui && ui.mostrarAlertaPersonalizado) {
                ui.mostrarAlertaPersonalizado(
                    t("atualizacaoSucesso") + "\n\nUpdate sincronizado para as instalações do Illustrator encontradas.\nO script será reiniciado automaticamente.",
                    "Atualização Concluída",
                    function() {
                        reiniciarScript();
                    }
                );
            } else {
                alert(t("atualizacaoSucesso"));
                reiniciarScript();
            }
            return;
        }

        var statusLimpo = status ? status.replace(/\r?\n/g, " ").replace(/\s+/g, " ") : "ERROR";
        var resumoLog = obterUltimasLinhas(logContent, 14);
        var mensagemErro = t("erroAtualizacao") + " (" + statusLimpo + ").";
        if (resumoLog) {
            mensagemErro += "\n\n" + resumoLog;
        }

        if (ui && ui.mostrarAlertaPersonalizado) {
            ui.mostrarAlertaPersonalizado(mensagemErro, "Erro na Atualização");
        } else {
            alert(mensagemErro);
        }

    } catch (e) {
        if (ui && ui.mostrarAlertaPersonalizado) {
            ui.mostrarAlertaPersonalizado(t("erroAtualizacao") + ": " + e, "Erro na Atualização");
        } else {
            alert(t("erroAtualizacao") + ": " + e);
        }
    }
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
        var scriptPath = File($.fileName).fsName;
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
