// update.jsx
// Função para executar o update do projeto Legenda

function executarUpdate(t) {
    try {
        var currentDir = File($.fileName).parent.fsName;
        // Verificar se o Git está instalado
        var checkGitFile = new File(currentDir + "/check_git.bat");
        if (checkGitFile.open('w')) {
            checkGitFile.write("@echo off\n");
            checkGitFile.write("git --version > git_check.txt 2>&1\n");
            checkGitFile.write("exit\n");
            checkGitFile.close();
            checkGitFile.execute();
            $.sleep(1000);
            var gitCheckFile = new File(currentDir + "/git_check.txt");
            if (gitCheckFile.exists) {
                gitCheckFile.open('r');
                var gitCheck = gitCheckFile.read();
                gitCheckFile.close();
                gitCheckFile.remove();
                checkGitFile.remove();
                if (gitCheck.indexOf("git version") === -1) {
                    if (ui && ui.mostrarAlertaPersonalizado) {
                        ui.mostrarAlertaPersonalizado(t("gitNaoInstalado"), "Git Não Encontrado");
                    } else {
                        alert(t("gitNaoInstalado"));
                    }
                    return;
                }
            }
        }
        // Criar arquivo .bat para Windows
        var scriptFile = new File(currentDir + "/update_script.bat");
        if (scriptFile.open('w')) {
            scriptFile.write("@echo off\n");
            scriptFile.write("cd /d \"" + currentDir + "\"\n");
            scriptFile.write("del /f /q temp_log.txt update_log.txt 2>nul\n");
            scriptFile.write("git config --global --add safe.directory \"%CD%\" > update_log.txt\n");
            scriptFile.write("git fetch origin main >> update_log.txt\n");
            scriptFile.write("git checkout -f origin/main >> update_log.txt 2>&1\n");
            scriptFile.write("git clean -fd >> update_log.txt\n");
            scriptFile.write("exit\n");
            scriptFile.close();
        }
        if (scriptFile.exists) {
            if (scriptFile.execute()) {
                $.sleep(2000);
                var logFile = new File(currentDir + "/update_log.txt");
                if (logFile.exists) {
                    logFile.open('r');
                    var logContent = logFile.read();
                    logFile.close();
                    
                    // Usar a janela personalizada nova e adicionar callback para reiniciar
                    if (ui && ui.mostrarAlertaPersonalizado) {
                        ui.mostrarAlertaPersonalizado(
                            t("atualizacaoSucesso") + "\n\nO script será reiniciado automaticamente.",
                            "Atualização Concluída",
                            function() {
                                reiniciarScript();
                            }
                        );
                    } else {
                        alert(t("atualizacaoSucesso"));
                        reiniciarScript();
                    }
                    scriptFile.remove();
                }
            }
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
        if (typeof janela !== 'undefined' && janela && janela.close) {
            janela.close();
        }
        
        // Aguardar um pouco para garantir que a janela foi fechada
        $.sleep(500);
        
        // Executar o script novamente
        var scriptPath = File($.fileName).fsName;
        var novoScript = new File(scriptPath);
        
        if (novoScript.exists) {
            // Usar evalFile para recarregar o script
            $.evalFile(novoScript);
        } else {
            if (ui && ui.mostrarAlertaPersonalizado) {
                ui.mostrarAlertaPersonalizado("Arquivo do script não encontrado para reinicialização", "Erro");
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
                "Atualização concluída com sucesso, mas houve um erro ao reiniciar automaticamente.\n\nPor favor, execute o script manualmente.", 
                "Reinicialização Manual Necessária"
            );
        } else {
            alert("Atualização concluída. Por favor, execute o script manualmente.");
        }
    }
}

// Exportar funções para o escopo global
$.global.executarUpdate = executarUpdate;
$.global.reiniciarScript = reiniciarScript; 