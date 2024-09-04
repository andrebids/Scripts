#target illustrator

function executarGitPull() {
    var pastaScript = File($.fileName).path;
    var comando = "cd \"" + pastaScript + "\" && git pull";

    try {
        var resultado = system(comando);
        if (resultado === 0) {
            alert("Atualização concluída com sucesso. Por favor, reinicie o script.");
        } else {
            throw new Error("O comando git pull retornou um código de erro: " + resultado);
        }
    } catch (e) {
        alert("Erro ao executar git pull: " + e.message + "\nCertifique-se de que o Git está instalado e configurado corretamente.");
    }
}

executarGitPull();