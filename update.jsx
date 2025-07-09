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
                    alert(t("gitNaoInstalado"));
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
                    alert(t("atualizacaoSucesso"));
                    scriptFile.remove();
                }
            }
        }
    } catch (e) {
        alert(t("erroAtualizacao") + ": " + e);
    }
} 